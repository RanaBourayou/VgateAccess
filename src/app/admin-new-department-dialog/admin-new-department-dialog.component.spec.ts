import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewDepartmentDialogComponent } from './admin-new-department-dialog.component';

describe('AdminNewDepartmentDialogComponent', () => {
  let component: AdminNewDepartmentDialogComponent;
  let fixture: ComponentFixture<AdminNewDepartmentDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminNewDepartmentDialogComponent]
    });
    fixture = TestBed.createComponent(AdminNewDepartmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
