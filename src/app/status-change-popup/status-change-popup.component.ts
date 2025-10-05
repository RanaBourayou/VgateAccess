import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VisitRequestStatus } from '../models/visit-request.model';

@Component({
  selector: 'app-status-change-popup',
  templateUrl: './status-change-popup.component.html',
  styleUrls: ['./status-change-popup.component.css']
})
export class StatusChangePopupComponent {
  @Input() visible = false;
  @Input() changes: StatusChange[] = [];
  @Output() closed = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.closed.emit();
  }
}

export interface StatusChange {
  visitorName: string;
  visitorInitials: string;
  companyName: string;
  oldStatus: VisitRequestStatus;
  newStatus: VisitRequestStatus;
}