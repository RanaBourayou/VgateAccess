import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVisitsComponent } from './admin-visits.component';

describe('AdminVisitsComponent', () => {
  let component: AdminVisitsComponent;
  let fixture: ComponentFixture<AdminVisitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminVisitsComponent]
    });
    fixture = TestBed.createComponent(AdminVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
