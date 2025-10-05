import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewEmployeeDialogComponent } from './admin-new-employee-dialog.component';

describe('AdminNewEmployeeDialogComponent', () => {
  let component: AdminNewEmployeeDialogComponent;
  let fixture: ComponentFixture<AdminNewEmployeeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminNewEmployeeDialogComponent]
    });
    fixture = TestBed.createComponent(AdminNewEmployeeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
