import { Component, OnInit, AfterViewInit } from '@angular/core';
import { VisitRequestService } from '../services/visit-request.service';
import { Router } from '@angular/router';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';
import Chart from 'chart.js/auto';
import * as moment from 'moment';
import { AddNewVisitRequestComponent } from '../add-new-visit-request/add-new-visit-request.component';
import { MatDialog } from '@angular/material/dialog';
import { RequestDetailComponent } from '../request-detail/request-detail.component';
import { Supplier } from '../models/supplier.model';
import { SupplierService } from '../services/supplier.service';
import { Company } from '../models/company.model';
import { CompanyService } from '../services/company.service';
 
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  suppliers: Supplier[] = [];
  companies: Company[] = [];

  statusChart: any;
  supplierChart: any;
  firstName!: string;
  lastName!: string;
  role!: string;
  activeVisitors: VisitRequest[] = [];
    toasts: any[] = [];

  recentRequests: VisitRequest[] = [];
  VisitRequestStatus = VisitRequestStatus;
  stats: { [key: string]: number } = {};
  statusOptions: { key: string, label: string }[] = [];
  
  dateRange = {
    start: moment().subtract(10, 'days').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD')
  };
  
  supplierStats: { [key: string]: number } = {
  
  };

  // Keep raw stats from API to allow remapping once reference data loads
  private rawSupplierStats: { [key: string]: number } = {};

  // Maps for resolving IDs -> names
  private companyMap: { [id: number]: string } = {};
  private supplierCompanyMap: { [supplierId: number]: string } = {};

  constructor(
  private visitRequestService: VisitRequestService, 
  private router: Router,private dialog: MatDialog,    private supplierService: SupplierService, // <-- Inject SupplierService
  private companyService: CompanyService,

  ) { }

  ngOnInit() {
    this.firstName = localStorage.getItem('firstName') || 'Réceptionniste';
    this.lastName  = localStorage.getItem('lastName')  || '';
    this.role      = localStorage.getItem('userRole')  || '';
    
  this.loadRecentVisits();
  this.loadActiveVisitors();  
  // Load reference data first (suppliers and companies) to enable ID->name mapping
  this.loadSuppliers();
  this.loadCompanies();
  // Load stats (labels will be remapped once reference data is available)
  this.loadSupplierStats();

  }

  ngAfterViewInit() {
    this.updateStatusChart();
    this.updateSupplierChart();
  }

 private loadRecentVisits() {
  this.visitRequestService.getTodayRequests().subscribe(requests => {
    this.recentRequests = requests;
    // Example: fetch status stats after loading requests
    this.visitRequestService.getVisitsByStatus().subscribe(stats => {
      this.stats = stats;
      console.log('Status stats:', this.stats); // Debug
      this.updateStatusChart();
    });
  });
}

  loadSupplierStats() {
  this.visitRequestService.getVisitsBySupplier().subscribe({
    next: (stats) => {
  // Store raw stats and apply mapping to company names
  this.rawSupplierStats = stats;
  this.applySupplierNameMapping();
    },
    error: (err) => {
      console.error('Error loading supplier visit counts:', err);
    }
  });
}
 

onDateChange(event: Event, type: 'start' | 'end'): void {
  const input = event.target as HTMLInputElement;
  this.dateRange[type] = input.value;
  this.loadRecentVisits();
}

  updateDateRange(days: number) {
    this.dateRange = {
      start: moment().subtract(days, 'days').format('YYYY-MM-DD'),
      end: moment().format('YYYY-MM-DD')
    };
    this.loadRecentVisits();
  }

  deleteRequest(id: number) {
    if (confirm("Are you sure you want to delete this request?")) {
      this.visitRequestService.deleteVisitRequest(id).subscribe(() => {
        this.recentRequests = this.recentRequests.filter(r => r.idVisitRequest !== id);
         this.updateStatusChart();
      });
    }
  }

  editRequest(req: VisitRequest) {
    this.router.navigate(['/edit-request', req.idVisitRequest]);
  }

  sendNotification(req: VisitRequest) {
    const payload = {
      requestId: req.idVisitRequest!,
      status: req.visitRequestStatus
    };

    this.visitRequestService.notifyRequester(payload).subscribe({
      next: () => alert("Notification sent successfully."),
      error: err => alert("Error sending notification.")
    });
  }

 
 formatStatusLabel(status: string): string {
  const match = this.statusOptions.find(s => s.key === status);
  return match ? match.label : status;
}

 
  getStatusClass(status: string): string {
    switch (status) {
      case 'ARRIVED': return 'status-checkedin';
      case 'WAITING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'SCHEDULED': return 'status-secondary';
      default: return 'status-default';
    }
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      ARRIVED: '#4361ee',
      WAITING: '#3a0ca3',
      COMPLETED: '#f77d25ff',
      PENDING: '#4cc9f0',
      CANCELLED: '#f50404ff',
      UNKNOWN: '#adb5bd'
    };
    return colorMap[status] || '#adb5bd';
  }

updateStatusChart() {
  // destroy previous instance
  if (this.statusChart) {
    this.statusChart.destroy();
  }

  const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
  if (!ctx) return;

  const labels = Object.keys(this.stats);
  const data = Object.values(this.stats);

  this.statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#4361ee', '#3a0ca3', '#f78425ff', '#4cc9f0', '#b5179e'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,    // important so canvas follows wrapper size
      cutout: '60%',                // bigger hole -> thinner ring; tweak 55%-70%
      plugins: {
        legend: {
          display: false           // hide built-in legend since we use the DOM legend
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.parsed;
              const label = context.label || '';
              return `${label}: ${value}`;
            }
          }
        }
      },
      layout: {
        padding: {
          top: 6,
          bottom: 6,
          left: 6,
          right: 6
        }
      }
    }
  });
}


  initSupplierChart(): void {
    const ctx = document.getElementById('supplierChart') as HTMLCanvasElement;

    this.supplierChart = new Chart(ctx, {
      type: 'bar',
      data: {
         datasets: [{
          label: 'Number of Visits',
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            '#002f6c',
            '#240fc4ff',
            '#0066b2',
            '#1a90d4ff',
            '#ff6b00'
          ],
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
         y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              padding: 10
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              padding: 10
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        }
      }
    });
  }

  updateSupplierChart() {
    if (this.supplierChart) this.supplierChart.destroy();
    const ctx = document.getElementById('supplierChart') as HTMLCanvasElement;
    this.supplierChart = new Chart(ctx, {
      type: 'bar',
      data: {
  labels: Object.keys(this.supplierStats), // Company names (mapped)
        datasets: [{
          label: 'Number of Visits',
          data: Object.values(this.supplierStats), // Visit counts
          backgroundColor: '#4361ee'
        }]
      },
      options: {
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { title: { display: true, text: 'Supplier Name' } },
          y: { title: { display: true, text: 'Number of Visits' }, beginAtZero: true }
        }
      }
    });
  }
loadActiveVisitors() {
  this.visitRequestService.getVisitorsStillOnSite().subscribe({
    next: visitors => {
      this.activeVisitors = visitors;
      console.log('Active visitors on site:', this.activeVisitors);
    },
    error: err => {
      console.error('Error loading active visitors', err);
    }
  });
}

  openNewRequestDialog() {
    const dialogRef = this.dialog.open(AddNewVisitRequestComponent, {
      width: '600px',  // adjust width as needed
      disableClose: true, // optional, prevent closing by clicking outside
      data: {} // optional: pass data to dialog if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
      // You can refresh data or do other actions here if needed
    });
  }
 openRequestDetail(requestId: number) {
   const dialogRef = this.dialog.open(RequestDetailComponent, {
     width: '600px',
     data: { requestId }
   });
 
   dialogRef.afterClosed().subscribe(result => {
     if (result === 'deleted' || result === 'updated') {
       // reload everything
    
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

  onExport(format: 'csv' | 'pdf') {
    this.visitRequestService.exportReport(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visitors-report-${new Date().toISOString().slice(0,10)}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showToast(`Report exported as ${format.toUpperCase()}`, 'success');
      },
      error: (err) => {
        console.error('Export failed:', err);
        this.showToast('Export failed. Please try again.', 'error');
      }
    });
  }

exportTableToCSV() {
    if (this.recentRequests.length === 0) {
        this.showToast('No data to export', 'warning');
        return;
    }

    // Prepare CSV content
    const csvRows = [];
    
    // Create headers
    const headers = [
        'Visitor', 
        'Visitor Type', 
        'Visit Date', 
        'Arrival - Departure', 
        'Visit Purpose', 
        'Status'
    ];
    csvRows.push(headers.join(','));

    // Add data rows
    this.recentRequests.forEach(req => {
        const row = [
            `"${req.visitor?.firstName} ${req.visitor?.lastName}"`,
            `"${req.visitor?.visitorType || ''}"`,
            `"${this.formatDate(req.visitDate)}"`,
            `"${this.formatTime(req.visitDate)} - ${this.formatTime(req.expectedDeparture)}"`,
            `"${req.visitPurpose}"`,
            `"${this.formatStatusLabel(req.visitRequestStatus)}"`
        ];
        csvRows.push(row.join(','));
    });

    // Create CSV file
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    // Trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitors-table-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('Table exported as CSV', 'success');
}

// Helper functions for date formatting
private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

private formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}


  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        // Build supplierId -> companyName map
        this.supplierCompanyMap = {};
        for (const s of this.suppliers) {
          if (s.idSupplier != null) {
            const name = s.company?.companyName || s.companyName;
            if (name) this.supplierCompanyMap[s.idSupplier] = name;
          }
        }
        // Re-apply mapping if stats already loaded
        this.applySupplierNameMapping();
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
      }
    });
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        // Build companyId -> companyName map
        this.companyMap = {};
        for (const c of this.companies) {
          if (c?.idCompany != null) this.companyMap[c.idCompany] = c.companyName;
        }
        // Re-apply mapping if stats already loaded
        this.applySupplierNameMapping();
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  // Transform raw stats keys into company names; merge counts for same name
  private applySupplierNameMapping() {
    if (!this.rawSupplierStats || Object.keys(this.rawSupplierStats).length === 0) return;
    const display: { [key: string]: number } = {};
    for (const [rawKey, count] of Object.entries(this.rawSupplierStats)) {
      const name = this.mapSupplierKeyToCompanyName(rawKey);
      display[name] = (display[name] || 0) + count;
    }
    this.supplierStats = display;
    this.updateSupplierChart();
  }

  private mapSupplierKeyToCompanyName(rawKey: string): string {
    if (!rawKey || rawKey.toUpperCase() === 'UNKNOWN' || rawKey.toUpperCase() === 'NULL') {
      return 'UNKNOWN';
    }
    // If the key is numeric, try mapping to company or supplier -> company
    const maybeId = Number(rawKey);
    if (!Number.isNaN(maybeId)) {
      if (this.companyMap[maybeId]) return this.companyMap[maybeId];
      if (this.supplierCompanyMap[maybeId]) return this.supplierCompanyMap[maybeId];
    }
    // Fallback: keep raw string
    return rawKey;
  }

  // Example: Get suppliers by company
  loadSuppliersByCompany(companyId: number) {
    this.supplierService.getSuppliersByCompany(companyId).subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (err) => {
        console.error('Error loading suppliers by company:', err);
      }
    });
  }
}