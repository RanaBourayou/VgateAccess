import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-new-company',
  templateUrl: './admin-new-company.component.html',
  styleUrls: ['./admin-new-company.component.css']
})
export class AdminNewCompanyComponent implements OnInit {
  companyForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AdminNewCompanyComponent>
  ) {}

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]]
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;

    this.isLoading = true;
    this.companyService.createCompany(this.companyForm.value).subscribe({
      next: () => {
        this.snackBar.open('Company added successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open('Failed to add company.', 'Close', { duration: 3000 });
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
