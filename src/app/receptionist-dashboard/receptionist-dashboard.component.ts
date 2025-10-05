import { Component, HostListener, OnInit,OnDestroy ,Input } from '@angular/core';
import { Router } from '@angular/router';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';
import { VisitRequestService } from '../services/visit-request.service';
import { DatePipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { StatusChangePopupComponent } from '../status-change-popup/status-change-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { PinVerificationDialogComponent } from '../pin-verification-dialog/pin-verification-dialog.component';
import { ReceptionistVisitRequestFormComponent } from '../receptionist-visit-request-form/receptionist-visit-request-form.component';
import { RequestDetailComponent } from '../request-detail/request-detail.component';
import { AddNewVisitRequestComponent } from '../add-new-visit-request/add-new-visit-request.component';
import { AllowedVisitHoursService } from '../services/AllowedVisitHours.service';

@Component({
  selector: 'app-receptionist-dashboard',
  templateUrl: './receptionist-dashboard.component.html',
  styleUrls: ['./receptionist-dashboard.component.css'],
  providers: [DatePipe],
  
})
export class ReceptionistDashboardComponent implements OnInit ,OnDestroy{


    @Input() pageTitle?: string; // optional
activeTable: 'today' | 'all' = 'today';
filteredAllRequests: VisitRequest[] = [];
  showAllVisitsTable = false;
  firstName!: string;
  lastName!: string;
  role!: string;
  menuOpen = false;
    toasts: any[] = [];
  notificationStates: { [key: number]: boolean } = {};
 disableClose!: true
 
currentHour: number = new Date().getHours();
private currentHourInterval: any;

  // Data properties
  // Pagination state for today's visits
  todayRequests: VisitRequest[] = [];
  filteredRequests: VisitRequest[] = [];
  todayPage: number = 0;
  todayPageSize: number = 10;
  todayTotal: number = 0;

  // Pagination state for all visits
  allRequests: VisitRequest[] = [];
  allPage: number = 0;
  allPageSize: number = 10;
  allTotal: number = 0;

  // Pagination page count getter for template
  get allTotalPages(): number {
    return Math.ceil(this.allTotal / this.allPageSize) || 1;
  }

  get todayTotalPages(): number {
    return Math.ceil(this.todayTotal / this.todayPageSize) || 1;
  }
  VisitRequestStatus = VisitRequestStatus;

    private refreshInterval = 30000; // 30 seconds
  private refreshSubscription!: Subscription;
   lastRefreshTime = new Date();
  // Summary properties
  summary = {
    total: 0,
    arrivals: 0,
    waiting: 0,
    cancelled: 0
  };
allowedStartHour?: number;
allowedEndHour?: number;

  // UI properties
  today: string = '';
  searchTerm: string = '';
  sliderSteps: VisitRequestStatus[] = [
    VisitRequestStatus.ARRIVED,
    VisitRequestStatus.WAITING,
    VisitRequestStatus.ABSENT, 
    VisitRequestStatus.APPROVED,
    VisitRequestStatus.REJECTED,
    VisitRequestStatus.COMPLETED
  ];
 
  constructor(
    private router: Router,
    private visitRequestService: VisitRequestService,
    private datePipe: DatePipe, private dialog: MatDialog,
    private visitHoursService: AllowedVisitHoursService,
  ) {}

  ngOnInit() {
    this.firstName = localStorage.getItem('firstName') || 'Réceptionniste';
    this.lastName  = localStorage.getItem('lastName')  || '';
    this.role      = localStorage.getItem('userRole')  || '';

    this.loadTodaysVisits(this.todayPage, this.todayPageSize);
    this.loadAllRequests(this.allPage, this.allPageSize);
    this.loadSummaryData();
    this.setTodayDate();
    this.retrieveAllowedHours();
    this.updateCurrentHour();
    // Update current hour every minute
    this.currentHourInterval = setInterval(() => {
      this.updateCurrentHour();
    }, 60000);
  }
    ngOnDestroy() {
    this.stopAutoRefresh();
      if (this.currentHourInterval) {
    clearInterval(this.currentHourInterval);
  }
  }
  onNewVisitClick(): void {
  if (this.isWithinAllowedHours()) {
    this.openNewVisitRequestDialog();
  }
}

  private loadInitialData() {
    this.loadTodaysVisits();
    this.loadAllRequests();
    this.loadSummaryData();
    this.setTodayDate();
  }

  private startAutoRefresh() {
    this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
      this.checkForUpdates();
    });
  }

 private stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private checkForUpdates() {
    const previousTodayRequests = [...this.todayRequests];
    const previousAllRequests = [...this.allRequests];

    this.visitRequestService.getTodayRequests().subscribe(updatedTodayRequests => {
      this.compareAndNotify(previousTodayRequests, updatedTodayRequests, 'today');
      this.todayRequests = updatedTodayRequests;
      this.filteredRequests = [...updatedTodayRequests];
    });

    this.visitRequestService.getAllVisitRequests().subscribe(updatedAllRequests => {
      this.compareAndNotify(previousAllRequests, updatedAllRequests, 'all');
      this.allRequests = updatedAllRequests;
    });

    this.lastRefreshTime = new Date();
  }

  private compareAndNotify(previous: VisitRequest[], current: VisitRequest[], type: 'today' | 'all') {
    previous.forEach(prevReq => {
      const currentReq = current.find(c => c.idVisitRequest === prevReq.idVisitRequest);
      if (currentReq && currentReq.visitRequestStatus !== prevReq.visitRequestStatus) {
        this.showStatusChangeNotification(currentReq, prevReq.visitRequestStatus);
      }
    });
  }

  private showStatusChangeNotification(request: VisitRequest, oldStatus: VisitRequestStatus) {
    const visitorName = request.visitor ? 
      `${request.visitor.firstName} ${request.visitor.lastName}` : 'Visitor';
    
    let message = '';
    let toastType: 'success' | 'warning' | 'error' | 'info' = 'info';
    
    switch(request.visitRequestStatus) {
      case VisitRequestStatus.APPROVED:
        message = `${visitorName}'s visit has been approved (was ${oldStatus.toLowerCase()})`;
        toastType = 'success';
        break;
      case VisitRequestStatus.REJECTED:
        message = `${visitorName}'s visit has been rejected (was ${oldStatus.toLowerCase()})`;
        toastType = 'error';
        break;
      case VisitRequestStatus.WAITING:
        message = `${visitorName}'s visit is now waiting (was ${oldStatus.toLowerCase()})`;
        toastType = 'warning';
        break;
      case VisitRequestStatus.ARRIVED:
        message = `${visitorName} has arrived (was ${oldStatus.toLowerCase()})`;
        toastType = 'success';
        break;
      case VisitRequestStatus.ABSENT:
        message = `${visitorName} is marked as absent (was ${oldStatus.toLowerCase()})`;
        toastType = 'error';
        break;
      default:
        message = `${visitorName}'s status changed from ${oldStatus.toLowerCase()} to ${request.visitRequestStatus.toLowerCase()}`;
    }
    
    this.showToast(message, toastType);
  }


  private loadTodaysVisits(page: number = 0, size: number = 10) {
    // If you have a paged endpoint, use it here. Otherwise, fetch all and slice client-side.
    this.visitRequestService.getTodayRequests().subscribe(requests => {
      this.todayTotal = requests.length;
      this.todayRequests = requests.slice(page * size, (page + 1) * size);
      this.filteredRequests = [...this.todayRequests];
    });
  }

  private loadAllRequests(page: number = 0, size: number = 10) {
    this.visitRequestService.getVisitRequestsPaged(page, size).subscribe(result => {
      this.allRequests = result.content || result;
      this.allTotal = result.totalElements || this.allRequests.length;
      this.filteredAllRequests = [...this.allRequests];
    });
  }

  // Pagination handlers
  onTodayPageChange(page: number) {
    this.todayPage = page;
    this.loadTodaysVisits(this.todayPage, this.todayPageSize);
  }

  onAllPageChange(page: number) {
    this.allPage = page;
    this.loadAllRequests(this.allPage, this.allPageSize);
  }
  private loadSummaryData() {
    this.visitRequestService.getVisitCountByStatus().subscribe(data => {
      this.summary = {
        total: Object.values(data).reduce((a, b) => a + b, 0),
        arrivals: data['ARRIVED'] || 0,
        waiting: data['WAITING'] || 0,
        cancelled: data['CANCELLED'] || 0,
      };
    });
  }

  private setTodayDate() {
    this.today = this.datePipe.transform(new Date(), 'EEEE, MMMM d, y') || '';
  }

  
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }
  
  @HostListener('document:click') closeMenu() { 
    this.menuOpen = false; 
  }
  
  goToAccount() { 
    this.router.navigate(['/account']); 
  }
  
  logout() {
    localStorage.clear();
    this.router.navigate(['/signin']);
  }
setStatus(request: VisitRequest, newStatus: VisitRequestStatus) {
  const visitor = request.visitor;
  if (!visitor || !visitor.idVisitor) return;

  const visitorName = `${visitor.firstName} ${visitor.lastName}`;

  const dialogRef = this.dialog.open(PinVerificationDialogComponent, {
    width: '400px',
    data: { visitorName }
  });

 dialogRef.afterClosed().subscribe((pinCode: string) => {
    if (pinCode) {
      // CORRECTED: Use request ID instead of visitor ID
      this.visitRequestService.verifyPin(request.idVisitRequest!, parseInt(pinCode)).subscribe({
        next: (isValid) => {
          if (isValid) {
            this.performStatusUpdate(request, newStatus);
          } else {
            this.showToast("Invalid PIN code", 'error');
          }
        },
        error: (err) => {
          console.error("PIN verification failed:", err);
          this.showToast("PIN verification error", 'error');
        }
      });
    }
  });
}

private performStatusUpdate(request: VisitRequest, newStatus: VisitRequestStatus) {
  const oldStatus = request.visitRequestStatus;
  request.visitRequestStatus = newStatus;

  this.visitRequestService.updateVisitRequest(request.idVisitRequest!, request).subscribe({
    next: (updatedRequest) => {
      this.loadSummaryData();
      this.showStatusChangeNotification(updatedRequest, oldStatus);
      
      // Send notification for specific statuses
      if (newStatus === VisitRequestStatus.ARRIVED || 
          newStatus === VisitRequestStatus.ABSENT || 
          newStatus === VisitRequestStatus.WAITING) {
        this.sendNotification(updatedRequest, newStatus.toString());
      }
    },
    error: (err) => {
      console.error('Status update failed:', err);
      this.showToast('Failed to update status', 'error');
    }
  });
}
sendNotification(request: VisitRequest, status: string) {
  if (request.idVisitRequest === undefined) {
    console.error('Cannot send notification: request ID is undefined');
    return;
  }

  const payload = {
    requestId: request.idVisitRequest,
    status: status
  };

  this.notificationStates[request.idVisitRequest] = true;

  this.visitRequestService.notifyRequester(payload).subscribe({
    next: (response) => {
      console.log('Notification successful:', response);
      
      const visitorName = request.visitor ? 
        `${request.visitor.firstName} ${request.visitor.lastName}` : 'Visitor';
      const contactPerson = request.personneConcernee || 'Contact Person';
      
      this.showToast(`${contactPerson} has been notified of ${visitorName}'s arrival`);
      
      setTimeout(() => {
        this.notificationStates[request.idVisitRequest!] = false;
      }, 2000);
    },
    error: err => {
      console.error('Failed to send notification:', err);
      alert('Failed to send notification. See console for details');
      this.notificationStates[request.idVisitRequest!] = false;
    }
  });
}


showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    const toast = {
      id: Date.now(),
      message,
      visible: true,
      type
    };
    
    this.toasts.push(toast);
    
    setTimeout(() => {
      toast.visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== toast.id);
      }, 500);
    }, 3000);
}

manualRefresh() {
  this.showToast('Refreshing data...', 'info');
  this.checkForUpdates();
}

 
openRequestDetail(requestId: number) {
  const dialogRef = this.dialog.open(RequestDetailComponent, {
    width: '600px',
    data: { requestId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'deleted' || result === 'updated') {
      // reload everything
      this.loadTodaysVisits();
      this.loadAllRequests();
      this.loadSummaryData();
    }
  });
}

markAsDeparted(request: VisitRequest) {
  if (request.visitRequestStatus === 'COMPLETED') return;

  const name = `${request.visitor?.firstName} ${request.visitor?.lastName}`.trim();
  if (!confirm(`Mark ${name} as departed?`)) return;

  this.visitRequestService.markAsDeparted(request.idVisitRequest!)
    .subscribe({
      next: () => {
        request.visitRequestStatus = VisitRequestStatus.COMPLETED;
        this.showToast(`${name} marked as departed.`, 'success');
      },
      error: () => {
        this.showToast('Failed to mark as departed.', 'error');
      }
    });
}
openNewVisitRequestDialog(): void {
  const dialogRef = this.dialog.open(AddNewVisitRequestComponent, {
    width: '700px',
    disableClose: true,
      autoFocus: false,     // optional: prevents autofocus scroll bug
    restoreFocus: false  
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'submitted') {
      this.loadTodaysVisits();   // or any refresh logic
      this.loadAllRequests();
      this.loadSummaryData();
    }
  });
}
retrieveAllowedHours(): void {
  // Try backend first
  this.visitHoursService.getVisitHours().subscribe({
    next: (hours) => {
      // Normalize to 0-23 range
      const start = Math.max(0, Math.min(23, Number(hours.startHour)));
      const end = Math.max(0, Math.min(23, Number(hours.endHour)));
      this.allowedStartHour = isNaN(start) ? undefined : start;
      this.allowedEndHour = isNaN(end) ? undefined : end;
      // Cache for fallback
      if (this.allowedStartHour !== undefined && this.allowedEndHour !== undefined) {
        localStorage.setItem('allowedStartHour', String(this.allowedStartHour));
        localStorage.setItem('allowedEndHour', String(this.allowedEndHour));
      }
    },
    error: () => {
      // Fallback to cached values if API is unavailable
      const start = localStorage.getItem('allowedStartHour');
      const end = localStorage.getItem('allowedEndHour');
      if (start !== null && end !== null) {
        this.allowedStartHour = parseInt(start, 10);
        this.allowedEndHour = parseInt(end, 10);
      }
    }
  });
}



private updateCurrentHour() {
  // Prefer server time to avoid client clock drift
  this.visitHoursService.getServerTime().subscribe({
    next: (text) => {
      const hour = this.parseServerHour(text);
      this.currentHour = hour ?? new Date().getHours();
    },
    error: () => {
      this.currentHour = new Date().getHours();
    }
  });
}

private parseServerHour(text: string): number | undefined {
  // Try ISO date first
  const d = new Date(text);
  if (!isNaN(d.getTime())) {
    return d.getHours();
  }
  // Try HH:mm or HH:mm:ss
  const m = text.match(/\b(\d{1,2}):\d{2}(?::\d{2})?\b/);
  if (m) {
    const h = parseInt(m[1], 10);
    if (!isNaN(h) && h >= 0 && h <= 23) return h;
  }
  // Try plain hour
  const h2 = parseInt(text, 10);
  if (!isNaN(h2) && h2 >= 0 && h2 <= 23) return h2;
  return undefined;
}

isWithinAllowedHours(): boolean {
  if (this.allowedStartHour === undefined || this.allowedEndHour === undefined) {
    return false; // No access if admin hasn't set the range
  }

  const currentHour = this.currentHour;
  // If start == end, treat as 24-hour window (always allowed)
  if (this.allowedStartHour === this.allowedEndHour) {
    return true;
  }
  // Overnight window (e.g., 22 -> 6)
  if (this.allowedStartHour > this.allowedEndHour) {
    return currentHour >= this.allowedStartHour || currentHour < this.allowedEndHour;
  }
  // Normal same-day window
  return currentHour >= this.allowedStartHour && currentHour < this.allowedEndHour;
}
getVisitHoursTitle(): string {
  if (this.allowedStartHour === undefined || this.allowedEndHour === undefined) {
    return 'Visit hours not configured';
  }

  // start == end -> 24h
  if (this.allowedStartHour === this.allowedEndHour) {
    return 'New visits allowed 24h';
  }

  const suffix = this.allowedStartHour > this.allowedEndHour
    ? `${this.allowedEndHour}:00 next day`
    : `${this.allowedEndHour}:00`;

  return `New visits only allowed between ${this.allowedStartHour}:00 and ${suffix}`;
}


 
setActiveTable(table: 'today' | 'all') {
  this.activeTable = table;
  this.searchTerm = ''; // Clear search when switching tabs
  this.filterVisits();  // Apply any existing filter
}


// Filter for today's requests and all requests
filterVisits() {
  if (!this.searchTerm) {
    this.filteredRequests = [...this.todayRequests];
    this.filteredAllRequests = [...this.allRequests];
    return;
  }

  const term = this.searchTerm.toLowerCase().trim();
  // Filter today's requests
  this.filteredRequests = this.todayRequests.filter(req => {
    const visitorName = req.visitor ?
      `${req.visitor.firstName} ${req.visitor.lastName}`.toLowerCase() : '';
    const companyName = req.visitor?.companyName?.toLowerCase() || '';
    const contactPerson = req.personneConcernee?.toLowerCase() || '';
    return visitorName.includes(term) ||
           companyName.includes(term) ||
           contactPerson.includes(term);
  });
  // Filter all requests
  this.filteredAllRequests = this.allRequests.filter(req => {
    const visitorName = req.visitor ?
      `${req.visitor.firstName} ${req.visitor.lastName}`.toLowerCase() : '';
    const companyName = req.visitor?.companyName?.toLowerCase() || '';
    const contactPerson = req.personneConcernee?.toLowerCase() || '';
    return visitorName.includes(term) ||
           companyName.includes(term) ||
           contactPerson.includes(term);
  });
}

// Filter only for all visits (for the 'All Visits' tab)
filterAllVisits() {
  if (!this.searchTerm) {
    this.filteredAllRequests = [...this.allRequests];
    return;
  }
  const term = this.searchTerm.toLowerCase().trim();
  this.filteredAllRequests = this.allRequests.filter(req => {
    const visitorName = req.visitor ?
      `${req.visitor.firstName} ${req.visitor.lastName}`.toLowerCase() : '';
    const companyName = req.visitor?.companyName?.toLowerCase() || '';
    const contactPerson = req.personneConcernee?.toLowerCase() || '';
    return visitorName.includes(term) ||
           companyName.includes(term) ||
           contactPerson.includes(term);
  });
}


}