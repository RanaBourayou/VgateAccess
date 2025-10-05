import { Component } from '@angular/core';
import { VisitRequestService } from '../services/visit-request.service';
 import { MatDialog } from '@angular/material/dialog';
import { AddNewVisitRequestComponent } from '../add-new-visit-request/add-new-visit-request.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllowedVisitHoursService } from '../services/AllowedVisitHours.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent {
  hoursForm: FormGroup;
  savedSuccessfully = false;
  currentHours: string = '';

  constructor(
    private visitRequestService: VisitRequestService,
    private allowedVisitHoursService: AllowedVisitHoursService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.hoursForm = this.fb.group({
      startHour: ['', [Validators.required, Validators.min(0), Validators.max(23)]],
      endHour: ['', [Validators.required, Validators.min(0), Validators.max(23)]]
    });

    this.loadSavedHours();
  }

  private loadSavedHours() {
    this.allowedVisitHoursService.getVisitHours().subscribe({
      next: (data) => {
        if (data) {
          this.hoursForm.patchValue({
            startHour: data.startHour,
            endHour: data.endHour
          });
          this.updateCurrentHoursText();
        } else {
          // Optionally, set default values or show a message
          this.hoursForm.patchValue({ startHour: '', endHour: '' });
          this.currentHours = 'No visit hours set.';
        }
      }
    });
  }

  private updateCurrentHoursText() {
    const start = this.hoursForm.value.startHour;
    const end = this.hoursForm.value.endHour;
    if (start > end) {
      this.currentHours = `${start}:00 to ${end}:00 (next day)`;
    } else {
      this.currentHours = `${start}:00 to ${end}:00`;
    }
  }

  openCreateVisitDialog() {
    this.dialog.open(AddNewVisitRequestComponent, {
      width: '600px',
      data: { fromReceptionist: true }
    });
  }

  markAllVisitsCompleted() {
    if (confirm("Are you sure you want to mark all unfinished visits as COMPLETED?")) {
      this.visitRequestService.markAllVisitsAsCompleted().subscribe({
        next: (res) => alert(res),
        error: () => alert("Failed to update visit statuses.")
      });
    }
  }

  saveVisitHours(): void {
    if (this.hoursForm.valid) {
      const startHour = this.hoursForm.value.startHour;
      const endHour = this.hoursForm.value.endHour;
      this.allowedVisitHoursService.saveVisitHours(startHour, endHour).subscribe({
        next: () => {
          this.savedSuccessfully = true;
          this.updateCurrentHoursText();
          setTimeout(() => this.savedSuccessfully = false, 3000);
        },
        error: () => alert("Failed to save hours to server.")
      });
    }
  }
}