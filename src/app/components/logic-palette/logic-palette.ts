import { Component, computed } from '@angular/core';
import { formulaState, currentFormulaString, updateProposition } from '../../state/formula';
import { LTLNode } from '../../core/ltl-evaluator';
import { traceVariables } from '../../state/trace';

@Component({
  selector: 'app-logic-palette',
  standalone: true,
  imports: [],
  templateUrl: './logic-palette.html',
  styleUrl: './logic-palette.scss',
})
export class LogicPalette {
  public availableVars = traceVariables;
  public formulaDisplay = currentFormulaString;

  addAlways() {
    this.wrapFormula('ALWAYS');
  }
  addEventually() {
    this.wrapFormula('EVENTUALLY');
  }
  addNot() {
    this.wrapFormula('NOT');
  }
  reset(v: string) {
    this.resetFormula(v);
  }

  wrapFormula(type: 'ALWAYS' | 'EVENTUALLY' | 'NOT') {
    const current = formulaState();

    formulaState.set({
      type: type,
      children: [current], // The old formula becomes the child (the floor below)
    });
  }

  resetFormula(varId: string) {
    formulaState.set({
      type: 'PROPOSITION',
      variableId: varId,
      children: [],
    });
  }

  public currentVar = computed(() => {
    const findVar = (node: LTLNode): string => {
      if (node.type === 'PROPOSITION') return node.variableId || '';
      if (node.children?.[0]) return findVar(node.children[0]);
      return '';
    };
    return findVar(formulaState());
  });

  setVar(v: string) {
    updateProposition(v);
  }
}
