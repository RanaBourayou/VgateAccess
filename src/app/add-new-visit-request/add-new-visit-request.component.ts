import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';
import { VisitRequestService } from '../services/visit-request.service';
import { Visitor } from '../models/visitor.model';
import { Role, User } from '../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { RequestDetailComponent } from '../request-detail/request-detail.component';
import { Company } from '../models/company.model';
import { CompanyService } from '../services/company.service';
@Component({
  selector: 'app-add-new-visit-request',
  templateUrl: './add-new-visit-request.component.html',
  styleUrls: ['./add-new-visit-request.component.css']
})
export class AddNewVisitRequestComponent implements OnInit {
    firstName!: string;
  lastName!: string;
  role!: string;
    allowedStartHour = Number(localStorage.getItem('allowedStartHour')) || 17;
  allowedEndHour = Number(localStorage.getItem('allowedEndHour')) || 8;

showCreateRequestForm = false;
newRequestDate: Date | null = null;
  companies: Company[] = [];

  newRequest: VisitRequest = {
  visitDate: '',
  expectedArrival: '',
  expectedDeparture: '',
  visitPurpose: '',
  personneConcernee: '',
  visitRequestStatus: VisitRequestStatus.PENDING,
  requester: null as any,
  additionalGuests: undefined
};
currentUser: User | null = null;
newVisitor: Visitor = {
  visitorType: undefined,
  firstName: '',
  lastName: '',
  email: '',
  cin: undefined,         
  phoneNumber: undefined,  
companyId: null
 };
  hasExtraGuests = false;
  extraGuestCount = 0;
  guestForms: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }> = [];

  buildGuestForms() {
  this.guestForms = [];
  for (let i = 0; i < this.extraGuestCount; i++) {
    this.guestForms.push({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    });
  }
}
  constructor(
    private router: Router,
    private visitRequestService: VisitRequestService,   private dialog: MatDialog,    private companyService: CompanyService,
    

  ) {}

  ngOnInit() {
      console.log('LocalStorage userId:', localStorage.getItem('userId'));
  console.log('LocalStorage firstName:', localStorage.getItem('firstName'));
  console.log('LocalStorage userRole:', localStorage.getItem('userRole'));
    this.firstName = localStorage.getItem('firstName') || 'user';
    this.lastName  = localStorage.getItem('lastName')  || '';
    this.role      = localStorage.getItem('userRole')  || '';
 
      this.newRequestDate = new Date();           
      this.showCreateRequestForm = true;    
    const userId = Number(localStorage.getItem('userId'));
   this.loadCompanies();  


  }


  submitNewRequest() {
 
  const currentUser = this.getCurrentUserFromStorage();
  if (!currentUser) {
    alert('user not connected, please login');
    return;
  }

   const visitDatePart = this.newRequest.visitDate;              
  const arrivalTime   = this.newRequest.expectedArrival;          
  const departureTime = this.newRequest.expectedDeparture;        

  if (!visitDatePart || !arrivalTime || !departureTime) {
    alert('please fill all hours and dates.');
    return;
  }
    // Check arrival < departure
  const arrivalDate = new Date(`${visitDatePart}T${arrivalTime}`);
  const departureDate = new Date(`${visitDatePart}T${departureTime}`);
  if (arrivalDate >= departureDate) {
    alert('Expected arrival must be before expected departure.');
    return;
  }

   const visitDateTimeLocal     = `${visitDatePart}T00:00`;
  const arrivalDateTimeLocal   = `${visitDatePart}T${arrivalTime}`;
  const departureDateTimeLocal = `${visitDatePart}T${departureTime}`;

   const visitDateISO      = this.bumpPlusOneDay(visitDateTimeLocal);
  const expectedArrivalISO   = this.bumpPlusOneDay(arrivalDateTimeLocal);
  const expectedDepartureISO = this.bumpPlusOneDay(departureDateTimeLocal);

 this.newVisitor.idVisitor = undefined;  

const payload: VisitRequest = {
  ...this.newRequest,
  visitDate:        visitDateISO,
  expectedArrival:  expectedArrivalISO,
  expectedDeparture:expectedDepartureISO,
  visitRequestStatus: VisitRequestStatus.PENDING,
  requester: currentUser,
  visitor: this.newVisitor,
  additionalGuests: []  
};

   // Add additional guests to payload
if (this.hasExtraGuests) {
  payload.additionalGuests = this.guestForms.map(g => ({
    firstNameGuest: g.firstName,
    lastNameGuest: g.lastName,
    email: g.email,
    phoneNumber: g.phoneNumber ? +g.phoneNumber : 0,
    arrival: expectedArrivalISO,
    departure: expectedDepartureISO
  }));
}


  console.log('Payload envoyé:', payload);


  this.visitRequestService.createVisitRequest(payload).subscribe({
    next: (created) => {
      alert('Demande créée avec succès!');
      this.showCreateRequestForm = false;
      this.resetForm();
      
      // Reload data
      const userId = Number(localStorage.getItem('userId'));
 
    },
    error: (err) => {
      console.error('Erreur création:', err);
      alert('Erreur lors de la création de la demande.');
    }
  });
}

resetForm() {
  this.newRequest = {} as VisitRequest;
  this.newVisitor = {
    visitorType: undefined,
    firstName: '',
    lastName: '',
    email: '',
    cin: undefined,
    phoneNumber: undefined,
    companyName: undefined,
  };
  this.hasExtraGuests = false;
  this.extraGuestCount = 0;
  this.guestForms = [];
}


cancelNewRequest() {
  this.showCreateRequestForm = false;
  this.newRequest = {} as VisitRequest;
    window.location.reload();  

}

private bumpPlusOneDay(localDateTime: string): string {
  // localDateTime should already be "YYYY-MM-DDTHH:mm"
  const d = new Date(localDateTime);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid input to bumpPlusOneDay: ${localDateTime}`);
  }
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}
private getCurrentUserFromStorage(): User | null {
  const id = Number(localStorage.getItem('userId'));
  if (!id) return null;

  const roleStr = localStorage.getItem('userRole') || 'REQUESTER';
  // Ensure role matches enum Role
  const role = Role[roleStr as keyof typeof Role] || Role.REQUESTER;

  return {
    id,
    firstName: localStorage.getItem('firstName') || '',
    lastName: localStorage.getItem('lastName') || '',
    email: localStorage.getItem('email') || '',
    password: '', 
    role,
    phoneNumber: localStorage.getItem('phoneNumber') || '',
    isActive: true,
    createdAt: new Date(), 
    updatedAt: new Date(),

     passwordResetToken: undefined,
    passwordResetTokenExpiry: undefined,

     getAuthorities: () => [{ authority: role.toString() }],
    getPassword: () => '',
    getUsername: () => localStorage.getItem('username') || '',
    isAccountNonExpired: () => true,
    isAccountNonLocked: () => true,
    isCredentialsNonExpired: () => true,
    isEnabled: () => true,
  };
}

loadCompanies() {
  this.companyService.getCompanies().subscribe({
    next: (data) => {
      this.companies = data;
    },
    error: (err) => {
      console.error('Error loading companies:', err);
    }
  });

}


}
