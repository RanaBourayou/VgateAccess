import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VisitRequestService } from '../services/visit-request.service';
import { VisitRequest, VisitRequestStatus } from '../models/visit-request.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RequestDetailComponent } from '../request-detail/request-detail.component';
@Component({
  selector: 'app-admin-visits',
  templateUrl: './admin-visits.component.html',
  styleUrls: ['./admin-visits.component.css']
})
export class AdminVisitsComponent implements OnInit {
  visitRequests: VisitRequest[] = [];
  filteredVisitRequests: VisitRequest[] = [];
  isLoading = true;
  toasts: any[] = [];

  searchTerm: string = '';
  selectedStatus: string = '';
  visitStatuses: string[] = Object.values(VisitRequestStatus);

  // Pagination properties
  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(
    private visitRequestService: VisitRequestService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVisitRequestsPaged();
  }

  loadVisitRequests(): void {
    this.visitRequestService.getAllVisitRequests().subscribe({
      next: (data) => {
        this.visitRequests = data;
        this.filteredVisitRequests = data;
        // No need to build visitStatuses from data anymore
      },
      error: (err) => console.error('Failed to load visit requests:', err)
    });
  }

  loadVisitRequestsPaged(page: number = this.page, size: number = this.size): void {
    this.isLoading = true;
    this.visitRequestService.getVisitRequestsPaged(page, size).subscribe({
      next: (response) => {
        this.visitRequests = response.content;
        this.filteredVisitRequests = response.content;
        this.page = response.number;
        this.size = response.size;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load paged visit requests:', err);
        this.isLoading = false;
      }
    });
  }

  filterVisitRequests(): void {
    const search = this.searchTerm.trim().toLowerCase();
    this.filteredVisitRequests = this.visitRequests.filter(request => {
      const searchable = [
        request.visitor?.firstName,
        request.visitor?.lastName,
        request.requester?.firstName,
        request.requester?.lastName,
        request.visitDate ? new Date(request.visitDate).toLocaleDateString() : '',
        request.visitRequestStatus,
        request.visitPurpose
      ]
      .filter((val): val is string => !!val)
      .join(' ')
      .toLowerCase();

      const matchesSearch = search === '' || searchable.includes(search);
      const matchesStatus = this.selectedStatus
        ? request.visitRequestStatus === this.selectedStatus
        : true;

      return matchesSearch && matchesStatus;
    });
  }

  // Call this when user changes page
  onPageChange(newPage: number): void {
    this.loadVisitRequestsPaged(newPage, this.size);
  }

  // Call this when user changes page size
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.loadVisitRequestsPaged(this.page, newSize);
  }

  onDeleteVisitRequest(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this Visit?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.visitRequestService.deleteVisitRequest(id).subscribe({
          next: () => {
            this.loadVisitRequests();
          },
          error: (err) => {
            console.error('Failed to delete visit:', err);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  exportCsv(): void {
    this.visitRequestService.exportReport('csv').subscribe({
      next: (blob) => {
        const csvBlob = new Blob([blob], { type: 'text/csv;charset=utf-8;' });

        // Create a download link
        const downloadLink = document.createElement('a');
        const url = window.URL.createObjectURL(csvBlob);
        downloadLink.href = url;
        downloadLink.setAttribute('download', 'visit_requests.csv');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      },
      error: (err) => {
        console.error('Failed to export CSV:', err);
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

  exportVisitsToPDF() {
    if (this.visitRequests.length === 0) {
      this.showToast('No visit requests to export', 'warning');
      return;
    }

    const doc = new jsPDF();

    const headers = [[
      'Visitor',
      'Requester',
      'Visit Date',
      'Status',
      'Arrival',
      'Departure',
      'Purpose'
    ]];

    const data = this.visitRequests.map(v => [
      `${v.visitor?.firstName || ''} ${v.visitor?.lastName || ''}`,
      `${v.requester?.firstName || ''} ${v.requester?.lastName || ''}`,
      v.visitDate ? new Date(v.visitDate).toLocaleDateString() : '',
      v.visitRequestStatus || '',
      v.expectedArrival ? new Date(v.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      v.expectedDeparture ? new Date(v.expectedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      v.visitPurpose || ''
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid'
    });

    doc.save(`visit-requests-${new Date().toISOString().slice(0, 10)}.pdf`);
    this.showToast('Visit requests exported to PDF', 'success');
  }
  editVisitRequest(request: VisitRequest): void {
    const dialogRef = this.dialog.open(EditRequestDialogComponent, {
      width: '600px',
      data: { request }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.loadVisitRequests();
        this.showToast('Visit request updated successfully', 'success');
      }
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
}
