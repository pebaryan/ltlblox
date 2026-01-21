import { Component, computed, effect, inject } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import { formulaState, currentTime } from '../../state/formula';
import { LtlEvaluator, LTLNode } from '../../core/ltl-evaluator';
import { LegoBlock } from '../lego-block/lego-block';
import { LogicLink } from '../logic-link/logic-link';
import { TimelineRail } from '../timeline-rail/timeline-rail';
import { flattenFormula } from '../../core/formula-utils';
import { traceState } from '../../state/trace';

@Component({
  selector: 'app-scene-orchestrator',
  standalone: true,
  imports: [NgxThreeModule, LegoBlock, LogicLink, TimelineRail],
  templateUrl: './scene-orchestrator.html',
  styleUrl: './scene-orchestrator.scss',
})
export class SceneOrchestrator {
  private ltlService = inject(LtlEvaluator);
  currentTime = currentTime;

  // // This computed signal flattens your LTL Tree into a 3D Grid
  // flatFormula = computed(() => {
  //   const blocks: { node: LTLNode; position: [number, number, number] }[] = [];
  //   this.flatten(formulaState(), 0, 0, blocks);
  //   return blocks;
  // });

  private flatten(node: LTLNode, x: number, y: number, list: any[]) {
    // We stack the formula vertically (Y-axis) based on nesting depth
    list.push({ node, position: [x, y, 0] });

    if (node.children) {
      node.children.forEach((child, index) => {
        // Spread children horizontally (X) and move down (Y)
        this.flatten(child, x + index, y - 1.5, list);
      });
    }
  }

  // Helper to find tree depth
  getTreeDepth(node: LTLNode): number {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map((c) => this.getTreeDepth(c)));
  }

  flatFormula = computed(() => {
    const root = formulaState();
    const depth = this.getTreeDepth(root);

    // Start the root at (depth - 1) * 1.2 so the bottom child is at Y = 0
    const startY = (depth - 1) * 1.2;

    return flattenFormula(root, currentTime(), startY);
  });

  checkLogic(node: LTLNode) {
    const trace = traceState();
    const time = currentTime();

    // The LTL Service evaluates if this node is true AT THIS TIME
    const isTrue = this.ltlService.evaluate(node, trace, time);

    return isTrue;
  }

  findSatisfyingTime(node: LTLNode): number {
    if (!node || node.type !== 'EVENTUALLY' || !node.children?.[0]) {
      return currentTime();
    }
    const trace = traceState();
    const t = currentTime();
    // Find the first index in the future where the child is true
    for (let i = t; i < trace.length; i++) {
      if (this.ltlService.evaluate(node.children![0], trace, i)) return i;
    }
    return t;
  }

  remainingTimeSteps(startTime: number) {
    const trace = traceState();
    const steps = [];
    for (let i = startTime; i < trace.length; i++) {
      steps.push(i);
    }
    return steps;
  }

  // Add this helper method
  getAlwaysSteps(startIdx: number): number[] {
    const trace = traceState();
    const steps: number[] = [];
    // For 'Always', we need to link to EVERY future step
    for (let i = startIdx; i < trace.length; i++) {
      steps.push(i);
    }
    return steps;
  }

  findUntilEnd(node: LTLNode): number {
    const trace = traceState();
    const startTime = currentTime();
    const [p, q] = node.children!;

    for (let t = startTime; t < trace.length; t++) {
      // If Q is satisfied, the Until condition is met here
      if (this.ltlService.evaluate(q, trace, t)) {
        return t;
      }
      // If P fails before Q happens, the Until is broken
      if (!this.ltlService.evaluate(p, trace, t)) {
        break;
      }
    }
    return startTime; // Default/Fail state
  }

  constructor() {
    effect(() => {
      const t = currentTime();
      console.log('The time changed to:', t);
      // Logic to move camera or update lines goes here
    });
  }
}
