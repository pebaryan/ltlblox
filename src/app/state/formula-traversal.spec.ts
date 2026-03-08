import { getPropositionCount, getPropositionAtIndex, findPathToProposition } from './formula-traversal';
import { LTLNode } from '../core/ltl-evaluator';

describe('Formula Traversal', () => {
  describe('getPropositionCount', () => {
    it('should count single proposition', () => {
      const node: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      expect(getPropositionCount(node)).toBe(1);
    });

    it('should count multiple propositions in AND', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          { type: 'PROPOSITION', variableId: 'p' },
          { type: 'PROPOSITION', variableId: 'q' },
        ],
      };
      expect(getPropositionCount(node)).toBe(2);
    });

    it('should count propositions in nested formula', () => {
      const node: LTLNode = {
        type: 'ALWAYS',
        children: [
          {
            type: 'OR',
            children: [
              { type: 'PROPOSITION', variableId: 'p' },
              { type: 'PROPOSITION', variableId: 'q' },
            ],
          },
        ],
      };
      expect(getPropositionCount(node)).toBe(2);
    });

    it('should count all propositions in complex formula', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          {
            type: 'EVENTUALLY',
            children: [{ type: 'PROPOSITION', variableId: 'p' }],
          },
          {
            type: 'NOT',
            children: [{ type: 'PROPOSITION', variableId: 'q' }],
          },
          { type: 'PROPOSITION', variableId: 'r' },
        ],
      };
      expect(getPropositionCount(node)).toBe(3);
    });
  });

  describe('getPropositionAtIndex', () => {
    it('should get first proposition', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          { type: 'PROPOSITION', variableId: 'p' },
          { type: 'PROPOSITION', variableId: 'q' },
        ],
      };
      expect(getPropositionAtIndex(node, 0)).toBe('p');
    });

    it('should get second proposition', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          { type: 'PROPOSITION', variableId: 'p' },
          { type: 'PROPOSITION', variableId: 'q' },
        ],
      };
      expect(getPropositionAtIndex(node, 1)).toBe('q');
    });

    it('should traverse nested structure', () => {
      const node: LTLNode = {
        type: 'ALWAYS',
        children: [
          {
            type: 'OR',
            children: [
              { type: 'PROPOSITION', variableId: 'p' },
              { type: 'PROPOSITION', variableId: 'q' },
            ],
          },
        ],
      };
      expect(getPropositionAtIndex(node, 0)).toBe('p');
      expect(getPropositionAtIndex(node, 1)).toBe('q');
    });

    it('should return default when index out of range', () => {
      const node: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      expect(getPropositionAtIndex(node, 5)).toBe('p');
    });
  });

  describe('findPathToProposition', () => {
    it('should return empty path for single proposition', () => {
      const node: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const path = findPathToProposition(node, 0);
      expect(path).toEqual([]);
    });

    it('should find path to first child', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          { type: 'PROPOSITION', variableId: 'p' },
          { type: 'PROPOSITION', variableId: 'q' },
        ],
      };
      const path = findPathToProposition(node, 0);
      expect(path.length).toBe(1);
      expect(path[0].childIndex).toBe(0);
    });

    it('should find path to second child', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          { type: 'PROPOSITION', variableId: 'p' },
          { type: 'PROPOSITION', variableId: 'q' },
        ],
      };
      const path = findPathToProposition(node, 1);
      expect(path.length).toBe(1);
      expect(path[0].childIndex).toBe(1);
    });

    it('should find path in nested structure', () => {
      const node: LTLNode = {
        type: 'ALWAYS',
        children: [
          {
            type: 'OR',
            children: [
              { type: 'PROPOSITION', variableId: 'p' },
              { type: 'PROPOSITION', variableId: 'q' },
            ],
          },
        ],
      };
      const path = findPathToProposition(node, 1);
      expect(path.length).toBe(2);
      expect(path[0].childIndex).toBe(0);
      expect(path[1].childIndex).toBe(1);
    });

    it('should return empty array when index out of range', () => {
      const node: LTLNode = {
        type: 'AND',
        children: [
          { type: 'PROPOSITION', variableId: 'p' },
        ],
      };
      const path = findPathToProposition(node, 5);
      expect(path).toEqual([]);
    });
  });
});