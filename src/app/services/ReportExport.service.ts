import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {

  private baseUrl = 'http://localhost:8080/visteonS/api/reports';  

  constructor(private http: HttpClient) {}

  exportCSV(userId: number): void {
    const params = new HttpParams().set('userId', userId.toString());

    this.http.get(`${this.baseUrl}/export/csv`, {
      params,
      responseType: 'blob' // Expect binary data (CSV file)
    }).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'visit_report.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error('CSV export failed', error);
    });
  }
}
