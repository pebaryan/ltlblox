import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicPalette } from './logic-palette';

describe('LogicPalette', () => {
  let component: LogicPalette;
  let fixture: ComponentFixture<LogicPalette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogicPalette]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogicPalette);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
