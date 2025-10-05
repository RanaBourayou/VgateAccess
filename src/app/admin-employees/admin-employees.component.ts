import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AdminNewEmployeeDialogComponent } from '../admin-new-employee-dialog/admin-new-employee-dialog.component';
import { User } from '../models/user.model';  
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/departments.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
 import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-admin-employees',
  templateUrl: './admin-employees.component.html',
  styleUrls: ['./admin-employees.component.css']
})
export class AdminEmployeesComponent implements OnInit {
  employees: User[] = [];
  filteredEmployees: User[] = [];
  isLoading = false;
  departments: Department[] = [];
  toasts: any[] = [];
  // Pagination
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  // Search and filter
  searchTerm: string = '';
  selectedDepartmentName: string = '';


  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,    private departmentService: DepartmentService,   

  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployeesPaged();
  }

loadDepartments(): void {
  this.departmentService.getAllDepartments().subscribe({
    next: (depts) => {
      this.departments = depts;
      console.log('Loaded departments:', this.departments);  // <<<<< add this
    },
    error: (err) => {
      console.error('Failed to load departments:', err);
      this.departments = [];
    }
  });
}


loadEmployeesPaged(): void {
  this.isLoading = true;
  this.authService.getUsersPaged(this.page, this.size).subscribe({
    next: (data) => {
      this.employees = (data.content || []).map((emp: User) => ({
        ...emp,
        departmentName:
          emp.departmentName ||
          emp.department?.name ||
          (typeof emp.departement === 'object' ? emp.departement?.name : null)
      }));

      this.filteredEmployees = this.employees;
      this.totalPages = data.totalPages;
      this.totalElements = data.totalElements;
      this.isLoading = false;
      this.applyFilters();
    },
    error: (err) => {
      console.error('Failed to load employees:', err);
      this.isLoading = false;
    }
  });
}

onPageChange(newPage: number): void {
  if (newPage >= 0 && newPage < this.totalPages) {
    this.page = newPage;
    this.loadEmployeesPaged();
  }
}

onSearchChange(): void {
  this.applyFilters();
}

onDepartmentChange(): void {
  this.applyFilters();
}

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = [
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.phoneNumber,
        emp.departmentName
      ]
        .filter((val): val is string => !!val)
        .map(val => val.toLowerCase())
        .join(' ')
        .includes(this.searchTerm.toLowerCase());

      const matchesDepartment = this.selectedDepartmentName
        ? (emp.departmentName && emp.departmentName === this.selectedDepartmentName)
        : true;

      return matchesSearch && matchesDepartment;
    });
  }

  openAddEmployeeDialog(): void {
    const dialogRef = this.dialog.open(AdminNewEmployeeDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployeesPaged(); // Refresh the list after adding
      }
    });
  }

onEditEmployee(employee: User): void {
  const dialogRef = this.dialog.open(AdminNewEmployeeDialogComponent, {
    width: '500px',
    data: { employee }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.authService.updateUser(employee.id, result).subscribe({
        next: () => this.loadEmployeesPaged(),
        error: err => console.error('Failed to update employee:', err)
      });
    }
  });
}

onDeleteEmployee(id: number): void {
  const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
    width: '400px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this employee?'
    }
  });

  confirmDialog.afterClosed().subscribe(result => {
    if (result) {
      this.isLoading = true;
      this.authService.deleteUser(id).subscribe({
        next: () => {
          this.loadEmployeesPaged();
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

getDepartmentName(departmentName?: string): string {
  return departmentName || '-';
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

 
downloadEmployeesCSV(): void {
  const headers = ['First Name', 'Last Name', 'Phone Number', 'Email Address', 'Department'];
  const data = this.employees.map(emp => ({
    'First Name': emp.firstName || '',
    'Last Name': emp.lastName || '',
    'Phone Number': emp.phoneNumber || '',
    'Email Address': emp.email || '',
    'Department': this.getDepartmentName(emp.departmentName) || ''
  }));

  this.downloadCSVForTable(headers, data, 'employees');
}
exportEmployeesToPDF(): void {
  if (this.employees.length === 0) {
    this.showToast('No employees to export', 'warning');
    return;
  }

  const doc = new jsPDF();

  const headers = [[
    'First Name',
    'Last Name',
    'Phone Number',
    'Email Address',
    'Department'
  ]];

  const data = this.employees.map(emp => [
    emp.firstName || '',
    emp.lastName || '',
    emp.phoneNumber || '',
    emp.email || '',
    this.getDepartmentName(emp.departmentName) || ''
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 20,
    theme: 'grid'
  });

  doc.save(`employees-${new Date().toISOString().slice(0, 10)}.pdf`);
  this.showToast('Employees exported to PDF', 'success');
}

}
