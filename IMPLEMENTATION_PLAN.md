# Ltlblox Implementation Plan: Core LTL Operators + Visualization

## Overview
Complete the LTL evaluator to support all 8 operators (PROPOSITION, NOT, AND, OR, NEXT, ALWAYS, EVENTUALLY, UNTIL) and improve 3D visualization with satisfaction state feedback.

---

## Phase 1: Complete LTL Evaluator

**File:** `src/app/core/ltl-evaluator.ts`

### Step 1.1: Add OR evaluation
- Add `case 'OR'` in the switch statement (around line 30)
- Implementation: `node.children!.some((c) => this.evaluate(c, trace, t))`

### Step 1.2: Add UNTIL evaluation
- Add `case 'UNTIL'` in the switch statement (after OR, before default)
- Implementation:
  ```typescript
  case 'UNTIL':
    const [p, q] = node.children!;
    for (let i = t; i < trace.length; i++) {
      if (this.evaluate(q, trace, i)) return true;  // Q satisfied
      if (!this.evaluate(p, trace, i)) return false; // P failed before Q
    }
    return false;
  ```

### Step 1.3: Add NEXT color
- Add `'NEXT'` to colors map in `formula-utils.ts`

---

## Phase 2: Formula Stringification

**File:** `src/app/state/formula.ts` (lines 22-37)

### Step 2.1: Add missing operators to stringify()
- `'OR'` → `(${stringify(node.children![0])} ∨ ${stringify(node.children![1])})`
- `'UNTIL'` → `(${stringify(node.children![0])} 𝒰 ${stringify(node.children![1])})`
- `'NEXT'` → `○(${stringify(node.children![0])})`

---

## Phase 3: Formula Building UI

**File:** `src/app/components/logic-palette/logic-palette.ts`

### Step 3.1: Add binary operator buttons
- Add `addOr()`, `addUntil()`, `addNext()` methods
- Add corresponding buttons in `logic-palette.html`

### Step 3.2: Implement combineFormulas()
```typescript
combineFormulas(type: 'AND' | 'OR' | 'UNTIL', rightFormula: LTLNode) {
  const left = formulaState();
  formulaState.set({
    type,
    children: [left, rightFormula]
  });
}
```

### Step 3.3: Add binary operator wrapper
```typescript
wrapBinary(type: 'AND' | 'OR' | 'UNTIL') {
  // Prompt user for right-hand side formula
  // Then call combineFormulas()
}
```

### Step 3.4: Update wrapFormula to support NEXT
- Currently only supports unary operators
- Add NEXT as wrap option

---

## Phase 4: 3D Visualization Improvements

### Step 4.1: Satisfaction state on all blocks
**File:** `src/app/components/scene-orchestrator/scene-orchestrator.ts`

- Pass `isSatisfied` prop to every `LegoBlock` (not just EVENTUALLY/ALWAYS)
- Compute satisfaction for each node in the flat formula list

**File:** `src/app/components/lego-block/lego-block.ts`
- Add `isSatisfied` input
- Modify `_color` computed to use brighter colors when satisfied:
  ```typescript
  _color = computed(() => {
    if (this.isSatisfied) {
      // Return lighter/brighter version for satisfied state
      switch (this.type) {
        case 'PROPOSITION': return '#ff6b6b';
        case 'ALWAYS': return '#60a5fa';
        case 'EVENTUALLY': return '#34d399';
        // ... etc
      }
    }
    // Return original colors
  });
  ```

### Step 4.2: Show links for ALL temporal operators
**File:** `src/app/components/scene-orchestrator/scene-orchestrator.html`

#### Step 4.2a: NEXT links
```html
@if (block.node.type === 'NEXT') {
  <app-logic-link [start]="block.position" [end]="[block.position[0] + 1, -0.5, 0]">
  </app-logic-link>
}
```

#### Step 4.2b: UNTIL links
```html
@if (block.node.type === 'UNTIL' && checkLogic(block.node)) {
  @let targetX = findUntilEnd(block.node);
  <app-logic-link [start]="block.position" [end]="[targetX, -0.5, 0]">
  </app-logic-link>
}
```

### Step 4.3: Fix ALWAYS links
**File:** `src/app/components/scene-orchestrator/scene-orchestrator.html`

Current bug: Uses `block.position[0]` (formula depth) instead of time index
- Should use `currentTime()` as starting time step
- Link to all future steps starting from current time

```html
@if (block.node.type === 'ALWAYS' && checkLogic(block.node)) {
  @for (step of getAlwaysSteps(currentTime()); track step) {
    <app-logic-link 
      [start]="block.position" 
      [end]="[step, -0.5, 0]" />
  }
}
```

**File:** `src/app/components/scene-orchestrator/scene-orchestrator.ts`
```typescript
getAlwaysSteps(startTime: number): number[] {
  const trace = traceState();
  const steps: number[] = [];
  for (let i = startTime; i < trace.length; i++) {
    steps.push(i);
  }
  return steps;
}
```

---

## Phase 5: Integration Testing

### Step 5.1: Test each operator
- PROPOSITION: toggles correctly based on trace
- NOT: inverts child satisfaction
- AND: true only if both children true
- OR: true if at least one child true
- NEXT: true if child true at t+1
- ALWAYS: true if child true at all future steps
- EVENTUALLY: true if child true at some future step
- UNTIL: true if Q eventually true while P holds

### Step 5.2: Test edge cases
- Out-of-bounds time steps
- Empty traces
- Nested formulas of all depths
- Boundary conditions for NEXT (t = last step)

### Step 5.3: Visual verification
- Check link positioning for each operator type
- Verify satisfaction colors update with time slider
- Test play/pause animation

---

## File Modifications Summary

| File | Changes |
|------|---------|
| `src/app/core/ltl-evaluator.ts` | Add OR, UNTIL evaluation cases |
| `src/app/state/formula.ts` | Add OR, UNTIL, NEXT to stringify() |
| `src/app/core/formula-utils.ts` | Add NEXT color |
| `src/app/components/logic-palette/logic-palette.ts` | Add binary operator methods |
| `src/app/components/logic-palette/logic-palette.html` | Add OR/UNTIL/NEXT buttons |
| `src/app/components/lego-block/lego-block.ts` | Add isSatisfied color variation |
| `src/app/components/scene-orchestrator/scene-orchestrator.ts` | Pass isSatisfied to all blocks, fix getAlwaysSteps |
| `src/app/components/scene-orchestrator/scene-orchestrator.html` | Add NEXT/UNTIL links, fix ALWAYS links |

---

## Estimated Effort

- Phase 1: 30 minutes
- Phase 2: 15 minutes
- Phase 3: 45 minutes
- Phase 4: 60 minutes
- Phase 5: 30 minutes

**Total: ~4 hours**
