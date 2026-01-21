import { Component, computed, signal, effect } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { formulaState, currentFormulaString, updateProposition, selectedPropositionIndex, getPropositionCount, getPropositionAtIndex, wrapWholeFormula, addBinaryToProposition, wrapFormulaWithBinary, getHighlightedFormula, removeProposition } from '../../state/formula';
import { LTLNode } from '../../core/ltl-evaluator';
import { traceVariables } from '../../state/trace';

@Component({
  selector: 'app-logic-palette',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './logic-palette.html',
  styleUrl: './logic-palette.scss',
})
export class LogicPalette {
  public availableVars = traceVariables;
  public formulaDisplay = currentFormulaString;
  public firstVar = signal('p');

  constructor() {
    effect(() => {
      const vars = this.availableVars();
      if (vars.length > 0) {
        this.firstVar.set(vars[0]);
      }
    });
  }

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
    if (wrapWholeFormula()) {
      wrapFormulaWithBinary(type);
      wrapWholeFormula.set(false);
    } else {
      addBinaryToProposition(type);
    }
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

  public highlightedFormula = computed(() => getHighlightedFormula());

  public propositionCount = computed(() => getPropositionCount());
  public propositionIndices = computed(() => 
    Array.from({ length: this.propositionCount() }, (_, i) => i)
  );
  public selectedIndex = selectedPropositionIndex;
  public wrapWholeFormula = wrapWholeFormula;

  toggleWrapMode() {
    wrapWholeFormula.update(v => !v);
  }

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

  removeProp(index: number) {
    removeProposition(index);
  }
}
