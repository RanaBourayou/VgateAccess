import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Visitor, VisitorType } from '../models/visitor.model';
import { CompanyService } from '../services/company.service';
import { Company } from '../models/company.model';
import { VisitorService } from '../services/visitor.service';

@Component({
  selector: 'app-admin-edit-visitor',
  templateUrl: './admin-edit-visitor.component.html',
  styleUrls: ['./admin-edit-visitor.component.css']
})
export class AdminEditVisitorComponent implements OnInit {
  form!: FormGroup;
  visitorTypes = Object.values(VisitorType);
  loading = false;
  success = false;
  error = '';
  companies: Company[] = [];

  constructor(
    private companyService: CompanyService,
    private visitorService: VisitorService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminEditVisitorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { visitor: Visitor }
  ) {}

  ngOnInit(): void {
    const visitor = this.data.visitor;

    this.form = this.fb.group({
      firstName: [visitor.firstName, [Validators.required, Validators.maxLength(50)]],
      lastName: [visitor.lastName, [Validators.required, Validators.maxLength(50)]],
      email: [visitor.email, [Validators.required, Validators.email]],
      phoneNumber: [visitor.phoneNumber, [Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
      companyName: [visitor.companyName, [Validators.maxLength(100)]],
      cin: [visitor.cin],
      passportNumber: [visitor.passportNumber],
      visitorType: [visitor.visitorType, [Validators.required]],
      companyId: [visitor.companyId]
    });
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (companies) => (this.companies = companies),
      error: (err) => console.error('Failed to load companies', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error = 'Please fix the errors in the form.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    const updatedVisitor: Visitor = {
      ...this.data.visitor,
      ...this.form.value
    };

    if (typeof updatedVisitor.idVisitor === 'number') {
      this.visitorService.updateVisitor(updatedVisitor.idVisitor, updatedVisitor).subscribe({
        next: (result) => {
          this.success = true;
          this.dialogRef.close(result); // Return updated visitor to parent
        },
        error: (err) => {
          this.error = 'Failed to update visitor';
          console.error('Update error:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.error = 'Visitor ID is missing. Cannot update visitor.';
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
