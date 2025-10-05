import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray, Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import {
  VisitRequest,
  VisitRequestStatus
} from '../models/visit-request.model';
import { VisitRequestService } from '../services/visit-request.service';
import { VisitorType } from '../models/visitor.model';
import { User, Role } from '../models/user.model';

@Component({
  selector: 'app-receptionist-visit-request-form',
  templateUrl: './receptionist-visit-request-form.component.html',
  styleUrls: ['./receptionist-visit-request-form.component.css'],
  providers: [DatePipe]
})
export class ReceptionistVisitRequestFormComponent implements OnInit {
  visitForm!: FormGroup;
  minDate = new Date();
  visitorTypes = Object.values(VisitorType);
  currentUser!: User;
  isLoading = false;
adminApproval: boolean = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private visitRequestService: VisitRequestService,
    public dialogRef: MatDialogRef<ReceptionistVisitRequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

ngOnInit() {
  this.adminApproval = this.data?.adminApproval ?? false;
  this.createForm();
  this.setupCurrentUser();
  this.setupFormListeners();
}


  private createForm() {
    this.visitForm = this.fb.group({
      // Visitor Info
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      visitorType: ['', Validators.required],
      companyName: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      cin: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      
      // Visit Details
      visitDate: [null, Validators.required],
      expectedArrival: [null, Validators.required],
      expectedDeparture: [null, Validators.required],
      visitPurpose: ['', Validators.required],
      personneConcernee: ['', Validators.required],
      
      // Guests
      hasExtraGuests: [false],
      extraGuestCount: [1, [Validators.min(1), Validators.required]],
      guests: this.fb.array([])
    });
  }

  private setupCurrentUser() {
    const id = Number(localStorage.getItem('userId'));
    const roleStr = localStorage.getItem('userRole') || 'REQUESTER';
    
    this.currentUser = {
      id,
      firstName: localStorage.getItem('firstName') || '',
      lastName: localStorage.getItem('lastName') || '',
      email: localStorage.getItem('email') || '',
      password: '',
      role: Role[roleStr as keyof typeof Role] || Role.REQUESTER,
      phoneNumber: localStorage.getItem('phoneNumber') || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: undefined,
      passwordResetTokenExpiry: undefined,
      getAuthorities: () => [{ authority: roleStr }],
      getPassword: () => '',
      getUsername: () => localStorage.getItem('username') || '',
      isAccountNonExpired: () => true,
      isAccountNonLocked: () => true,
      isCredentialsNonExpired: () => true,
      isEnabled: () => true
    };
  }

  private setupFormListeners() {
    this.visitForm.get('hasExtraGuests')!
      .valueChanges.subscribe(on => on ? this.buildGuestForms() : this.clearGuests());
    
    this.visitForm.get('extraGuestCount')!
      .valueChanges.subscribe(_ => {
        if (this.visitForm.get('hasExtraGuests')!.value) {
          this.buildGuestForms();
        }
      });
  }

  get guests(): FormArray {
    return this.visitForm.get('guests') as FormArray;
  }

  private formatTime(t: string): string {
    if (!t) return '00:00:00';
    return t.length === 5 ? `${t}:00` : t;
  }

  private buildGuestForms() {
    const count = this.visitForm.get('extraGuestCount')!.value || 1;
    this.clearGuests();
    
    for (let i = 0; i < count; i++) {
      this.guests.push(this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['']
      }));
    }
  }

  private clearGuests() {
    while (this.guests.length) {
      this.guests.removeAt(0);
    }
  }

  get guestForms(): FormGroup[] {
    return this.guests.controls.map(control => control as FormGroup);
  }

 onSubmit() {
  if (this.visitForm.invalid) {
    this.markFormGroupTouched(this.visitForm);
    return;
  }

  this.isLoading = true;
  const fv = this.visitForm.value;

  const dateStr = this.datePipe.transform(fv.visitDate, 'yyyy-MM-dd')!;
  const arrival = `${dateStr}T${this.formatTime(fv.expectedArrival)}`;
  const departure = `${dateStr}T${this.formatTime(fv.expectedDeparture)}`;
  const visitDate = `${dateStr}T00:00:00`;

  const additionalGuests = fv.hasExtraGuests
    ? fv.guests.map((g: any) => ({
        firstNamecompanion: g.firstName,
        lastNamecompanion: g.lastName,
        email: g.email,
        phoneNumber: g.phoneNumber ? +g.phoneNumber : 0,
        arrival,
        departure
      }))
    : [];

  // 👇 FINAL PAYLOAD with adminApproval set to true (required for backend)
  const payload: VisitRequest = {
    visitor: {
      firstName: fv.firstName,
      lastName: fv.lastName,
      visitorType: fv.visitorType,
      companyName: fv.companyName,
      email: fv.email,
      phoneNumber: +fv.phoneNumber,
      cin: +fv.cin
    },
    visitDate,
    expectedArrival: arrival,
    expectedDeparture: departure,
    visitPurpose: fv.visitPurpose,
    personneConcernee: fv.personneConcernee,
    visitRequestStatus: VisitRequestStatus.APPROVED,
    requester: this.currentUser,
    additionalGuests,
    admin_approval: true // 👈 REQUIRED!
  };

  this.visitRequestService.createVisitRequest(payload)
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creating visit request:', err);
        this.isLoading = false;
      }
    });
}


  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}