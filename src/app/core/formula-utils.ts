import { LTLNode } from './ltl-evaluator';
import { CONSTANTS } from './constants';

/**
 * Represents a flattened block in the 3D LTL formula visualization.
 */
export interface FlatBlock {
  /** The LTL node this block represents */
  node: LTLNode;
  /** 3D position [x, y, z] in the scene */
  position: [number, number, number];
  /** Shape type: proposition box, unary operator, or binary operator */
  shape: 'box' | 'unary' | 'binary';
  /** Width of the block */
  width: number;
  /** Indices of child blocks */
  children: number[];
  /** Z positions of children (for binary/unary operators) */
  childZ?: number[];
  /** Maximum child width (for binary/unary operators) */
  childWidth?: number;
}

/** Height of each block level in the visualization */
export const blockHeight = CONSTANTS.blockHeight;
/** Width of proposition blocks */
export const propositionWidth = CONSTANTS.propositionWidth;
/** Extended width for operator blocks */
export const operatorExtendedWidth = CONSTANTS.operatorExtendedWidth;

/**
 * Recursively flattens an LTL formula tree into a list of 3D blocks for visualization.
 * @param node - The LTL node to flatten
 * @param x - X coordinate (time step)
 * @param y - Y coordinate (vertical position based on depth)
 * @param z - Initial Z coordinate
 * @param list - Accumulator list for blocks (internal use)
 * @param parentIndex - Index of parent block in the list (internal use)
 * @returns Array of flat blocks with positions and relationships
 */
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

/**
 * Calculates and assigns proper widths to blocks based on their children.
 * Processes blocks recursively to determine optimal spacing.
 * @param blocks - Array of flat blocks to process
 * @returns The same array with width and position properties calculated
 */
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
  blocks.forEach((_, index) => {
    blocks[index].position[2] -= (startZ / 2);
  });
  return blocks;
}

/**
 * Calculates the maximum depth of an LTL formula tree.
 * @param node - The root node of the formula
 * @returns The depth of the tree (1 for leaf nodes)
 */
export function getTreeDepth(node: LTLNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getTreeDepth));
}

/**
 * Counts the total number of nodes in an LTL formula tree.
 * @param node - The root node of the formula
 * @returns Total node count including all operators and propositions
 */
export function getNodeCount(node: LTLNode): number {
  let count = 1;
  if (node.children) {
    node.children.forEach((child) => {
      count += getNodeCount(child);
    });
  }
  return count;
}
