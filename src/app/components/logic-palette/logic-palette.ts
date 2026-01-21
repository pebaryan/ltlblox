import { Component, computed } from '@angular/core';
import { formulaState, currentFormulaString, updateProposition, selectedPropositionIndex, getPropositionCount } from '../../state/formula';
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
  addNext() {
    this.wrapFormula('NEXT');
  }
  addNot() {
    this.wrapFormula('NOT');
  }
  reset(v: string) {
    this.resetFormula(v);
  }
  addOr() {
    this.wrapBinary('OR');
  }
  addAnd() {
    this.wrapBinary('AND');
  }
  addUntil() {
    this.wrapBinary('UNTIL');
  }

  wrapFormula(type: 'ALWAYS' | 'EVENTUALLY' | 'NOT' | 'NEXT') {
    const current = formulaState();

    formulaState.set({
      type: type,
      children: [current],
    });
  }

  wrapBinary(type: 'AND' | 'OR' | 'UNTIL') {
    const current = formulaState();
    const varName = prompt(`Enter variable for right-hand side of ${type}:`);
    if (!varName || !varName.trim()) return;

    formulaState.set({
      type: type,
      children: [
        current,
        { type: 'PROPOSITION', variableId: varName.trim() }
      ],
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

  public propositionCount = computed(() => getPropositionCount());
  public propositionIndices = computed(() => 
    Array.from({ length: this.propositionCount() }, (_, i) => i)
  );
  public selectedIndex = selectedPropositionIndex;

  selectProposition(index: number | null) {
    selectedPropositionIndex.set(index);
  }

  setVar(v: string) {
    const index = this.selectedIndex();
    if (index !== null) {
      updateProposition(v, index);
    } else {
      updateProposition(v, 0);
    }
  }
}
