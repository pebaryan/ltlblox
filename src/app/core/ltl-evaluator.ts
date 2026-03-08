import { Injectable } from '@angular/core';

/**
 * Represents a node in an LTL (Linear Temporal Logic) formula tree.
 */
export interface LTLNode {
  /** Type of the LTL operator or proposition */
  type: 'PROPOSITION' | 'NOT' | 'AND' | 'OR' | 'NEXT' | 'ALWAYS' | 'EVENTUALLY' | 'UNTIL';
  /** Variable name for proposition nodes */
  variableId?: string;
  /** Child nodes for operator nodes */
  children?: LTLNode[];
}

/**
 * A trace representing boolean values of variables over time steps.
 * Each element is a time step with variable assignments.
 */
export type Trace = Record<string, boolean>[];

/**
 * Service for evaluating Linear Temporal Logic (LTL) formulas against traces.
 * Provides methods to check formula satisfaction at specific time steps.
 */
@Injectable({
  providedIn: 'root',
})
export class LtlEvaluator {
  /**
   * Evaluates an LTL node at a specific time step in a trace.
   * @param node - The LTL node to evaluate
   * @param trace - The trace to evaluate against
   * @param t - The time step to evaluate at
   * @returns True if the node is satisfied at time t, false otherwise
   */
  evaluate(node: LTLNode, trace: Trace, t: number): boolean {
    if (t >= trace.length) return false;

    switch (node.type) {
      case 'PROPOSITION':
        const varName = node.variableId!;
        const currentStep = trace[t];
        if (!currentStep) {
          return false;
        }
        return currentStep[varName] ?? false;

      case 'NOT':
        return !this.evaluate(node.children![0], trace, t);
      case 'AND':
        return node.children!.every((c) => this.evaluate(c, trace, t));
      case 'OR':
        return node.children!.some((c) => this.evaluate(c, trace, t));
      case 'NEXT':
        return t + 1 < trace.length ? this.evaluate(node.children![0], trace, t + 1) : false;
      case 'ALWAYS':
        for (let i = t; i < trace.length; i++) {
          if (!this.evaluate(node.children![0], trace, i)) return false;
        }
        return true;
      case 'EVENTUALLY':
        for (let i = t; i < trace.length; i++) {
          if (this.evaluate(node.children![0], trace, i)) return true;
        }
        return false;
      case 'UNTIL':
        const [p, q] = node.children!;
        for (let i = t; i < trace.length; i++) {
          if (this.evaluate(q, trace, i)) {
            for (let j = t; j < i; j++) {
              if (!this.evaluate(p, trace, j)) return false;
            }
            return true;
          }
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Finds the first time step where an LTL node becomes satisfied.
   * Works for EVENTUALLY, NEXT, ALWAYS, and UNTIL operators.
   * @param node - The LTL node to find satisfaction for
   * @param trace - The trace to evaluate against
   * @param t - The starting time step to search from
   * @returns The time step where satisfaction occurs, or null if not found
   */
  findSatisfyingIndex(node: LTLNode, trace: Trace, t: number): number | null {
    switch (node.type) {
      case 'EVENTUALLY':
        for (let i = t; i < trace.length; i++) {
          if (this.evaluate(node.children![0], trace, i)) return i;
        }
        return null;
      case 'NEXT':
        if (t + 1 < trace.length && this.evaluate(node.children![0], trace, t + 1)) {
          return t + 1;
        }
        return null;
      case 'ALWAYS':
        for (let i = t; i < trace.length; i++) {
          if (!this.evaluate(node.children![0], trace, i)) return i;
        }
        return trace.length;
      case 'UNTIL':
        const [p, q] = node.children!;
        for (let i = t; i < trace.length; i++) {
          if (this.evaluate(q, trace, i)) {
            let allPTrue = true;
            for (let j = t; j < i; j++) {
              if (!this.evaluate(p, trace, j)) {
                allPTrue = false;
                break;
              }
            }
            if (allPTrue) return i;
          }
        }
        return null;
      default:
        return null;
    }
  }

  /**
   * Finds the break point for an UNTIL operator in a trace.
   * Returns either when the right-hand side becomes true or when the left-hand side becomes false.
   * @param node - The UNTIL node to evaluate
   * @param trace - The trace to evaluate against
   * @param startTime - The starting time step
   * @returns The time step where the UNTIL condition breaks or completes
   */
  findUntilBreakPoint(node: LTLNode, trace: Trace, startTime: number): number {
    const [p, q] = node.children!;
    for (let t = startTime; t < trace.length; t++) {
      if (this.evaluate(q, trace, t)) {
        return t;
      }
      if (!this.evaluate(p, trace, t)) {
        return t;
      }
    }
    return startTime;
  }
}
