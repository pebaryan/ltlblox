import { signal } from '@angular/core';
import { LTLNode, Trace } from '../core/ltl-evaluator';

// Let's create a classic LTL scenario: "Eventually q happens"
const initialTrace: Trace = [
  { p: true,  q: false }, // t=0
  { p: true,  q: false }, // t=1
  { p: false, q: true  }  // t=2 (q is finally true!)
];

const initialFormula: LTLNode = {
  type: 'ALWAYS',
  children: [{ type: 'PROPOSITION', variableId: 'p' }]
};

export const formulaState = signal<LTLNode>(initialFormula);
export const traceState = signal<Trace>(initialTrace);
export const currentTime = signal<number>(0);