import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
 import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SigninComponent } from './signin/signin.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HeaderDashboardComponent } from './header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from './sidebar-dashboard/sidebar-dashboard.component';
import { ReceptionistDashboardComponent } from './receptionist-dashboard/receptionist-dashboard.component';
import { RequesterComponent } from './requester/requester.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 import { FullCalendarModule } from '@fullcalendar/angular';
  import { VisitRequestService } from './services/visit-request.service';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth.interceptor';
import { RequestDetailComponent } from './request-detail/request-detail.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
 import { EditRequestDialogComponent } from './edit-request-dialog/edit-request-dialog.component';
import { RequesterMeetingsComponent } from './requester-meetings/requester-meetings.component';
import { StatusChangePopupComponent } from './status-change-popup/status-change-popup.component';
import { PinVerificationDialogComponent } from './pin-verification-dialog/pin-verification-dialog.component';
import { ReceptionistVisitRequestFormComponent } from './receptionist-visit-request-form/receptionist-visit-request-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminEmployeesComponent } from './admin-employees/admin-employees.component';
import { AdminDepartementsComponent } from './admin-departements/admin-departements.component';
import { AdminNewEmployeeDialogComponent } from './admin-new-employee-dialog/admin-new-employee-dialog.component';
import { AdminNewDepartmentDialogComponent } from './admin-new-department-dialog/admin-new-department-dialog.component';
import { AdminEditDepartmentDialogComponent } from './admin-edit-department-dialog/admin-edit-department-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AdminVisitorsComponent } from './admin-visitors/admin-visitors.component';
import { AdminVisitsComponent } from './admin-visits/admin-visits.component';
import { AdminSuppliersComponent } from './admin-suppliers/admin-suppliers.component';
import { AdminCompaniesComponent } from './admin-companies/admin-companies.component';
import { AdminNewCompanyComponent } from './admin-new-company/admin-new-company.component';
import { AdminNewSupplierComponent } from './admin-new-supplier/admin-new-supplier.component';
import { AddNewVisitRequestComponent } from './add-new-visit-request/add-new-visit-request.component';
import { ReportExportComponent } from './report-export/report-export.component';
import { AdminEditSupplierComponent } from './admin-edit-supplier/admin-edit-supplier.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminEditCompanyComponent } from './admin-edit-company/admin-edit-company.component';
import { AdminEditVisitorComponent } from './admin-edit-visitor/admin-edit-visitor.component';
import { CommonModule } from '@angular/common';
  

 @NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    SigninComponent,
    AdminDashboardComponent,
    HeaderDashboardComponent,
    SidebarDashboardComponent,
    ReceptionistDashboardComponent,
    RequesterComponent,
    NotfoundComponent,
    RequestDetailComponent,
    ConfirmationDialogComponent,
     EditRequestDialogComponent,
     RequesterMeetingsComponent,
     StatusChangePopupComponent,
     PinVerificationDialogComponent,
     ReceptionistVisitRequestFormComponent,
     AdminEmployeesComponent,
     AdminDepartementsComponent,
     AdminNewEmployeeDialogComponent,
     AdminNewDepartmentDialogComponent,
     AdminEditDepartmentDialogComponent,
     ChangePasswordComponent,
     AdminVisitorsComponent,
     AdminVisitsComponent,
     AdminSuppliersComponent,
     AdminCompaniesComponent,
     AdminNewCompanyComponent,
     AdminNewSupplierComponent,
     AddNewVisitRequestComponent,
     ReportExportComponent,
     AdminEditSupplierComponent,
     AdminSettingsComponent,
     AdminEditCompanyComponent,
     AdminEditVisitorComponent,
       
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatDatepickerModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    BrowserAnimationsModule,    FullCalendarModule,
        MatDialogModule, 
    MatInputModule,MatIconModule,   
      MatCheckboxModule,    MatProgressSpinnerModule,
      MatSnackBarModule
,  CommonModule,
    FormsModule,

    

  ],
providers: [
    VisitRequestService,
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],  bootstrap: [AppComponent]
})
export class AppModule { }
