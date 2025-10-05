import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterMeetingsComponent } from './requester-meetings.component';

describe('RequesterMeetingsComponent', () => {
  let component: RequesterMeetingsComponent;
  let fixture: ComponentFixture<RequesterMeetingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequesterMeetingsComponent]
    });
    fixture = TestBed.createComponent(RequesterMeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
