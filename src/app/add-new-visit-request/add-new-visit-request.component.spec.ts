import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewVisitRequestComponent } from './add-new-visit-request.component';

describe('AddNewVisitRequestComponent', () => {
  let component: AddNewVisitRequestComponent;
  let fixture: ComponentFixture<AddNewVisitRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewVisitRequestComponent]
    });
    fixture = TestBed.createComponent(AddNewVisitRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
