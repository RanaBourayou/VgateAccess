import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDepartementsComponent } from './admin-departements.component';

describe('AdminDepartementsComponent', () => {
  let component: AdminDepartementsComponent;
  let fixture: ComponentFixture<AdminDepartementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDepartementsComponent]
    });
    fixture = TestBed.createComponent(AdminDepartementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
