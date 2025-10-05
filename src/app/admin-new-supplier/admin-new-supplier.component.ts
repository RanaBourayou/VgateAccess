import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '../services/supplier.service';
import { CompanyService } from '../services/company.service'; // Assume this exists
import { Company } from '../models/company.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-new-supplier',
  templateUrl: './admin-new-supplier.component.html',
  styleUrls: ['./admin-new-supplier.component.css']
})
export class AdminNewSupplierComponent implements OnInit {
  supplierForm: FormGroup;
  companies: Company[] = [];
  isLoading = false;
  
  
  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private companyService: CompanyService,
     public router: Router,
    private snackBar: MatSnackBar
  ) {
this.supplierForm = this.fb.group({
  firstName: ['', [Validators.required, Validators.maxLength(50)]],
  lastName: ['', [Validators.required, Validators.maxLength(50)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  companyId: [{ value: null, disabled: true }]
});
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

loadCompanies(): void {
  this.isLoading = true;

  this.companyService.getCompanies().subscribe({
    next: (companies) => {
      this.companies = companies;
      this.isLoading = false;

      if (companies.length > 0) {
        this.supplierForm.get('companyId')?.enable(); // ✅ Safe now
      }
    },
    error: () => {
      this.snackBar.open('Failed to load companies', 'Close', { duration: 3000 });
      this.isLoading = false;
    }
  });
}


  onSubmit(): void {
    if (this.supplierForm.invalid) return;

    this.isLoading = true;
    const formValue = this.supplierForm.value;
    const supplierData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone
    };

    this.supplierService.createSupplier(supplierData).subscribe({
      next: (createdSupplier) => {
        if (formValue.companyId) {
          this.assignToCompany(createdSupplier.idSupplier!, formValue.companyId);
        } else {
          this.handleSuccess();
        }
      },
      error: () => {
        this.handleError('Failed to create supplier');
      }
    });
  }

  private assignToCompany(supplierId: number, companyId: number): void {
    this.supplierService.assignSupplierToCompany(supplierId, companyId).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError('Supplier created but company assignment failed')
    });
  }

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Handles the successful creation of a supplier.

/*******  08781372-d30d-458f-967d-33774c97e77e  *******/
  private handleSuccess(): void {
    this.isLoading = false;
    this.snackBar.open('Supplier created successfully', 'Close', { duration: 3000 });
    this.router.navigate(['/suppliers']);
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}