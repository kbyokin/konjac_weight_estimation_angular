import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeRangeComponent } from './size-range.component';

describe('SizeRangeComponent', () => {
  let component: SizeRangeComponent;
  let fixture: ComponentFixture<SizeRangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SizeRangeComponent]
    });
    fixture = TestBed.createComponent(SizeRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
