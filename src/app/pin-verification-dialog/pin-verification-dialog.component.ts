import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pin-verification-dialog',
  templateUrl: './pin-verification-dialog.component.html',
  styleUrls: ['./pin-verification-dialog.component.css']
})
export class PinVerificationDialogComponent {
  pinForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PinVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { visitorName: string },
    private fb: FormBuilder
  ) {
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]]
    });
  }

  onVerify() {
    if (this.pinForm.valid) {
      this.dialogRef.close(this.pinForm.value.pin);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
