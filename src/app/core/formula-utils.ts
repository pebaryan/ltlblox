import { LTLNode } from './ltl-evaluator';

export interface FlatBlock {
  node: LTLNode;
  position: [number, number, number];
  shape: 'box' | 'unary' | 'binary';
  width: number;
  children: number[];
  childZ?: number[];
  childWidth?: number;
}

export const blockHeight = 0.6;
export const propositionWidth = 0.8;
export const operatorExtendedWidth = 2 * propositionWidth;

export function flattenFormula(
  node: LTLNode,
  x: number,
  y: number,
  z: number,
  list: FlatBlock[] = [],
  parentIndex: number | null = null,
): FlatBlock[] {
  const isUnary = ['ALWAYS', 'EVENTUALLY', 'NEXT', 'NOT'].includes(node.type);
  const isBinary = ['AND', 'OR', 'UNTIL'].includes(node.type);
  const isProposition = node.type === 'PROPOSITION';

  let shape: 'box' | 'unary' | 'binary' = 'box';
  let width = propositionWidth;

  if (isProposition) {
    shape = 'box';
    width = propositionWidth;
  } else if (isUnary || isBinary) {
    shape = node.type === 'PROPOSITION' ? 'box' : isUnary ? 'unary' : 'binary';
    width = operatorExtendedWidth; // base width for operators
  }

  const currentIndex = list.length;
  list.push({
    node,
    position: [x, y, z],
    shape,
    width,
    children: [],
  });

  if (parentIndex !== null) {
    list[parentIndex].children.push(currentIndex);
  }

  if (node.children && node.children.length > 0) {
    const childY = y - blockHeight;

    if (isBinary && node.children.length === 2) {
      const leftZ = z - 0.5 * width;
      const rightZ = z + 0.5 * width;
      flattenFormula(node.children[0], x, childY, z, list, currentIndex);
      flattenFormula(node.children[1], x, childY, z, list, currentIndex);
    } else if (isUnary && node.children.length === 1) {
      flattenFormula(node.children[0], x, childY, z, list, currentIndex);
    } else {
      node.children.forEach((child, index) => {
        const offsetZ = (index - (node.children!.length - 1) / 2) * propositionWidth;
        flattenFormula(child, x, childY, z + offsetZ, list, currentIndex);
      });
    }
  }
  return list;
}

export function calculateBlockWidths(blocks: FlatBlock[]): FlatBlock[] {
  const processed = new Set<number>();
  let startZ: number = 0;

  function processBlock(index: number): number {
    if (processed.has(index)) return 0;
    processed.add(index);

    const block = blocks[index];


    if (block.shape === 'box') {
      block.width = propositionWidth;
      startZ += propositionWidth; // spacing between blocks
      block.position[2] = startZ;
      return propositionWidth;
    }

    if (block.shape === 'unary' || block.shape === 'binary') {
      const childWidths: number[] = [];
      const childZPositions: number[] = [];

      startZ += propositionWidth; // spacing between children
      block.position[2] = startZ;

      block.children.forEach((childIndex) => {
        const childWidth = processBlock(childIndex);
        childWidths.push(blocks[childIndex].width);
        childZPositions.push(blocks[childIndex].position[2]);
      });

      block.childWidth = Math.max(...childWidths);
      block.childZ = childZPositions;

      if (block.shape === 'unary') {
        block.width = childWidths[0] + operatorExtendedWidth;
      } else {
        block.width = operatorExtendedWidth + (childWidths[0] + childWidths[1]);
      }
      startZ += propositionWidth; // spacing between children
      block.position[2] = startZ;
      return block.width;
    }

    return propositionWidth;
  }

  blocks.forEach((_, index) => {
    if (!processed.has(index)) {
      processBlock(index);
    }
  });
  console.log('Total width needed:', startZ);
  blocks.forEach((_, index) => {
    blocks[index].position[2] -= (startZ / 2);
  });

  console.log(blocks)
  return blocks;
}

export function getTreeDepth(node: LTLNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getTreeDepth));
}

export function getNodeCount(node: LTLNode): number {
  let count = 1;
  if (node.children) {
    node.children.forEach((child) => {
      count += getNodeCount(child);
    });
  }
  return count;
}
