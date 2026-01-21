import { signal, computed } from '@angular/core';
import { formulaState, removePropositionsByVarName } from './formula';

export type TraceStep = Record<string, boolean>;

export const traceState = signal<TraceStep[]>([
  { p: true, q: false, r: false },
  { p: false, q: true, r: false },
  { p: true, q: true, r: false },
  { p: false, q: false, r: true },
]);

export const traceVariables = computed(() => {
  const state = traceState();
  if (state.length === 0) return [];
  return Object.keys(state[0]);
});

export function removeVariable(varName: string) {
  traceState.update((current) =>
    current.map((step) => {
      const newStep = { ...step };
      delete newStep[varName];
      return newStep;
    })
  );
  removePropositionsByVarName(varName);
}

export function addTimeStep() {
  traceState.update((current) => {
    const lastStep = current[current.length - 1];
    const newStep = { ...lastStep };
    return [...current, newStep];
  });
}

export function removeTimeStep() {
  traceState.update((current) => {
    if (current.length <= 1) return current;
    return current.slice(0, -1);
  });
}
