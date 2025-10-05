import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditDepartmentDialogComponent } from './admin-edit-department-dialog.component';

describe('AdminEditDepartmentDialogComponent', () => {
  let component: AdminEditDepartmentDialogComponent;
  let fixture: ComponentFixture<AdminEditDepartmentDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminEditDepartmentDialogComponent]
    });
    fixture = TestBed.createComponent(AdminEditDepartmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
