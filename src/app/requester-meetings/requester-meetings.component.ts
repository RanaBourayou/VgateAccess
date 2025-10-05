import { Component, OnInit } from '@angular/core';
import { VisitRequestService } from '../services/visit-request.service';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';
import { Visitor, VisitorType } from '../models/visitor.model';
import { Role, User } from '../models/user.model';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';  

@Component({
  selector: 'app-requester-meetings',
  templateUrl: './requester-meetings.component.html',
  styleUrls: ['./requester-meetings.component.css'],
  providers: [DatePipe]  
})
export class RequesterMeetingsComponent implements OnInit {
  firstName!: string;
  lastName!: string;
  role!: string;
  requests: VisitRequest[] = [];
  filteredRequests: VisitRequest[] = [];
  isLoading = true;
  currentUserId!: number ;  

  // Filter properties
  statusFilter: VisitRequestStatus[] = [];
  visitorTypeFilter: VisitorType[] = [];
  dateRange = { start: null as string | null, end: null as string | null };  
  searchTerm = '';

  // Status options
  statusOptions = Object.values(VisitRequestStatus);
  visitorTypeOptions = Object.values(VisitorType);

  constructor(
    private visitRequestService: VisitRequestService,
    private router: Router,  
    private datePipe: DatePipe  
  ) { }

  ngOnInit() {
    console.log('LocalStorage userId:', localStorage.getItem('userId'));
    console.log('LocalStorage firstName:', localStorage.getItem('firstName'));
    console.log('LocalStorage userRole:', localStorage.getItem('userRole'));
    
    this.firstName = localStorage.getItem('firstName') || 'user';
    this.lastName = localStorage.getItem('lastName') || '';
    this.role = localStorage.getItem('userRole') || '';
    
    // Get current user ID
    const userId = localStorage.getItem('userId');
    this.currentUserId = userId ? parseInt(userId, 10) : 0;
    
    if (this.currentUserId) {
      this.loadRequests();
    } else {
      console.error('User ID not found in localStorage');
      this.isLoading = false;
    }
  }

  loadRequests(): void {
    this.isLoading = true;
    this.visitRequestService.getRequestsByRequesterId(this.currentUserId)
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.filteredRequests = [...data];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading requests:', err);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(request => {
      // Status filter
      if (this.statusFilter.length > 0 && !this.statusFilter.includes(request.visitRequestStatus)) {
        return false;
      }

      // Visitor type filter - fixed undefined handling
      if (this.visitorTypeFilter.length > 0) {
        const visitorType = request.visitor?.visitorType;
        if (!visitorType || !this.visitorTypeFilter.includes(visitorType)) {
          return false;
        }
      }

      // Date range filter - fixed null handling
      const visitDate = new Date(request.visitDate);
      if (this.dateRange.start) {
        const startDate = new Date(this.dateRange.start);
        if (visitDate < startDate) return false;
      }
      if (this.dateRange.end) {
        const endDate = new Date(this.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include entire end day
        if (visitDate > endDate) return false;
      }

      // Search term filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const visitorName = request.visitor ? 
          `${request.visitor.firstName} ${request.visitor.lastName}`.toLowerCase() : '';
        const companyName = request.visitor?.companyName?.toLowerCase() || '';
        const purpose = request.visitPurpose?.toLowerCase() || '';
        
        if (!visitorName.includes(term) && 
            !companyName.includes(term) && 
            !purpose.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }

  getStatusClass(status: VisitRequestStatus): string {
    switch (status) {
      case VisitRequestStatus.APPROVED:
        return 'status-approved';
      case VisitRequestStatus.PENDING:
        return 'status-pending';
      case VisitRequestStatus.REJECTED:
        return 'status-rejected';
      case VisitRequestStatus.CANCELLED:
        return 'status-cancelled';
    
      default:
        return '';
    }
  }

  getVisitorTypeClass(type: VisitorType | undefined): string {  
    if (!type) return '';
    
    switch (type) {
      case VisitorType.SUPPLIER:
        return 'type-supplier';
      case VisitorType.INTERN:
        return 'type-intern';
      case VisitorType.CANDIDATE:
        return 'type-candidate';
      case VisitorType.GUEST:
        return 'type-guest';
      default:
        return '';
    }
  }

  formatDateTime(date: string): string {
    return this.datePipe.transform(date, 'MMM d, y, h:mm a') || '';
  }

  editRequest(id: number): void {
    this.router.navigate(['/edit-request', id]);
  }

  cancelRequest(id: number): void {
    if (confirm('Are you sure you want to cancel this request?')) {
      const request = this.requests.find(r => r.idVisitRequest === id);
      if (request) {
        const updatedRequest = { ...request, visitRequestStatus: VisitRequestStatus.CANCELLED };
        this.visitRequestService.updateVisitRequest(id, updatedRequest as VisitRequest)
          .subscribe({
            next: () => {
              this.loadRequests();
            },
            error: (err) => {
              console.error('Error cancelling request:', err);
            }
          });
      }
    }
  }

  resetFilters(): void {
    this.statusFilter = [];
    this.visitorTypeFilter = [];
    this.dateRange = { start: null, end: null };
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleStatusFilter(status: VisitRequestStatus): void {
    if (this.statusFilter.includes(status)) {
      this.statusFilter = this.statusFilter.filter(s => s !== status);
    } else {
      this.statusFilter.push(status);
    }
    this.applyFilters();
  }

  toggleVisitorTypeFilter(type: VisitorType): void {
    if (this.visitorTypeFilter.includes(type)) {
      this.visitorTypeFilter = this.visitorTypeFilter.filter(t => t !== type);
    } else {
      this.visitorTypeFilter.push(type);
    }
    this.applyFilters();
  }
}