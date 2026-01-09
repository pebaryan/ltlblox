import { Component, computed } from '@angular/core';
import { traceState, currentTime } from '../../state/formula';

@Component({
  selector: 'app-trace-editor',
  standalone: true,
  imports: [],
  templateUrl: './trace-editor.html',
  styleUrl: './trace-editor.scss',
})
export class TraceEditor {
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
}
