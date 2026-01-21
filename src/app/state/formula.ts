import { computed, signal } from '@angular/core';
import { traceVariables } from './trace';
import { LTLNode, Trace } from '../core/ltl-evaluator';

// Let's create a classic LTL scenario: "Eventually q happens"
const initialTrace: Trace = [
  { p: true, q: false }, // t=0
  { p: true, q: false }, // t=1
  { p: false, q: true }, // t=2 (q is finally true!)
  { p: false, q: true }, // t=2 (q is finally true!)
];

const initialFormula: LTLNode = {
  type: 'EVENTUALLY',
  children: [{ type: 'PROPOSITION', variableId: 'q' }],
};

// src/app/core/formula.store.ts

export const currentFormulaString = computed(() => {
  const root = formulaState();

  const stringify = (node: LTLNode): string => {
    switch (node.type) {
      case 'PROPOSITION':
        return node.variableId || '';
      case 'ALWAYS':
        return `□(${stringify(node.children![0])})`;
      case 'EVENTUALLY':
        return `◇(${stringify(node.children![0])})`;
      case 'NEXT':
        return `○(${stringify(node.children![0])})`;
      case 'AND':
        return `(${stringify(node.children![0])} ∧ ${stringify(node.children![1])})`;
      case 'OR':
        return `(${stringify(node.children![0])} ∨ ${stringify(node.children![1])})`;
      case 'UNTIL':
        return `(${stringify(node.children![0])} 𝒰 ${stringify(node.children![1])})`;
      case 'NOT':
        return `¬(${stringify(node.children![0])})`;
      default:
        return '';
    }
  };

  return stringify(root);
});

export const formulaState = signal<LTLNode>(initialFormula);

export const currentTime = signal<number>(0);

export const selectedPropositionIndex = signal<number | null>(null);

export const wrapWholeFormula = signal<boolean>(true);

export function updateProposition(newVar: string, targetIndex?: number) {
  const root = formulaState();
  const target = targetIndex ?? selectedPropositionIndex();

  if (target === null) return;

  let currentIndex = 0;
  const updateNode = (node: LTLNode): LTLNode => {
    if (node.type === 'PROPOSITION') {
      if (currentIndex === target) {
        currentIndex++;
        return { ...node, variableId: newVar };
      }
      currentIndex++;
      return node;
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: node.children.map((c) => updateNode(c)) };
    }
    return node;
  };

  formulaState.set(updateNode(root));
}

export function getPropositionCount(): number {
  let count = 0;
  const countNode = (node: LTLNode) => {
    if (node.type === 'PROPOSITION') count++;
    if (node.children) node.children.forEach(countNode);
  };
  countNode(formulaState());
  return count;
}

export function getPropositionAtIndex(index: number): string {
  let currentIndex = 0;
  let result = '';
  const findNode = (node: LTLNode): void => {
    if (result) return;
    if (node.type === 'PROPOSITION') {
      if (currentIndex === index) {
        result = node.variableId || '';
      }
      currentIndex++;
      return;
    }
    if (node.children) node.children.forEach(findNode);
  };
  findNode(formulaState());
  return result || 'p';
}

export function addBinaryToProposition(type: 'AND' | 'OR' | 'UNTIL') {
  const root = formulaState();
  const targetIndex = selectedPropositionIndex() ?? 0;
  const varName = getPropositionAtIndex(targetIndex);

  let currentIndex = 0;
  const updateNode = (node: LTLNode): LTLNode => {
    if (node.type === 'PROPOSITION') {
      if (currentIndex === targetIndex) {
        selectedPropositionIndex.set(currentIndex + 1);
        return {
          type,
          children: [
            { ...node },
            { type: 'PROPOSITION', variableId: varName }
          ]
        };
      }
      currentIndex++;
      return node;
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: node.children.map((c) => updateNode(c)) };
    }
    return node;
  };

  formulaState.set(updateNode(root));
}

export function wrapFormulaWithBinary(type: 'AND' | 'OR' | 'UNTIL') {
  const current = formulaState();
  const index = selectedPropositionIndex() ?? 0;
  const varName = getPropositionAtIndex(index);
  const oldCount = getPropositionCount();

  formulaState.set({
    type,
    children: [
      current,
      { type: 'PROPOSITION', variableId: varName }
    ],
  });

  selectedPropositionIndex.set(oldCount);
}

export function wrapUntil() {
  const current = formulaState();
  formulaState.set({
    type: 'UNTIL',
    children: [
      current, // Existing formula becomes the "Until" condition
      { type: 'PROPOSITION', variableId: 'q', children: [] }, // Target
    ],
  });
}

export function getHighlightedFormula(): string {
  const root = formulaState();
  const targetIndex = selectedPropositionIndex() ?? 0;
  const isWholeFormula = wrapWholeFormula();
  let currentIndex = 0;

  const stringify = (node: LTLNode): string => {
    switch (node.type) {
      case 'PROPOSITION':
        if (!isWholeFormula && currentIndex === targetIndex) {
          currentIndex++;
          return `<span class="highlighted-prop">${node.variableId || ''}</span>`;
        }
        currentIndex++;
        return node.variableId || '';
      case 'ALWAYS':
        return `□(${stringify(node.children![0])})`;
      case 'EVENTUALLY':
        return `◇(${stringify(node.children![0])})`;
      case 'NEXT':
        return `○(${stringify(node.children![0])})`;
      case 'AND':
        return `(${stringify(node.children![0])} ∧ ${stringify(node.children![1])})`;
      case 'OR':
        return `(${stringify(node.children![0])} ∨ ${stringify(node.children![1])})`;
      case 'UNTIL':
        return `(${stringify(node.children![0])} 𝒰 ${stringify(node.children![1])})`;
      case 'NOT':
        return `¬(${stringify(node.children![0])})`;
      default:
        return '';
    }
  };

  const formula = stringify(root);
  if (isWholeFormula) {
    return `<span class="highlighted-formula">${formula}</span>`;
  }
  return formula;
}

export function removeProposition(targetIndex: number) {
  const root = formulaState();
  const count = getPropositionCount();

  if (count <= 1) {
    formulaState.set({ type: 'PROPOSITION', variableId: 'p', children: [] });
    selectedPropositionIndex.set(0);
    return;
  }

  const path: { node: LTLNode; childIndex: number }[] = [];
  let currentIndex = 0;

  const findPath = (node: LTLNode): boolean => {
    if (node.type === 'PROPOSITION') {
      if (currentIndex === targetIndex) {
        return true;
      }
      currentIndex++;
      return false;
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        path.push({ node, childIndex: i });
        if (findPath(node.children[i])) return true;
        path.pop();
      }
    }
    return false;
  };

  findPath(root);

  if (path.length === 0) {
    formulaState.set({ type: 'PROPOSITION', variableId: 'p', children: [] });
    selectedPropositionIndex.set(0);
    return;
  }

  let result: LTLNode | null = null;

  for (let i = path.length - 1; i >= 0; i--) {
    const { node, childIndex } = path[i];
    const newChildren = [...node.children!];
    newChildren.splice(childIndex, 1);

    if (newChildren.length === 0) {
      if (i === 0) {
        result = null;
      }
    } else if (newChildren.length === 1) {
      const newNode = { ...newChildren[0] };
      if (i === 0) {
        result = newNode;
      } else {
        path[i - 1].node.children![path[i - 1].childIndex] = newNode;
      }
    } else {
      const newNode = { ...node, children: newChildren };
      if (i === 0) {
        result = newNode;
      } else {
        path[i - 1].node.children![path[i - 1].childIndex] = newNode;
      }
    }
  }

  if (result) {
    formulaState.set(result);
    const newCount = getPropositionCount();
    selectedPropositionIndex.set(Math.min(targetIndex, newCount - 1));
  } else {
    formulaState.set({ type: 'PROPOSITION', variableId: 'p', children: [] });
    selectedPropositionIndex.set(0);
  }
}

export function removePropositionsByVarName(varName: string) {
  let removed = false;

  const updateNode = (node: LTLNode): LTLNode | null => {
    if (node.type === 'PROPOSITION') {
      if (node.variableId === varName) {
        removed = true;
        return null;
      }
      return node;
    }

    if (node.children && node.children.length > 0) {
      const newChildren = node.children
        .map((c) => updateNode(c))
        .filter((c): c is LTLNode => c !== null);

      if (newChildren.length === 0) {
        return null;
      }

      if (newChildren.length === 1 && ['ALWAYS', 'EVENTUALLY', 'NEXT', 'NOT'].includes(node.type)) {
        return { ...node, children: newChildren };
      }

      if (newChildren.length === 1) {
        return newChildren[0];
      }

      return { ...node, children: newChildren };
    }

    return node;
  };

  const root = formulaState();
  const result = updateNode(root);

  const vars = traceVariables();
  const firstVar = vars.length > 0 ? vars[0] : 'p';

  if (result) {
    formulaState.set(result);
  } else {
    formulaState.set({ type: 'PROPOSITION', variableId: firstVar, children: [] });
  }

  if (removed) {
    selectedPropositionIndex.set(0);
  }
}
