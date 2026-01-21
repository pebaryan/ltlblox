import { Component, computed, effect, inject } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import { formulaState, currentTime } from '../../state/formula';
import { LtlEvaluator, LTLNode } from '../../core/ltl-evaluator';
import { LegoBlock } from '../lego-block/lego-block';
import { LogicLink } from '../logic-link/logic-link';
import { TimelineRail } from '../timeline-rail/timeline-rail';
import { flattenFormula, calculateBlockWidths, FlatBlock, blockHeight } from '../../core/formula-utils';
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

  flatFormula = computed(() => {
    const root = formulaState();
    console.log('Current formula root:', root);
    const depth = this.getTreeDepth(root);
    const startY = depth * blockHeight;
    console.log('Tree depth:', depth, 'Start Y:', startY);
    const blocks = flattenFormula(root, currentTime(), startY, 0);
    console.log('Flattened blocks:', blocks);
    return calculateBlockWidths(blocks);
  });

  getTreeDepth(node: LTLNode): number {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map((c) => this.getTreeDepth(c)));
  }

  checkLogic(node: LTLNode) {
    const trace = traceState();
    const time = currentTime();
    const isTrue = this.ltlService.evaluate(node, trace, time);
    return isTrue;
  }

  findSatisfyingTime(node: LTLNode): number {
    if (!node || node.type !== 'EVENTUALLY' || !node.children?.[0]) {
      return currentTime();
    }
    const trace = traceState();
    const t = currentTime();
    for (let i = t; i < trace.length; i++) {
      if (this.ltlService.evaluate(node.children![0], trace, i)) return i;
    }
    return t;
  }

  getAlwaysSteps(startIdx: number): number[] {
    const trace = traceState();
    const steps: number[] = [];
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
      if (this.ltlService.evaluate(q, trace, t)) {
        return t;
      }
      if (!this.ltlService.evaluate(p, trace, t)) {
        break;
      }
    }
    return startTime;
  }

  constructor() {
    effect(() => {
      const t = currentTime();
      console.log('The time changed to:', t);
    });
  }
}
