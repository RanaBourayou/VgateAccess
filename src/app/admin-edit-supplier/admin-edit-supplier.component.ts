import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supplier } from 'src/app/models/supplier.model';
import { SupplierService } from 'src/app/services/supplier.service';
import { CompanyService } from '../services/company.service';
import { Company } from '../models/company.model';

@Component({
  selector: 'app-admin-edit-supplier',
  templateUrl: './admin-edit-supplier.component.html',
  styleUrls: ['./admin-edit-supplier.component.css']
})
  
export class AdminEditSupplierComponent {
  supplierForm: FormGroup;
  companies: Company[] = [];

  constructor(
    public dialogRef: MatDialogRef<AdminEditSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supplier,
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private companyService: CompanyService // Inject CompanyService
  ) {
    this.supplierForm = this.fb.group({
      firstName: [data.firstName, Validators.required],
      lastName: [data.lastName, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      phone: [data.phone, Validators.required],
      companyId: [data.company?.companyName || '', Validators.required]  // <-- now using company ID
    });

    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (companies) => (this.companies = companies),
      error: (err) => console.error('Failed to load companies', err)
    });
  }

  onSave(): void {
    if (this.supplierForm.invalid) return;

    const selectedCompany = this.companies.find(c => c.idCompany === this.supplierForm.value.companyId);

    const updatedSupplier: Supplier = {
      ...this.data,
      ...this.supplierForm.value,
      company: selectedCompany
    };

    this.supplierService.updateSupplier(this.data.idSupplier!, updatedSupplier).subscribe({
      next: () => this.dialogRef.close('updated'),
      error: (err) => console.error('Update failed:', err)
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
