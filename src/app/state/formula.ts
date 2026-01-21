import { computed, signal } from '@angular/core';
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
