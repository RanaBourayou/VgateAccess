import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VisitRequestService } from '../services/visit-request.service';

@Component({
  selector: 'app-edit-request-dialog',
  templateUrl: './edit-request-dialog.component.html',
  styleUrls: ['./edit-request-dialog.component.css']
})
export class EditRequestDialogComponent {
  editForm: FormGroup;
  guestCountControl = new FormControl(1, [Validators.required, Validators.min(1)]);

  constructor(
    public dialogRef: MatDialogRef<EditRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private visitRequestService: VisitRequestService,
    private fb: FormBuilder
  ) {
    this.editForm = this.createForm(data.request || {});
    this.setGuestCount();
  }

  createForm(request: any): FormGroup {
    const visitor = request.visitor || {
      idVisitor: null,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: null,
      companyName: '',
      cin: null,
      visitorType: null
    };

    const visitDate = request.visitDate ? new Date(request.visitDate).toISOString().split('T')[0] : '';
    
    // Format time in 24-hour format (HH:mm)
    const formatTime = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
    };

    // Create form group
    const form = this.fb.group({
      visitDate: [visitDate, Validators.required],
      expectedArrival: [formatTime(request.expectedArrival), Validators.required],
      expectedDeparture: [formatTime(request.expectedDeparture), Validators.required],
      visitPurpose: [request.visitPurpose || '', Validators.required],
      visitRequestStatus: [request.visitRequestStatus || 'PENDING', Validators.required],
       visitor: this.fb.group({
        idVisitor: [visitor.idVisitor],
        firstName: [visitor.firstName, Validators.required],
        lastName: [visitor.lastName, Validators.required],
        email: [visitor.email, [Validators.required, Validators.email]],
        phoneNumber: [visitor.phoneNumber],
        companyName: [visitor.companyName],
        cin: [visitor.cin],
        visitorType: [visitor.visitorType]
      }),
      hasExtraGuests: [!!(request.guests && request.guests.length > 0)],
      additionalGuests: this.fb.array([])
    });

    // Populate existing guests
    if (request.guests && request.guests.length > 0) {
      const guestArray = form.get('additionalGuests') as FormArray;
      request.guests.forEach((guest: any) => {
        guestArray.push(this.createGuestFormGroup(guest));
      });
    }

    return form;
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

 

  get additionalGuests(): FormArray {
    return this.editForm.get('additionalGuests') as FormArray;
  }

  setGuestCount(): void {
    const guestCount = this.additionalGuests.length || 1;
    this.guestCountControl.setValue(guestCount);
  }

  updateGuestForms(): void {
    const desiredCount = this.guestCountControl.value ?? 0;
    const currentCount = this.additionalGuests.length;

    if (desiredCount > currentCount) {
      // Add new guests
      for (let i = currentCount; i < desiredCount; i++) {
        this.additionalGuests.push(this.createGuestFormGroup());
      }
    } else if (desiredCount < currentCount) {
      // Remove extra guests
      for (let i = currentCount - 1; i >= desiredCount; i--) {
        this.additionalGuests.removeAt(i);
      }
    }
  }

  addGuest(): void {
    this.additionalGuests.push(this.createGuestFormGroup());
    this.guestCountControl.setValue(this.additionalGuests.length);
  }

  removeGuest(index: number): void {
    this.additionalGuests.removeAt(index);
    this.guestCountControl.setValue(this.additionalGuests.length);
  }

private createGuestFormGroup(guest: any = {}): FormGroup {
  // Extract time from LocalDateTime
  const extractTime = (dateTime: string): string => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  };

  return this.fb.group({
    idCompanion: [guest.idCompanion],
     firstName: [guest.firstName || '', Validators.required], // Use 'firstName'
    lastName: [guest.lastName || '', Validators.required], 

    email: [guest.email || '', [Validators.required, Validators.email]],
    phoneNumber: [guest.phoneNumber || '', Validators.required],
    // Add default values for time fields
    arrivalTime: [guest.Arrival ? extractTime(guest.Arrival) : '08:00', Validators.required],
    departureTime: [guest.Departure ? extractTime(guest.Departure) : '17:00', Validators.required]
  });
}

onSave(): void {
  if (this.editForm.invalid) return;

  const formValue = this.editForm.value;
  const requestData = {
    ...this.data.request,
    ...formValue,
    visitDate: new Date(formValue.visitDate).toISOString(),
    expectedArrival: this.combineDateTime(formValue.visitDate, formValue.expectedArrival),
    expectedDeparture: this.combineDateTime(formValue.visitDate, formValue.expectedDeparture),
    visitor: {
      ...this.data.request.visitor,
      ...formValue.visitor
    },
    // Ensure proper field names for backend
    guests: formValue.hasExtraGuests ? 
      formValue.additionalGuests.map((guest: any) => ({
        idCompanion: guest.idGuest, // or guest.idCompanion if renamed
        firstName: guest.firstName,  // Use 'firstName'
        lastName: guest.lastName,

        email: guest.email,
        phoneNumber: guest.phoneNumber,
        arrivalTime: guest.arrivalTime,
        departureTime: guest.departureTime
      })) : []
  };

  this.visitRequestService.updateVisitRequest(requestData.idVisitRequest, requestData)
    .subscribe({
      next: () => this.dialogRef.close('updated'),
      error: err => console.error('Update failed:', err)
    });
}

  private combineDateTime(dateString: string, timeString: string): string {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(dateString);
    date.setHours(hours, minutes);
    return date.toISOString();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}