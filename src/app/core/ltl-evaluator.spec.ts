import { TestBed } from '@angular/core/testing';

import { LtlEvaluator } from './ltl-evaluator';

describe('LtlEvaluator', () => {
  let service: LtlEvaluator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LtlEvaluator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
