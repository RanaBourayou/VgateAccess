import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Supplier } from 'src/app/models/supplier.model';
import { SupplierService } from 'src/app/services/supplier.service';
import { AdminNewSupplierComponent } from '../admin-new-supplier/admin-new-supplier.component';
import { MatDialog } from '@angular/material/dialog';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AdminEditSupplierComponent } from '../admin-edit-supplier/admin-edit-supplier.component';
@Component({
  selector: 'app-admin-suppliers',
  templateUrl: './admin-suppliers.component.html',
  styleUrls: ['./admin-suppliers.component.css']
})
export class AdminSuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  isLoading = true;
  disableClose!: true
  toasts: any[] = [];
  searchTerm: string = '';
  selectedCompany: string = '';
  selectedStatus: string = '';
  filteredSuppliers: Supplier[] = [];
  companies: { companyName: string }[] = [];
  // Pagination properties
  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;
  constructor(
    private supplierService: SupplierService, 
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize pagination properties to ensure they're never NaN
    this.page = 0;
    this.size = 10;
    this.totalPages = 1;
    this.totalElements = 0;
  }

  ngOnInit(): void {
    this.loadSuppliers(); // Always load all suppliers (for companies dropdown)
    this.loadSuppliersPaged();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        console.log('All suppliers loaded:', data);
        this.suppliers = data;
        this.filteredSuppliers = data;
        const companyNames = this.suppliers
          .map(s => s.company?.companyName || s.companyName)
          .filter((name): name is string => !!name);
        console.log('Extracted company names:', companyNames);
        this.companies = Array.from(new Set(companyNames)).map(name => ({ companyName: name }));
        console.log('Companies for dropdown:', this.companies);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.suppliers = [];
        this.filteredSuppliers = [];
        this.companies = [];
      }
    });
  }

  loadSuppliersPaged(page: number = this.page, size: number = this.size): void {
    // Validate page and size parameters
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    if (isNaN(size) || size < 1) {
      size = 10;
    }
    
    console.log('Loading suppliers with page:', page, 'size:', size);
    
    this.isLoading = true;
    this.supplierService.getSuppliersPaged(page, size).subscribe({
      next: (response) => {
        console.log('Received paginated response:', response);
        this.suppliers = response.content;
        this.filteredSuppliers = response.content;
        // Store the old values for comparison
        const oldPage = this.page;
        const oldTotalPages = this.totalPages;
        // Only update this.page if the response number is different from the requested page
        if (typeof response.number === 'number' && response.number !== page) {
          this.page = response.number;
        }
        this.size = response.size || 10;
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || 0;
        console.log('Updated pagination: page', oldPage, '->', this.page, 'totalPages', oldTotalPages, '->', this.totalPages);
        this.isLoading = false;
        // Trigger change detection to ensure UI updates
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load paged suppliers:', err);
        this.isLoading = false;
        this.suppliers = [];
        this.filteredSuppliers = [];
        this.companies = [];
        // Reset pagination on error
        this.page = 0;
        this.totalPages = 1;
        this.totalElements = 0;
      }
    });
  }

  // Call this when user changes page
  onPageChange(newPage: number): void {
    // Always treat page as a number
    let pageNum = Number(newPage);
    if (isNaN(pageNum) || pageNum < 0) {
      pageNum = 0;
    }
    if (pageNum >= Number(this.totalPages)) {
      pageNum = Number(this.totalPages) - 1;
    }
    this.page = pageNum; // update the page property so the UI stays in sync
    this.loadSuppliersPaged(this.page, this.size);
  }

  // Call this when user changes page size
  onPageSizeChange(newSize: number): void {
    // Validate the new size
    if (isNaN(newSize) || newSize < 1) {
      newSize = 10;
    }
    this.size = newSize;
    this.loadSuppliersPaged(this.page, newSize);
  }

  openAddSupplierDialog(): void {
    const dialogRef = this.dialog.open(AdminNewSupplierComponent, {
      width: '600px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        this.loadSuppliers(); // Refresh the list after creation (all suppliers, so companies update)
        this.loadSuppliersPaged(); // Refresh the paged list
      }
    });
  }

  editSupplier(supplier: Supplier): void {
    this.blurActiveElement(); // Add this line

    const dialogRef = this.dialog.open(AdminEditSupplierComponent, {
      width: '600px',
      data: supplier
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.loadSuppliers(); // Refresh the list after edit (all suppliers, so companies update)
        this.loadSuppliersPaged();
        this.showToast('Supplier updated successfully', 'success');
      }
    });
  }

  deleteSupplier(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this supplier?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.supplierService.deleteSupplier(id).subscribe({
          next: () => {
            this.loadSuppliers(); // Refresh the list after delete (all suppliers, so companies update)
            this.loadSuppliersPaged();
          },
          error: (err) => {
            console.error('Failed to delete supplier:', err);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    const toast = {
      id: Date.now(),
      message,
      visible: true,
      type
    };

    this.toasts.push(toast);

    setTimeout(() => {
      toast.visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== toast.id);
      }, 500);
    }, 3000);
  }

  downloadCSVForTable(headers: string[], data: any[], filename: string): void {
    const separator = ';';
    const bom = '\uFEFF';

    // Build the CSV content
    const csvContent = [
      headers.join(separator),
      ...data.map(row => headers.map(header => {
        let cell = row[header];
        return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
      }).join(separator))
    ].join('\r\n');

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  downloadSuppliersCSV(): void {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company'];
    const data = this.suppliers.map(supplier => ({
      'First Name': supplier.firstName || '',
      'Last Name': supplier.lastName || '',
      'Email': supplier.email || '',
      'Phone': supplier.phone || '',
      'Company': supplier.company?.companyName || supplier.companyName || ''
    }));

    this.downloadCSVForTable(headers, data, 'suppliers');
  }


  exportSuppliersToPDF(): void {
    if (this.suppliers.length === 0) {
      this.showToast('No suppliers to export', 'warning');
      return;
    }

    const doc = new jsPDF();

    const headers = [[
      'First Name', 'Last Name', 'Email', 'Phone', 'Company'
    ]];

    const data = this.suppliers.map(supplier => [
      supplier.firstName || '',
      supplier.lastName || '',
      supplier.email || '',
      supplier.phone || '',
      supplier.company?.companyName || supplier.companyName || ''
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid'
    });

    doc.save(`suppliers-${new Date().toISOString().slice(0, 10)}.pdf`);
    this.showToast('Suppliers exported to PDF', 'success');
  }


  filterSuppliers(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      const matchesSearch = [
        supplier.firstName,
        supplier.lastName,
        supplier.email,
        supplier.phone,
        supplier.company?.companyName,
        supplier.companyName
      ]
      .filter((val): val is string => !!val)
      .map(val => val.toLowerCase())
      .join(' ')
      .includes(this.searchTerm.toLowerCase());

      const matchesCompany = this.selectedCompany
        ? (supplier.company?.companyName === this.selectedCompany || supplier.companyName === this.selectedCompany)
        : true;

 

      return matchesSearch && matchesCompany ;
    });
  }

  // Pagination helper methods
  isFirstPage(): boolean {
    // Ensure page is a number
    return Number(this.page) === 0;
  }

  isLastPage(): boolean {
    // Ensure page and totalPages are numbers
    return Number(this.page) >= Number(this.totalPages) - 1;
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  
}
