// request-detail.component.ts
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VisitRequestService } from '../services/visit-request.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import { AuthService } from '../services/auth.service';
  import { MatSnackBar } from '@angular/material/snack-bar'; 
  
interface Guest {
  idCompanion?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  departure?: Date;
  tempDepartureTime?: string;
}
@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RequestDetailComponent implements OnInit {
  requestId!: number;
  visitRequest: any;
  isLoading = true;
  userRole: string = ''; 
          private snackBar!: MatSnackBar   

  constructor(
        private authService: AuthService,
    public dialogRef: MatDialogRef<RequestDetailComponent>,
    private visitRequestService: VisitRequestService,
        private dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('Dialog data:', data);
 
  }

  ngOnInit(): void {
      
   
    this.visitRequest = this.data;
    this.authService.getCurrentUser().subscribe((currentUser: any) => {
      this.userRole = currentUser?.role;
    });
  


    if (this.data?.requestId) {
      this.requestId = this.data.requestId;
      this.loadVisitRequestDetails(this.requestId);
    } else {
      console.error('No ID provided to dialog');
      this.isLoading = false;
    }

 
  }

// Updated loadVisitRequestDetails method in request-detail.component.ts
loadVisitRequestDetails(id: number): void {
  this.visitRequestService.getVisitRequestById(id).subscribe({
    next: (request) => {
      this.visitRequest = request;
      console.log('▶ Loaded visitRequest:', this.visitRequest);

      // Log the raw additionalGuests array
      console.log('▶ Raw additionalGuests:', this.visitRequest.additionalGuests);

      // If you want to inspect each guest’s name fields:
      interface AdditionalGuest {
        firstNameGuest: string;
        lastNameGuest: string;
 
      }

        (this.visitRequest.additionalGuests || []).forEach((guest: any, i: number) => {
        console.log(`Guest[${i}]:`,
          'firstNameGuest=', guest.firstNameGuest,
          'lastNameGuest=', guest.lastNameGuest
        );
      });

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Failed to load visit request details', err);
      this.isLoading = false;
    }
  });
}


  getStatusClass(status: string): string {
    return status.toUpperCase();
  }
  onUpdate(): void {
    const editDialog = this.dialog.open(EditRequestDialogComponent, {
      width: '600px',
      data: { 
        request: this.visitRequest 
      }
    });

    editDialog.afterClosed().subscribe(result => {
 if (result === 'updated') {
  this.loadVisitRequestDetails(this.requestId); //  Just refresh, don't close
}
    });
  }


onDelete(): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this request?'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.visitRequestService.deleteVisitRequest(this.requestId).subscribe({
          next: () => {
            this.dialogRef.close('deleted');
          },
          error: (err) => {
            console.error('Failed to delete request', err);
            this.isLoading = false;
          }
        });
      }
    });
  }

markGuestDeparture(guest: Guest): void {
  const guestName = `${guest.firstName} ${guest.lastName}`;
  const departureTime = new Date();
  
  this.visitRequestService.markGuestAsDeparted(guest.idCompanion!, departureTime).subscribe({
    next: (updatedGuest) => {
      guest.departure = new Date(updatedGuest.departure);
      
      // Add null check
      if (this.snackBar) {
        const timeString = guest.departure.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        this.snackBar.open(`${guestName} marked as departed at ${timeString}`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    },
    error: (err) => {
      // Add null check
      if (this.snackBar) {
        this.snackBar.open(`Failed to mark ${guestName} as departed`, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
      console.error(`Failed to mark ${guestName} as departed`, err);
    }
  });
}


}
