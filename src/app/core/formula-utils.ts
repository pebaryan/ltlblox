import { LTLNode } from "./ltl-evaluator";

export interface FlatBlock {
  node: LTLNode;
  position: [number, number, number];
  shape: 'box' | 'unary' | 'binary';
  width: number;
  children: number[];
  childZ?: number[];
  childWidth?: number;
}

export function flattenFormula(
  node: LTLNode, 
  x: number, 
  y: number, 
  z: number,
  list: FlatBlock[] = [],
  parentIndex: number | null = null
): FlatBlock[] {
  const isUnary = ['ALWAYS', 'EVENTUALLY', 'NEXT', 'NOT'].includes(node.type);
  const isBinary = ['AND', 'OR', 'UNTIL'].includes(node.type);
  const isProposition = node.type === 'PROPOSITION';

  let shape: 'box' | 'unary' | 'binary' = 'box';
  let width = 0.8;

  if (isProposition) {
    shape = 'box';
    width = 0.8;
  } else if (isUnary || isBinary) {
    shape = node.type === 'PROPOSITION' ? 'box' : (isUnary ? 'unary' : 'binary');
    width = 1.3;
  }

  const currentIndex = list.length;
  list.push({
    node,
    position: [x, y, z],
    shape,
    width,
    children: []
  });

  if (parentIndex !== null) {
    list[parentIndex].children.push(currentIndex);
  }

  if (node.children && node.children.length > 0) {
    const childY = y - 1.2;
    
    if (isBinary && node.children.length === 2) {
      const leftZ = z - 0.6;
      const rightZ = z + 0.6;
      flattenFormula(node.children[0], x, childY, leftZ, list, currentIndex);
      flattenFormula(node.children[1], x, childY, rightZ, list, currentIndex);
    } else if (isUnary && node.children.length === 1) {
      flattenFormula(node.children[0], x, childY, z, list, currentIndex);
    } else {
      node.children.forEach((child, index) => {
        const offsetZ = (index - (node.children!.length - 1) / 2) * 0.8;
        flattenFormula(child, x, childY, z + offsetZ, list, currentIndex);
      });
    }
  }

  return list;
}

export function calculateBlockWidths(blocks: FlatBlock[]): FlatBlock[] {
  const propositionWidth = 0.8;
  const unaryWidth = 0.8;
  const binaryWidth = 1.6;

  const processed = new Set<number>();

  function processBlock(index: number): number {
    if (processed.has(index)) return 0;
    processed.add(index);

    const block = blocks[index];
    
    if (block.shape === 'box') {
      block.width = propositionWidth;
      return propositionWidth;
    }

    if (block.shape === 'unary' || block.shape === 'binary') {
      const childWidths: number[] = [];
      const childZPositions: number[] = [];
      
      block.children.forEach(childIndex => {
        const childWidth = processBlock(childIndex);
        childWidths.push(blocks[childIndex].width);
        childZPositions.push(blocks[childIndex].position[2]);
      });

      block.childWidth = Math.max(...childWidths);
      block.childZ = childZPositions;

      if (block.shape === 'unary') {
        block.width = unaryWidth;
      } else {
        block.width = binaryWidth;
      }
      return block.width;
    }

    return propositionWidth;
  }

  blocks.forEach((_, index) => {
    if (!processed.has(index)) {
      processBlock(index);
    }
  });

  return blocks;
}

export function getTreeDepth(node: LTLNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getTreeDepth));
}

export function getNodeCount(node: LTLNode): number {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => {
      count += getNodeCount(child);
    });
  }
  return count;
}
