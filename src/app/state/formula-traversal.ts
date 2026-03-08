import { LTLNode } from '../core/ltl-evaluator';

/**
 * Counts the total number of proposition nodes in an LTL formula tree.
 * @param node - The root node of the LTL formula
 * @returns The count of proposition nodes
 */
export function getPropositionCount(node: LTLNode): number {
  let count = 0;
  const countNode = (n: LTLNode) => {
    if (n.type === 'PROPOSITION') count++;
    if (n.children) n.children.forEach(countNode);
  };
  countNode(node);
  return count;
}

/**
 * Retrieves the proposition variable at a specific index in the formula.
 * @param node - The root node of the LTL formula
 * @param targetIndex - The zero-based index of the proposition to retrieve
 * @returns The variable name, or 'p' if not found
 */
export function getPropositionAtIndex(node: LTLNode, targetIndex: number): string {
  let currentIndex = 0;
  let result = '';
  
  const findNode = (n: LTLNode): void => {
    if (result) return;
    if (n.type === 'PROPOSITION') {
      if (currentIndex === targetIndex) {
        result = n.variableId || '';
      }
      currentIndex++;
      return;
    }
    if (n.children) n.children.forEach(findNode);
  };
  
  findNode(node);
  return result || 'p';
}

/**
 * Updates a proposition at a specific index with a new variable name.
 * @param node - The root node of the LTL formula
 * @param newVar - The new variable name
 * @param targetIndex - The zero-based index of the proposition to update
 * @returns A new formula node with the updated proposition
 */
export function updatePropositionAtNode(
  node: LTLNode,
  newVar: string,
  targetIndex: number
): LTLNode {
  let currentIndex = 0;
  
  const updateNode = (n: LTLNode): LTLNode => {
    if (n.type === 'PROPOSITION') {
      if (currentIndex === targetIndex) {
        currentIndex++;
        return { ...n, variableId: newVar };
      }
      currentIndex++;
      return n;
    }
    if (n.children && n.children.length > 0) {
      return { ...n, children: n.children.map(c => updateNode(c)) };
    }
    return n;
  };
  
  return updateNode(node);
}

/**
 * Finds the path to a proposition at a specific index for deletion operations.
 * @param node - The root node of the LTL formula
 * @param targetIndex - The zero-based index of the proposition to find
 * @returns An array of {node, childIndex} pairs representing the path, or empty if not found
 */
export function findPathToProposition(
  node: LTLNode,
  targetIndex: number
): { node: LTLNode; childIndex: number }[] {
  const path: { node: LTLNode; childIndex: number }[] = [];
  let currentIndex = 0;
  
  const findPath = (n: LTLNode): boolean => {
    if (n.type === 'PROPOSITION') {
      if (currentIndex === targetIndex) {
        return true;
      }
      currentIndex++;
      return false;
    }
    if (n.children) {
      for (let i = 0; i < n.children.length; i++) {
        path.push({ node: n, childIndex: i });
        if (findPath(n.children[i])) return true;
        path.pop();
      }
    }
    return false;
  };
  
  findPath(node);
  return path;
}