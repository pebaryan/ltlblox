I am building an Angular 17+ SPA for LTL visualization using ngx-three. Current Progress:

Project initialized with SCSS and standalone components.

LtlEvaluatorService implemented with recursive logic for PROPOSITION, ALWAYS, and EVENTUALLY.

Global state managed via Signals in formula.store.ts. Next Step: Create a LegoBlockComponent using ngx-three that reacts to the logic state.