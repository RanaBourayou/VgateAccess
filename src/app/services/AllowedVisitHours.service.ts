import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AllowedVisitHours } from '../models/allowedHours.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllowedVisitHoursService {
  private apiUrl = 'http://localhost:8080/visteonS/api/settings/visit-hours';
  private serverTimeUrl = 'http://localhost:8080/visteonS/api/settings/server-time';


  constructor(private http: HttpClient) {}

  getVisitHours(): Observable<AllowedVisitHours> {
    return this.http.get<AllowedVisitHours>(this.apiUrl);
  }

  saveVisitHours(startHour: number, endHour: number): Observable<AllowedVisitHours> {
    return this.http.post<AllowedVisitHours>(this.apiUrl, { startHour, endHour });
  }

  getServerTime(): Observable<string> {
    return this.http.get(this.serverTimeUrl, { responseType: 'text' });
  }
}