// report-export.component.ts
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-report-export',
  template: `
    <div class="export-options">
      <button class="btn btn-outline" (click)="export.emit('csv')">
        <i class="fas fa-file-csv"></i> Export CSV
      </button>
      <button class="btn btn-outline" (click)="export.emit('pdf')">
        <i class="fas fa-file-pdf"></i> Export PDF
      </button>
    </div>
  `,
  styles: [`
    .export-options {
      display: flex;
      gap: 1rem;
    }
    .btn-outline {
      border: 1px solid #ddd;
      background: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-outline:hover {
      background: #f5f5f5;
    }
  `]
})
export class ReportExportComponent {
  @Output() export = new EventEmitter<'csv' | 'pdf'>();
}