import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadBoxComponent } from './upload-box.component';

describe('UploadBoxComponent', () => {
  let component: UploadBoxComponent;
  let fixture: ComponentFixture<UploadBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadBoxComponent]
    });
    fixture = TestBed.createComponent(UploadBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
