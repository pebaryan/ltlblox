import { TestBed } from '@angular/core/testing';

import { LtlEvaluator, LTLNode, Trace } from './ltl-evaluator';

describe('LtlEvaluator', () => {
  let service: LtlEvaluator;

  const trace: Trace = [
    { p: true, q: false, r: false },
    { p: false, q: true, r: false },
    { p: true, q: true, r: false },
    { p: false, q: false, r: true },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LtlEvaluator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('PROPOSITION', () => {
    it('should return true when variable is true at time t', () => {
      const node: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      expect(service.evaluate(node, trace, 0)).toBe(true);
      expect(service.evaluate(node, trace, 1)).toBe(false);
    });

    it('should return false when variable is false at time t', () => {
      const node: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      expect(service.evaluate(node, trace, 0)).toBe(false);
      expect(service.evaluate(node, trace, 1)).toBe(true);
    });

    it('should return false for non-existent variable', () => {
      const node: LTLNode = { type: 'PROPOSITION', variableId: 'x' };
      expect(service.evaluate(node, trace, 0)).toBe(false);
    });
  });

  describe('NOT', () => {
    it('should negate the child result', () => {
      const trueProp: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const falseProp: LTLNode = { type: 'PROPOSITION', variableId: 'q' };

      const notTrue: LTLNode = { type: 'NOT', children: [trueProp] };
      const notFalse: LTLNode = { type: 'NOT', children: [falseProp] };

      expect(service.evaluate(notTrue, trace, 0)).toBe(false);
      expect(service.evaluate(notFalse, trace, 0)).toBe(true);
    });
  });

  describe('AND', () => {
    it('should return true when all children are true', () => {
      const pTrue: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qTrue: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const andNode: LTLNode = { type: 'AND', children: [pTrue, qTrue] };

      // At t=2, p=true and q=true
      expect(service.evaluate(andNode, trace, 2)).toBe(true);
    });

    it('should return false when any child is false', () => {
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const andNode: LTLNode = { type: 'AND', children: [pNode, qNode] };

      // At t=0, p=true but q=false
      expect(service.evaluate(andNode, trace, 0)).toBe(false);

      // At t=1, p=false but q=true
      expect(service.evaluate(andNode, trace, 1)).toBe(false);
    });
  });

  describe('OR', () => {
    it('should return true when any child is true', () => {
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const orNode: LTLNode = { type: 'OR', children: [pNode, qNode] };

      // At t=0, p=true
      expect(service.evaluate(orNode, trace, 0)).toBe(true);

      // At t=1, q=true
      expect(service.evaluate(orNode, trace, 1)).toBe(true);
    });

    it('should return false when all children are false', () => {
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const rNode: LTLNode = { type: 'PROPOSITION', variableId: 'r' };
      const orNode: LTLNode = { type: 'OR', children: [qNode, rNode] };

      // At t=0, q=false and r=false
      expect(service.evaluate(orNode, trace, 0)).toBe(false);
    });
  });

  describe('NEXT', () => {
    it('should evaluate child at t+1', () => {
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const nextNode: LTLNode = { type: 'NEXT', children: [qNode] };

      // At t=0, NEXT q checks q at t=1 (which is true)
      expect(service.evaluate(nextNode, trace, 0)).toBe(true);

      // At t=1, NEXT q checks q at t=2 (which is true)
      expect(service.evaluate(nextNode, trace, 1)).toBe(true);
    });

    it('should return false at last time step', () => {
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const nextNode: LTLNode = { type: 'NEXT', children: [pNode] };

      // At t=3, t+1=4 is out of bounds
      expect(service.evaluate(nextNode, trace, 3)).toBe(false);
    });
  });

  describe('ALWAYS', () => {
    it('should return true when child is true at all future steps', () => {
      const rNode: LTLNode = { type: 'PROPOSITION', variableId: 'r' };
      const alwaysNode: LTLNode = { type: 'ALWAYS', children: [rNode] };

      // r is false at t=0,1,2 and true at t=3
      // ALWAYS r should be false at t=0,1,2 (not all future are true)
      expect(service.evaluate(alwaysNode, trace, 0)).toBe(false);
      expect(service.evaluate(alwaysNode, trace, 1)).toBe(false);
      expect(service.evaluate(alwaysNode, trace, 2)).toBe(false);

      // At t=3, only step is r=true, so true
      expect(service.evaluate(alwaysNode, trace, 3)).toBe(true);
    });

    it('should return true for single step trace', () => {
      const singleTrace: Trace = [{ p: true }];
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const alwaysNode: LTLNode = { type: 'ALWAYS', children: [pNode] };

      expect(service.evaluate(alwaysNode, singleTrace, 0)).toBe(true);
    });
  });

  describe('EVENTUALLY', () => {
    it('should return true when child is true at some future step', () => {
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const eventuallyNode: LTLNode = { type: 'EVENTUALLY', children: [qNode] };

      // q is false at t=0,1 and true at t=2
      expect(service.evaluate(eventuallyNode, trace, 0)).toBe(true);
      expect(service.evaluate(eventuallyNode, trace, 1)).toBe(true);

      // At t=2, q is true now
      expect(service.evaluate(eventuallyNode, trace, 2)).toBe(true);
    });

    it('should return false when child never true', () => {
      const rNode: LTLNode = { type: 'PROPOSITION', variableId: 'r' };
      const eventuallyNode: LTLNode = { type: 'EVENTUALLY', children: [rNode] };

      // r is false at t=0,1,2 and true at t=3
      expect(service.evaluate(eventuallyNode, trace, 0)).toBe(true);
    });
  });

  describe('UNTIL', () => {
    it('should return true when Q is eventually true while P holds at all prior steps', () => {
      // p U q: p holds at all steps before q becomes true
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const untilNode: LTLNode = { type: 'UNTIL', children: [pNode, qNode] };

      // At t=0: p=true, q=false - P holds, continue
      // At t=1: q=true - Q satisfied, P held at t=0, so UNTIL succeeds
      expect(service.evaluate(untilNode, trace, 0)).toBe(true);
    });

    it('should return true when Q is satisfied immediately', () => {
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const untilNode: LTLNode = { type: 'UNTIL', children: [pNode, qNode] };

      // At t=1: q=true, so UNTIL satisfied (no prior steps to check P)
      expect(service.evaluate(untilNode, trace, 1)).toBe(true);
    });

    it('should return false when P fails before Q becomes true', () => {
      const trace2: Trace = [
        { p: true, q: false },
        { p: false, q: false },  // p fails before q becomes true
        { p: false, q: true },
      ];
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const untilNode: LTLNode = { type: 'UNTIL', children: [pNode, qNode] };

      expect(service.evaluate(untilNode, trace2, 0)).toBe(false);
    });

    it('should return true when P holds until Q becomes true', () => {
      const trace3: Trace = [
        { p: true, q: false },
        { p: true, q: false },  // p still holds
        { p: true, q: true },   // q becomes true while p holds
      ];
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const untilNode: LTLNode = { type: 'UNTIL', children: [pNode, qNode] };

      expect(service.evaluate(untilNode, trace3, 0)).toBe(true);
      expect(service.evaluate(untilNode, trace3, 1)).toBe(true);
    });

    it('should return false when P never holds before Q', () => {
      const trace4: Trace = [
        { p: false, q: false },
        { p: false, q: false },
        { p: false, q: true },
      ];
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const untilNode: LTLNode = { type: 'UNTIL', children: [pNode, qNode] };

      expect(service.evaluate(untilNode, trace4, 0)).toBe(false);
    });
  });

  describe('findSatisfyingIndex', () => {
    it('should find the first index where EVENTUALLY is satisfied', () => {
      const qNode: LTLNode = { type: 'PROPOSITION', variableId: 'q' };
      const eventuallyNode: LTLNode = { type: 'EVENTUALLY', children: [qNode] };

      // q is true at t=1 and t=2
      expect(service.findSatisfyingIndex(eventuallyNode, trace, 0)).toBe(1);
      expect(service.findSatisfyingIndex(eventuallyNode, trace, 1)).toBe(1);
      expect(service.findSatisfyingIndex(eventuallyNode, trace, 2)).toBe(2);
      expect(service.findSatisfyingIndex(eventuallyNode, trace, 3)).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should return false when t is out of bounds', () => {
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      expect(service.evaluate(pNode, trace, 10)).toBe(false);
    });

    it('should handle nested formulas', () => {
      // Eventually (Always p)
      const pNode: LTLNode = { type: 'PROPOSITION', variableId: 'p' };
      const alwaysNode: LTLNode = { type: 'ALWAYS', children: [pNode] };
      const eventuallyNode: LTLNode = { type: 'EVENTUALLY', children: [alwaysNode] };

      // ALWAYS p at t=0: checks p at 0,1,2,3 - p is true, false, true, false
      // So ALWAYS p is false at t=0,1,2
      expect(service.evaluate(alwaysNode, trace, 0)).toBe(false);
      expect(service.evaluate(alwaysNode, trace, 1)).toBe(false);
      expect(service.evaluate(alwaysNode, trace, 2)).toBe(false);

      // ALWAYS p at t=3: checks p at 3 only - p is false, so false
      expect(service.evaluate(alwaysNode, trace, 3)).toBe(false);

      // EVENTUALLY (ALWAYS p) at t=0: checks ALWAYS p at 0,1,2,3
      // ALWAYS p is never true at any step (p is false at some point in each suffix)
      expect(service.findSatisfyingIndex(eventuallyNode, trace, 0)).toBe(null);
    });
  });
});
