import { Component, OnInit } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { VisitorService } from '../services/visitor.service';
import { MatDialog } from '@angular/material/dialog';
import { Visitor, VisitorType } from '../models/visitor.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminEditVisitorComponent } from '../admin-edit-visitor/admin-edit-visitor.component';
 
@Component({
  selector: 'app-admin-visitors',
  templateUrl: './admin-visitors.component.html',
  styleUrls: ['./admin-visitors.component.css']
})
export class AdminVisitorsComponent implements OnInit {
  visitors: Visitor[] = [];
  filteredVisitors: Visitor[] = [];
  isLoading = true;
  searchTerm: string = '';
  selectedType: string = '';
  visitorTypes: string[] = Object.values(VisitorType);
  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(
    private visitorService: VisitorService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVisitors();
  }

  loadVisitors(page: number = this.page, size: number = this.size): void {
    this.isLoading = true;
    this.visitorService.getVisitorsPaged(page, size).subscribe({
      next: (response) => {
        this.visitors = response.content;
        this.filteredVisitors = response.content;
        this.page = response.number;
        this.size = response.size;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.filterVisitors();
        this.visitorTypes = Object.values(VisitorType);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load visitors', err);
        this.isLoading = false;
      }
    });
  }

  onDeleteVisitor(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this Visitor?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.visitorService.deleteVisitor(id).subscribe({
          next: () => this.loadVisitors(),
          error: (err) => {
            console.error('Failed to delete visitor:', err);
            this.isLoading = false;
          },
          complete: () => this.isLoading = false
        });
      }
    });
  }


  exportVisitorsToPDF(): void {
  if (this.visitors.length === 0) {
    console.warn('No visitors to export');
    return;
  }

  const doc = new jsPDF();
  const headers = [['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'CIN/Passport', 'Type']];
  const data = this.visitors.map(v => [
    v.firstName || '',
    v.lastName || '',
    v.email || '',
    v.phoneNumber || '',
    v.companyName || '',
    v.cin || '',
    v.visitorType || ''
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 20,
    theme: 'grid'
  });

  doc.save(`visitors-${new Date().toISOString().slice(0, 10)}.pdf`);
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
  const headers = ['First Name', 'Last Name', 'Email', 'Phone Number', 'Company Name', 'CIN/Passport', 'Visitor Type'];

  const data = this.visitors.map(visitor => ({
    'First Name': visitor.firstName || '',
    'Last Name': visitor.lastName || '',
    'Email': visitor.email || '',
    'Phone Number': visitor.phoneNumber || '',
    'Company Name': visitor.companyName || '',
    'CIN/Passport': visitor.cin || '',
    'Visitor Type': visitor.visitorType || ''
  }));

  this.downloadCSVForTable(headers, data, 'visitors_report');
}

filterVisitors(): void {
  const search = this.searchTerm.trim().toLowerCase();
  this.filteredVisitors = this.visitors.filter(visitor => {
    const searchable = [
      visitor.firstName,
      visitor.lastName,
      visitor.email,
      visitor.phoneNumber,
      visitor.companyName,
      visitor.cin,
      visitor.visitorType ? VisitorType[visitor.visitorType as keyof typeof VisitorType] : ''
    ]
    .filter((val): val is string => !!val)
    .join(' ')
    .toLowerCase();

    const matchesSearch = search === '' || searchable.includes(search);

    const matchesType = this.selectedType
      ? visitor.visitorType === this.selectedType
      : true;

    return matchesSearch && matchesType;
  });
}

openEditVisitor(visitor: Visitor): void {
  const dialogRef = this.dialog.open(AdminEditVisitorComponent, {
    width: '600px',
    data: { visitor }
  });

  dialogRef.afterClosed().subscribe((updatedVisitor: Visitor) => {
    if (updatedVisitor) {
      const index = this.visitors.findIndex(v => v.idVisitor === updatedVisitor.idVisitor);
      if (index !== -1) {
        this.visitors[index] = updatedVisitor;
        this.filterVisitors();
      }
    }
  });
}

onPageChange(newPage: number): void {
  if (newPage >= 0 && newPage < this.totalPages) {
    this.loadVisitors(newPage, this.size);
  }
}

onPageSizeChange(newSize: number): void {
  this.size = newSize;
  this.loadVisitors(this.page, newSize);
}
}