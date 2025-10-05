import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../services/company.service';
import { Company } from '../models/company.model';

@Component({
  selector: 'app-admin-edit-company',
  templateUrl: './admin-edit-company.component.html',
  styleUrls: ['./admin-edit-company.component.css']
})
export class AdminEditCompanyComponent implements OnInit {
  company!: Company;
  loading = false;
  error = '';
  success = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private router: Router,
    public dialogRef: MatDialogRef<AdminEditCompanyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { company: Company }
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.company) {
      this.company = { ...this.data.company };
      this.form = this.fb.group({
        companyName: [this.company.companyName, [Validators.required, Validators.maxLength(100)]],
        companyEmail: [this.company.companyEmail, [Validators.required, Validators.email]],
        companyAddress: [this.company.companyAddress, [Validators.maxLength(200)]],
        companyPhone: [this.company.companyPhone, [
          Validators.pattern(/^[0-9+\-\s]{7,20}$/),
          Validators.maxLength(20)
        ]]
      });
    } else {
      this.error = 'No company data provided';
    }
  }

  loadCompany(id: number): void {
    this.companyService.getCompanyById(id).subscribe({
      next: (data) => {
        this.company = data;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load company';
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.error = 'Please correct the errors in the form.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    const updatedCompany: Company = {
      ...this.company,
      ...this.form.value
    };

    console.log('Submitting update:', updatedCompany);

    this.companyService.updateCompany(this.company.idCompany, {
      ...this.company,
      ...this.form.value
    }).subscribe({
      next: (updated) => {
        this.success = true;
        this.dialogRef.close(updated);
      },
      error: (err) => {
        console.error('Update error:', err);
        this.error = 'Failed to update company';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
