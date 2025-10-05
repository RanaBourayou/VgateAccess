import { Component, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { AdminNewCompanyComponent } from '../admin-new-company/admin-new-company.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminEditCompanyComponent } from '../admin-edit-company/admin-edit-company.component';
@Component({
  selector: 'app-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.css']
})

export class AdminCompaniesComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  isLoading = true;
  toasts: any[] = [];
  searchTerm: string = '';
  selectedSupplierCount: string = '';
  supplierCounts: number[] = [];

  // Pagination state
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  constructor(private companyService: CompanyService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCompaniesPaged();
  }

  loadCompaniesPaged(): void {
    this.isLoading = true;
    this.companyService.getCompaniesPaged(this.page, this.size).subscribe({
      next: (data) => {
        this.companies = data.content || [];
        this.filteredCompanies = this.companies;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.supplierCounts = Array.from(new Set<number>((data.content || []).map((c: Company) => c.suppliers?.length || 0))).sort((a: number, b: number) => a - b);
        this.isLoading = false;
      },
      error: () => {
        this.companies = [];
        this.filteredCompanies = [];
        this.supplierCounts = [];
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadCompaniesPaged();
    }
  }

  // ...existing code...

  filterCompanies(): void {
    this.filteredCompanies = this.companies.filter(company => {
      const matchesSearch = [
        company.companyName,
        company.companyEmail,
        company.companyPhone,
        company.companyAddress,
        ...(company.suppliers?.map(s => s.firstName + ' ' + s.lastName) || [])
      ]
      .filter((val): val is string => !!val)
      .map(val => val.toLowerCase())
      .join(' ')
      .includes(this.searchTerm.toLowerCase());

      const matchesSupplierCount = this.selectedSupplierCount
        ? (company.suppliers?.length?.toString() === this.selectedSupplierCount)
        : true;

      return matchesSearch && matchesSupplierCount;
    });
  }

  openAddCompanyDialog(): void {
    const dialogRef = this.dialog.open(AdminNewCompanyComponent, {
      width: '400px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.createCompany(result).subscribe({
          next: () => {
            this.loadCompaniesPaged();
          },
          error: (err) => {
            console.error('Error adding company', err);
          }
        });
      }
    });
  }

 

  onDeleteCompany(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this Company?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.companyService.deleteCompany(id).subscribe({
          next: () => {
            this.loadCompaniesPaged();
          },
          error: (err) => {
            console.error('Failed to delete employee:', err);
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

downloadCSV(): void {
  const headers = ['Company Name', 'Email', 'Phone', 'Address', 'Suppliers'];
  const data = this.companies.map(company => ({
    'Company Name': company.companyName || '',
    'Email': company.companyEmail || '',
    'Phone': company.companyPhone || '',
    'Address': company.companyAddress || '',
    'Suppliers': company.suppliers?.length || 0
  }));

  this.downloadCSVForTable(headers, data, 'companies_report');
}

exportCompaniesToPDF() {
  if (this.companies.length === 0) {
    this.showToast('No companies to export', 'warning');
    return;
  }

  const doc = new jsPDF();

  const headers = [['Company Name', 'Email', 'Phone', 'Address', 'Suppliers']];
  const data = this.companies.map(c => [
    c.companyName,
    c.companyEmail || '',
    c.companyPhone || '',
    c.companyAddress || '',
    `${c.suppliers?.length || 0}`
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 20,
    theme: 'grid'
  });

  doc.save(`companies-${new Date().toISOString().slice(0, 10)}.pdf`);
  this.showToast('Companies exported to PDF', 'success');
}


  editCompany(company: Company): void {
    const dialogRef = this.dialog.open(AdminEditCompanyComponent, {
      width: '400px',
      data: { company }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.updateCompany(result.idCompany, result).subscribe({
          next: () => {
            this.loadCompaniesPaged();
            this.showToast('Company updated successfully', 'success');
          },
          error: (err) => {
            this.showToast('Failed to update company', 'error');
          }
        });
      }
    });
  }
 


}
