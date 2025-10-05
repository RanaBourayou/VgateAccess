import { Component } from '@angular/core';
import { Department } from '../models/departments.model';  
import { DepartmentService } from '../services/department.service';
import { MatDialog } from '@angular/material/dialog';
import { AdminNewDepartmentDialogComponent } from '../admin-new-department-dialog/admin-new-department-dialog.component';
import { AdminEditDepartmentDialogComponent } from '../admin-edit-department-dialog/admin-edit-department-dialog.component';
 import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-departements',
  templateUrl: './admin-departements.component.html',
  styleUrls: ['./admin-departements.component.css']
})
export class AdminDepartementsComponent {
  departments: Department[] = [];
   toasts: any[] = [];
  isLoading = true;

  constructor(
    private departmentService: DepartmentService,
    private dialog: MatDialog, 
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe(data => {
      this.departments = data;
    });
  }

 openAddDepartmentDialog() {
    const dialogRef = this.dialog.open(AdminNewDepartmentDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments(); // Refresh list after successful addition
      }
    });
  }
 openEditDepartmentDialog(department: Department) {
    const dialogRef = this.dialog.open(AdminEditDepartmentDialogComponent, {
      width: '400px',
      data: department
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

 
 deleteDepartment(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this department?'
      }
    });
  
    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.departmentService.deleteDepartment(id).subscribe({
          next: () => {
            this.loadDepartments();
          },
          error: (err) => {
            console.error('Failed to delete department:', err);
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
    const headers = ['ID', 'Name', 'Description'];
    const data = this.departments.map(department => ({
      'ID': department.idDepartement,
      'Name': department.name,
      'Description': department.description
    }));

    this.downloadCSVForTable(headers, data, 'departments');
  }

  exportDepartmentsToPDF(): void {
  if (this.departments.length === 0) {
    this.showToast('No departments to export', 'warning');
    return;
  }

  const doc = new jsPDF();

  const headers = [['ID', 'Name', 'Description']];

  const data = this.departments.map(dept => [
    dept.idDepartement || '',
    dept.name || '',
    dept.description || ''
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 20,
    theme: 'grid'
  });

  doc.save(`departments-${new Date().toISOString().slice(0, 10)}.pdf`);
  this.showToast('Departments exported to PDF', 'success');
}



}
