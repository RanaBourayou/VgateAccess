import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditVisitorComponent } from './admin-edit-visitor.component';

describe('AdminEditVisitorComponent', () => {
  let component: AdminEditVisitorComponent;
  let fixture: ComponentFixture<AdminEditVisitorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminEditVisitorComponent]
    });
    fixture = TestBed.createComponent(AdminEditVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
