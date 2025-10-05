 import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Company } from '../models/company.model';
 
@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = 'http://localhost:8080/visteonS/api/company';

  constructor(private http: HttpClient) {}

   getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

   getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

   createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

   updateCompany(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company);
  }

   deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

   getCompanyByName(name: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/name/${name}`);
  }

  exportReport(format: 'csv' ): Observable<Blob> {
    const userId = localStorage.getItem('userId'); 
    return this.http.get(`http://localhost:8080/visteonS/api/reports/export/${format}`, {
      params: { userId: userId || '' },
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'text/csv; charset=UTF-8'
      })
    }).pipe(
      catchError(error => {
        console.error('Export error:', error);
        return throwError(() => new Error('Failed to export report'));
      })
    );
  }
    
  getCompaniesPaged(page: number, size: number): Observable<any> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<any>(`${this.apiUrl}/paginated`, { params });
}
    
}
