import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';
import { VisitRequestService } from '../services/visit-request.service';
import { Visitor } from '../models/visitor.model';
import { Role, User } from '../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { RequestDetailComponent } from '../request-detail/request-detail.component';
import { CompanyService } from '../services/company.service';
import { Company } from '../models/company.model';

@Component({
  selector: 'app-requester',
  templateUrl: './requester.component.html',
  styleUrls: ['./requester.component.css']
})
export class RequesterComponent implements OnInit {
  firstName!: string;
  lastName!: string;
  role!: string;
  menuOpen = false;
  currentDate: Date = new Date();
  currentView: 'month' | 'day' = 'month';
  selectedDate: Date | null = null;
  
  visitRequests: VisitRequest[] = [];
  todaysEvents: any[] = [];
  isLoading = true;
  companies: Company[] = [];

newRequestDate: Date | null = null;
showCreateRequestForm = false;

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
  companyName: undefined,
  companyId: null,
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
    private visitRequestService: VisitRequestService,   private dialog: MatDialog, private companyservice: CompanyService

  ) {}
openRequestDetail(requestId: number) {
  const dialogRef = this.dialog.open(RequestDetailComponent, {
    data: { requestId },
    width: '600px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'updated') {
      // ✅ Reload the list
      const userId = Number(localStorage.getItem('userId'));
      this.loadVisitRequests(userId);
      this.loadTodayRequests();
    }
  });
}


  ngOnInit() {
      console.log('LocalStorage userId:', localStorage.getItem('userId'));
  console.log('LocalStorage firstName:', localStorage.getItem('firstName'));
  console.log('LocalStorage userRole:', localStorage.getItem('userRole'));
    this.firstName = localStorage.getItem('firstName') || 'user';
    this.lastName  = localStorage.getItem('lastName')  || '';
    this.role      = localStorage.getItem('userRole')  || '';
 
    
    const userId = Number(localStorage.getItem('userId'));
    this.loadVisitRequests(userId);
      this.loadTodayRequests();  
  this.loadCompanies();

  }
  
  loadTodayRequests() {
  this.visitRequestService.getTodayRequests().subscribe(
    (requests) => {
      this.todaysEvents = requests.map(request => this.mapRequestToEvent(request));
    },
    (error) => {
      console.error('Error loading today\'s requests:', error);
    }
  );
}

  loadVisitRequests(userId: number) {
    this.isLoading = true;
    this.visitRequestService.getRequestsByRequesterId(userId).subscribe(
      (requests) => {
        this.visitRequests = requests;
        this.updateTodaysEvents();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading visit requests:', error);
        this.isLoading = false;
      }
    );
  }

  loadCompanies() {
    this.companyservice.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  updateTodaysEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.todaysEvents = this.visitRequests
      .filter(request => {
        const requestDate = new Date(request.visitDate);
        requestDate.setHours(0, 0, 0, 0);
        return requestDate.getTime() === today.getTime();
      })
      .map(request => this.mapRequestToEvent(request));
  }

 mapRequestToEvent(request: VisitRequest): any {
  const arrivalTime = this.extractTime(request.expectedArrival);
  const departureTime = this.extractTime(request.expectedDeparture);

  return {
      id: request.idVisitRequest, 
    time: `${this.formatTime(arrivalTime)} - ${this.formatTime(departureTime)}`,
    title: request.visitPurpose || 'Visit',
    location: request.personneConcernee || 'Visteon',
    visitor: request.visitor,
    status: request.visitRequestStatus
  };
}

getEventsForDay(day: Date) {
  return this.visitRequests
    .filter(request => {
      const requestDate = new Date(request.visitDate);
      return (
        requestDate.getDate() === day.getDate() &&
        requestDate.getMonth() === day.getMonth() &&
        requestDate.getFullYear() === day.getFullYear()
      );
    })
    .map(request => ({
      id: request.idVisitRequest,           // ← add this line
      time: request.expectedArrival.substring(0, 5),
      title:
        request.visitPurpose?.substring(0, 15) +
          (request.visitPurpose && request.visitPurpose.length > 15 ? '...' : '') ||
        'Visit'
    }));
}

   toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }
    goToAccount() {
    this.menuOpen = false;
    this.router.navigate(['/account']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/signin']);
  }

   @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile')) {
      this.menuOpen = false;
    }
  }
 
  
   navigate(direction: 'prev' | 'next' | 'today') {
    if (direction === 'today') {
      this.currentDate = new Date();
      this.selectedDate = new Date();
      return;
    }

    const newDate = new Date(this.currentDate);
    
    if (this.currentView === 'month') {
      // Fixed: Proper month navigation with year rollover
      const newMonth = direction === 'prev' 
        ? this.currentDate.getMonth() - 1 
        : this.currentDate.getMonth() + 1;
      
      newDate.setMonth(newMonth);
      // Adjust year if crossing boundaries
      if (newDate.getMonth() !== (newMonth + 12) % 12) {
        newDate.setFullYear(this.currentDate.getFullYear() + (direction === 'prev' ? -1 : 1));
      }
    } else if (this.selectedDate) {
      // Fixed: Day navigation uses selectedDate instead of currentDate
      const dayOffset = direction === 'prev' ? -1 : 1;
      newDate.setDate(this.selectedDate.getDate() + dayOffset);
    }
    
    this.currentDate = newDate;
    if (this.currentView === 'day') {
      this.selectedDate = new Date(newDate);
    }
  }

  // Switch between views
  switchView(view: 'month' | 'day') {
    this.currentView = view;
    if (view === 'day' && !this.selectedDate) {
      this.selectedDate = new Date(this.currentDate);
    }
  }

 

  // Generate days for the month view - optimized
  getDaysInMonth(): Date[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate days from previous month
    const daysFromPrevMonth = firstDay.getDay(); // 0 = Sunday
    // Calculate days from next month (42 days total for 6x7 grid)
    const totalDaysNeeded = 42; // 6 weeks * 7 days
    const daysFromNextMonth = totalDaysNeeded - (daysFromPrevMonth + lastDay.getDate());
    
    const days: Date[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }

  // Check if a date is today
  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  // Check if a date is selected
  isSelected(date: Date): boolean {
    return this.selectedDate ? this.isSameDate(date, this.selectedDate) : false;
  }

  // Check if a date is in the current month
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth() &&
           date.getFullYear() === this.currentDate.getFullYear();
  }

  // Utility to compare dates (ignoring time)
  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Get month name and year for display
  getMonthYear(): string {
    return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }


  // In your component class
events = [
  {
    date: new Date(2025, 5, 15), // June 15, 2025
    items: [
      { time: '9:30 AM', title: 'Product Strategy Review' },
      { time: '2:00 PM', title: 'Client Presentation' }
    ]
  },
  {
    date: new Date(2025, 5, 16), // June 16, 2025
    items: [
      { time: '4:15 PM', title: 'Team Sync Meeting' }
    ]
  }
];

extractTime(dateTime: string | undefined | null): string | null {
  if (!dateTime) return null;
  if (typeof dateTime !== 'string') return null;

  // Example input: "2025-06-19T09:30:00"
  const parts = dateTime.split('T');
  if (parts.length < 2) return null;

  // Get "09:30:00" part and trim to "09:30"
  return parts[1].substring(0, 5);
}
  formatTime = (time: string | null): string => {
  if (!time) return 'N/A';

  if (!/^\d{1,2}:\d{2}$/.test(time)) return 'N/A';

  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (isNaN(hours) || isNaN(minutes)) return 'N/A';

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

 selectDate(date: Date) {
  this.selectedDate = date;
  this.currentView = 'day';

  this.newRequestDate = date;
  this.showCreateRequestForm = true;

  // Initialize newRequest date with selected date in ISO format (yyyy-MM-dd)
  this.newRequest.visitDate = this.formatDateISO(date);
}
formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
submitNewRequest() {
  const currentUser = this.getCurrentUserFromStorage();
  if (!currentUser) {
    alert('Utilisateur non authentifié. Veuillez vous reconnecter.');
    return;
  }

   const visitDatePart = this.newRequest.visitDate;              
  const arrivalTime   = this.newRequest.expectedArrival;          
  const departureTime = this.newRequest.expectedDeparture;        

  if (!visitDatePart || !arrivalTime || !departureTime) {
    alert('Merci de remplir toutes les heures et dates.');
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
      this.loadVisitRequests(userId);
      this.loadTodayRequests();
    },
    error: (err) => {
      console.error('Erreur création:', err);
      alert('Erreur lors de la création de la demande.');
    }
  });
}

// Add resetForm method
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
private toIsoPlusOneDay(datePart: string, timePart: string = '00:00:00'): string {
  // build a local‑time string (no “Z”)
  const local = `${datePart}T${timePart}`;
  const d     = new Date(local);

  // add one day
  d.setDate(d.getDate() + 2);

  return d.toISOString();
}
private bumpPlusOneDay(localDateTime: string): string {
  // localDateTime should already be "YYYY-MM-DDTHH:mm"
  const d = new Date(localDateTime);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid input to bumpPlusOneDay: ${localDateTime}`);
  }
  d.setDate(d.getDate() + 2);
  return d.toISOString();
}


}