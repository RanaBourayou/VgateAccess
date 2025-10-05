import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HeaderDashboardComponent } from './header-dashboard/header-dashboard.component';
import { SidebarDashboardComponent } from './sidebar-dashboard/sidebar-dashboard.component';
import { ReceptionistDashboardComponent } from './receptionist-dashboard/receptionist-dashboard.component';
import { RequesterComponent } from './requester/requester.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { RequestDetailComponent } from './request-detail/request-detail.component';
import { RequesterMeetingsComponent } from './requester-meetings/requester-meetings.component';
import { AdminEmployeesComponent } from './admin-employees/admin-employees.component';
import { AdminDepartementsComponent } from './admin-departements/admin-departements.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AdminVisitorsComponent } from './admin-visitors/admin-visitors.component';
import { AdminVisitsComponent } from './admin-visits/admin-visits.component';
import { AdminSuppliersComponent } from './admin-suppliers/admin-suppliers.component';
import { AdminCompaniesComponent } from './admin-companies/admin-companies.component';
import { AddNewVisitRequestComponent } from './add-new-visit-request/add-new-visit-request.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
  
const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },   
  { path: 'signin', component: SigninComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'headerdashboard', component: HeaderDashboardComponent },
  { path: 'sidebardashboard', component: SidebarDashboardComponent },
  { path: 'recep', component: ReceptionistDashboardComponent },
  { path: 'request', component: RequesterComponent },
  { path: 'request-detail/:id', component: RequestDetailComponent },
  { path: 'meeting', component: RequesterMeetingsComponent },
  { path: 'h', component: HomeComponent },
   {path:'employees', component: AdminEmployeesComponent},
   {path:'departements', component: AdminDepartementsComponent},
   { path: 'change-password', component: ChangePasswordComponent },
   { path: 'visitors', component: AdminVisitorsComponent },
   { path: 'visits', component: AdminVisitsComponent },
   { path: 'suppliers', component: AdminSuppliersComponent },
   { path: 'companies', component: AdminCompaniesComponent },
   {path: 'newvisit', component: AddNewVisitRequestComponent},
   {path: 'settings', component:AdminSettingsComponent},



 // { path: 'n', component: NotfoundComponent },
  { path: '**', component: NotfoundComponent },  
 
];

 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
