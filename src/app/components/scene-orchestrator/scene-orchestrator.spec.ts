import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneOrchestrator } from './scene-orchestrator';

describe('SceneOrchestrator', () => {
  let component: SceneOrchestrator;
  let fixture: ComponentFixture<SceneOrchestrator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneOrchestrator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SceneOrchestrator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
