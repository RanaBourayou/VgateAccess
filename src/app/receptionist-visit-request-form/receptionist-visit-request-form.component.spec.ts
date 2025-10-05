import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistVisitRequestFormComponent } from './receptionist-visit-request-form.component';

describe('ReceptionistVisitRequestFormComponent', () => {
  let component: ReceptionistVisitRequestFormComponent;
  let fixture: ComponentFixture<ReceptionistVisitRequestFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceptionistVisitRequestFormComponent]
    });
    fixture = TestBed.createComponent(ReceptionistVisitRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
