import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewSupplierComponent } from './admin-new-supplier.component';

describe('AdminNewSupplierComponent', () => {
  let component: AdminNewSupplierComponent;
  let fixture: ComponentFixture<AdminNewSupplierComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminNewSupplierComponent]
    });
    fixture = TestBed.createComponent(AdminNewSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
