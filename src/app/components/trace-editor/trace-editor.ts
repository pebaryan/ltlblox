import { Component, computed } from '@angular/core';
import { currentTime } from '../../state/formula';
import { removeVariable, traceState, traceVariables } from '../../state/trace';

@Component({
  selector: 'app-trace-editor',
  standalone: true,
  imports: [],
  templateUrl: './trace-editor.html',
  styleUrl: './trace-editor.scss',
})
export class TraceEditor {
  public traceState = traceState;
  public traceVariables = traceVariables;
  public currentTime = currentTime;
  trace = traceState;
  time = currentTime;

  // Get variable names (p, q, etc.) from the first step of the trace
  variables = computed(() => Object.keys(this.trace()[0] || {}));

  toggleValue(timeIndex: number, varName: string) {
    this.trace.update((oldTrace) => {
      const newTrace = [...oldTrace];
      newTrace[timeIndex] = {
        ...newTrace[timeIndex],
        [varName]: !newTrace[timeIndex][varName],
      };
      return newTrace;
    });
  }

  toggleStep(timeIndex: number, varName: string) {
    const currentState = [...traceState()];
    // Toggle the boolean value for that specific variable at that specific time
    currentState[timeIndex] = {
      ...currentState[timeIndex],
      [varName]: !currentState[timeIndex][varName],
    };
    traceState.set(currentState);
  }

  deleteVar(varName: string) {
    if (this.traceVariables().length > 1) {
      removeVariable(varName);
    }
    else alert('at least one variable');
  }

  addNewVariable() {
    const name = prompt('Enter variable name:');
    if (name && name.trim()) {
      traceState.update((current) =>
        current.map((step) => ({
          ...step,
          [name.trim()]: false, // Add the new key to every step in the array
        }))
      );
    }
  }
}
