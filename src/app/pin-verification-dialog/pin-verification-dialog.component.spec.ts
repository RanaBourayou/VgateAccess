import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinVerificationDialogComponent } from './pin-verification-dialog.component';

describe('PinVerificationDialogComponent', () => {
  let component: PinVerificationDialogComponent;
  let fixture: ComponentFixture<PinVerificationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PinVerificationDialogComponent]
    });
    fixture = TestBed.createComponent(PinVerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
