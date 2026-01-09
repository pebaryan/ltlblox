import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegoBlock } from './lego-block';

describe('LegoBlock', () => {
  let component: LegoBlock;
  let fixture: ComponentFixture<LegoBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegoBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegoBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
