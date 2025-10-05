import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditCompanyComponent } from './admin-edit-company.component';

describe('AdminEditCompanyComponent', () => {
  let component: AdminEditCompanyComponent;
  let fixture: ComponentFixture<AdminEditCompanyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminEditCompanyComponent]
    });
    fixture = TestBed.createComponent(AdminEditCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
