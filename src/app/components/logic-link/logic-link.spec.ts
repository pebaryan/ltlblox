import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicLink } from './logic-link';

describe('LogicLink', () => {
  let component: LogicLink;
  let fixture: ComponentFixture<LogicLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogicLink]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogicLink);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
