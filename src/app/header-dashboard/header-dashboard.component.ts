import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VisitRequestService } from '../services/visit-request.service';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';

@Component({
  selector: 'app-header-dashboard',
  templateUrl: './header-dashboard.component.html',
  styleUrls: ['./header-dashboard.component.css']
})
export class HeaderDashboardComponent  implements OnInit {
  firstName!: string;
  lastName!: string;
  role!: string;
    menuOpen = false;

     todayRequests: VisitRequest[] = [];
      filteredRequests: VisitRequest[] = [];   
       VisitRequestStatus = VisitRequestStatus;
        today: string = '';
      searchTerm: string = '';
      constructor(private router: Router, private visitrequestService: VisitRequestService) { }



  ngOnInit() {
    this.firstName = localStorage.getItem('firstName') || 'Réceptionniste';
    this.lastName  = localStorage.getItem('lastName')  || '';
    this.role      = localStorage.getItem('userRole')  || '';
  }

 toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  goToAccount() {
    this.menuOpen = false;
    this.router.navigate(['/account']);  // adjust to your actual account route
  }

  logout() {
    // clear storage and redirect
    localStorage.clear();
    this.router.navigate(['/signin']);
  }
  // Close menu when clicking anywhere else
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile')) {
      this.menuOpen = false;
    }
  }


    filterVisits() {
    if (!this.searchTerm) {
      this.filteredRequests = [...this.todayRequests];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredRequests = this.todayRequests.filter(req => {
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
