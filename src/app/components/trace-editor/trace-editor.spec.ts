import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceEditor } from './trace-editor';

describe('TraceEditor', () => {
  let component: TraceEditor;
  let fixture: ComponentFixture<TraceEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraceEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraceEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
