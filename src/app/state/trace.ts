import { signal, computed } from '@angular/core';

// Define the structure as a Record so we can have any variable name
export type TraceStep = Record<string, boolean>;

export const traceState = signal<TraceStep[]>([
  { p: true, q: false, r: false },
  { p: false, q: true, r: false },
  { p: true, q: true, r: false },
  { p: false, q: false, r: true },
]);

// Helper to get all unique variable names currently in the trace
export const traceVariables = computed(() => {
  const state = traceState();
  if (state.length === 0) return [];
  return Object.keys(state[0]);
});

export function removeVariable(varName: string) {
  traceState.update((current) =>
    current.map((step) => {
      const newStep = { ...step };
      delete newStep[varName]; // Remove the key from the object
      return newStep;
    })
  );
}
