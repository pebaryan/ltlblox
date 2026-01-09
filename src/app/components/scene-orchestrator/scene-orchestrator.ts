import { Component, computed, effect, inject } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import { formulaState, traceState, currentTime } from '../../state/formula';
import { LtlEvaluator, LTLNode } from '../../core/ltl-evaluator';
import { LegoBlock } from '../lego-block/lego-block';
import { LogicLink } from '../logic-link/logic-link';

@Component({
  selector: 'app-scene-orchestrator',
  standalone: true,
  imports: [NgxThreeModule, LegoBlock, LogicLink],
  templateUrl: './scene-orchestrator.html',
  styleUrl: './scene-orchestrator.scss',
})
export class SceneOrchestrator {
  private ltlService = inject(LtlEvaluator);

  // This computed signal flattens your LTL Tree into a 3D Grid
  flatFormula = computed(() => {
    const blocks: { node: LTLNode; position: [number, number, number] }[] = [];
    this.flatten(formulaState(), 0, 0, blocks);
    return blocks;
  });

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

  checkLogic(node: LTLNode) {
    // This is called reactively whenever currentTime() changes
    return this.ltlService.evaluate(node, traceState(), currentTime());
  }

  findSatisfyingTime(node: LTLNode): number {
    const t = currentTime();
    const trace = traceState();
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

  constructor() {
    effect(() => {
      const t = currentTime();
      console.log('The time changed to:', t);
      // Logic to move camera or update lines goes here
    });
  }
}
