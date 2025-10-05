import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DepartmentService } from '../services/department.service';

@Component({
  selector: 'app-admin-new-department-dialog',
  templateUrl: './admin-new-department-dialog.component.html',
  styleUrls: ['./admin-new-department-dialog.component.css']
})
export class AdminNewDepartmentDialogComponent {
  department = {
    name: '',
    description: ''
  };

  constructor(
    private dialogRef: MatDialogRef<AdminNewDepartmentDialogComponent>,
    private departmentService: DepartmentService
  ) {}

  onSubmit() {
    this.departmentService.addDepartment(this.department).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
