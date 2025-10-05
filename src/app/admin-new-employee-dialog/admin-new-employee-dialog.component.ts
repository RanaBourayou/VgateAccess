import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/departments.model';

@Component({
  selector: 'app-admin-new-employee-dialog',
  templateUrl: './admin-new-employee-dialog.component.html',
  styleUrls: ['./admin-new-employee-dialog.component.css']
})
export class AdminNewEmployeeDialogComponent implements OnInit {
  employeeForm: FormGroup;
  departments: Department[] = [];
  isLoading = false;
  showDepartmentField = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AdminNewEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
password: [
  '',
  [ Validators.required,Validators.minLength(8),Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)   ]
],      
    phoneNumber: ['', Validators.required],
      departmentId: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();

    // Listen to role changes and update department validators accordingly
this.employeeForm.get('role')?.valueChanges.subscribe(role => {
  this.showDepartmentField = role?.toUpperCase() === 'REQUESTER';
 

      const departmentControl = this.employeeForm.get('departmentId');

      if (role === 'REQUESTER') {
        departmentControl?.setValidators([Validators.required]);
      } else {
        departmentControl?.clearValidators();
        departmentControl?.setValue(null);
      }

      departmentControl?.updateValueAndValidity();
    });
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to load departments', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      return;
    }

    const formData = this.employeeForm.value;

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      departmentId: formData.departmentId,
    };

    this.isLoading = true;

    const request$ = formData.role === 'RECEPTIONIST'
      ? this.authService.registerReceptionist(payload)
      : this.authService.registerRequester(payload);

    request$.subscribe({
      next: () => this.handleSuccess('User created successfully'),
      error: (err) => this.handleError('User creation failed', err)
    });
  }

  handleSuccess(message: string): void {
    this.isLoading = false;
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.dialogRef.close(true);
  }

  handleError(message: string, error: any): void {
    this.isLoading = false;
    const msg = error?.error?.error || error?.message || 'Unknown error';
    this.snackBar.open(`${message}: ${msg}`, 'Close', { duration: 5000 });
    console.error('Registration error:', error);
  }

  onCancel(): void {
    this.dialogRef.close();
  }


  
}
