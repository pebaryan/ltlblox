import { Component } from '@angular/core';
import { formulaState } from '../../state/formula';

@Component({
  selector: 'app-logic-palette',
  standalone: true,
  imports: [],
  templateUrl: './logic-palette.html',
  styleUrl: './logic-palette.scss',
})
export class LogicPalette {
  setFormula(type: any) {
    // For now, we just swap the top-level formula
    // Later we can implement a real tree-builder
    formulaState.set({
      type: type,
      variableId: type === 'PROPOSITION' ? 'p' : undefined,
      children: type === 'PROPOSITION' ? [] : [{ type: 'PROPOSITION', variableId: 'q' }],
    });
  }
}
