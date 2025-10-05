import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/departments.model';

@Component({
  selector: 'app-admin-edit-department-dialog',
  templateUrl: './admin-edit-department-dialog.component.html',
  styleUrls: ['./admin-edit-department-dialog.component.css']
})
export class AdminEditDepartmentDialogComponent {
  department: Department;

  constructor(
    private dialogRef: MatDialogRef<AdminEditDepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Department,
    private departmentService: DepartmentService
  ) {
    this.department = { ...data }; // create a copy to edit
  }

  onSubmit() {
    if (this.department.idDepartement === undefined) {
      throw new Error('Department ID is missing.');
    }
    this.departmentService.updateDepartment(this.department.idDepartement, this.department)
      .subscribe(() => {
        this.dialogRef.close(true); // indicate success
      });
  }

  onCancel() {
    this.dialogRef.close(); // just close without saving
  }
}
