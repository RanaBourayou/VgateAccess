import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportExportComponent } from './report-export.component';

describe('ReportExportComponent', () => {
  let component: ReportExportComponent;
  let fixture: ComponentFixture<ReportExportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportExportComponent]
    });
    fixture = TestBed.createComponent(ReportExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
