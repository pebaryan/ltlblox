import { Injectable } from '@angular/core';

export interface LTLNode {
  type: 'PROPOSITION' | 'NOT' | 'AND' | 'OR' | 'NEXT' | 'ALWAYS' | 'EVENTUALLY' | 'UNTIL';
  variableId?: string;
  children?: LTLNode[];
}

export type Trace = Record<string, boolean>[];

@Injectable({
  providedIn: 'root',
})
export class LtlEvaluator {
  evaluate(node: LTLNode, trace: Trace, t: number): boolean {
    if (t >= trace.length) return false;

    switch (node.type) {
      case 'PROPOSITION':
        // return trace[t][node.variableId!] || false;
        const varName = node.variableId!;
        // If the variable doesn't exist in the trace, return false
        return !!trace[t]?.[varName];

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
      default:
        return false;
    }
  }

  // Add a helper to find the satisfying index
  findSatisfyingIndex(node: LTLNode, trace: Trace, t: number): number | null {
    if (node.type === 'EVENTUALLY') {
      for (let i = t; i < trace.length; i++) {
        if (this.evaluate(node.children![0], trace, i)) return i;
      }
    }
    return null;
  }
}
