import { Component, computed, effect, inject } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import { formulaState, currentTime } from '../../state/formula';
import { LtlEvaluator, LTLNode } from '../../core/ltl-evaluator';
import { LegoBlock } from '../lego-block/lego-block';
import { LogicLink } from '../logic-link/logic-link';
import { TimelineRail } from '../timeline-rail/timeline-rail';
import { flattenFormula, calculateBlockWidths, FlatBlock, blockHeight, getTreeDepth } from '../../core/formula-utils';
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
    const depth = getTreeDepth(root);
    const startY = depth * blockHeight;
    const blocks = flattenFormula(root, currentTime(), startY, 0);
    return calculateBlockWidths(blocks);
  });

  checkLogic(node: LTLNode) {
    const trace = traceState();
    const time = currentTime();
    const isTrue = this.ltlService.evaluate(node, trace, time);
    return isTrue;
  }

  findSatisfyingTime(node: LTLNode): number {
    if (!node || !node.children?.[0]) {
      return currentTime();
    }
    const trace = traceState();
    const t = currentTime();
    const result = this.ltlService.findSatisfyingIndex(node, trace, t);
    return result ?? t;
  }

  getAlwaysSteps(startIdx: number): number[] {
    const trace = traceState();
    return Array.from({ length: trace.length - startIdx }, (_, i) => startIdx + i);
  }

  findUntilEnd(node: LTLNode): number {
    const trace = traceState();
    const startTime = currentTime();
    return this.ltlService.findUntilBreakPoint(node, trace, startTime);
  }

  constructor() {
    // Time tracking effect - logs removed for production
    effect(() => {
      const t = currentTime();
    });
  }
}
