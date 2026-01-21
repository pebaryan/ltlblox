import { Component, computed } from '@angular/core';
import { currentTime } from '../../state/formula';
import { removeVariable, traceState, traceVariables, addTimeStep, removeTimeStep } from '../../state/trace';

function sanitizeVarName(input: string): string {
  let sanitized = input.trim().toLowerCase();
  sanitized = sanitized.replace(/\s+/g, '');
  if (sanitized.length > 10) {
    sanitized = sanitized.substring(0, 10);
  }
  return sanitized;
}

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
    const name = prompt('Enter variable name (lowercase, max 10 chars):');
    if (!name) return;
    
    const sanitized = sanitizeVarName(name);
    
    if (!sanitized) {
      alert('Invalid variable name');
      return;
    }
    
    if (this.traceVariables().includes(sanitized)) {
      alert(`Variable '${sanitized}' already exists`);
      return;
    }
    
    traceState.update((current) =>
      current.map((step) => ({
        ...step,
        [sanitized]: false,
      }))
    );
  }

  addTime() {
    addTimeStep();
  }

  removeTime() {
    removeTimeStep();
  }
}
