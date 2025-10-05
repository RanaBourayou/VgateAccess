import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusChangePopupComponent } from './status-change-popup.component';

describe('StatusChangePopupComponent', () => {
  let component: StatusChangePopupComponent;
  let fixture: ComponentFixture<StatusChangePopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusChangePopupComponent]
    });
    fixture = TestBed.createComponent(StatusChangePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
