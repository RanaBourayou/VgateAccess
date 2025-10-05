import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Companion } from "../models/companion.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class visitorGuestService {
  private baseUrl = 'http://localhost:8080/visteonS/api/visitors-guests';

  constructor(private http: HttpClient) {}

  createVisitorGuest(guest: Companion): Observable<Companion> {
    return this.http.post<Companion>(this.baseUrl, guest);
  }

  getVisitorGuestById(id: number): Observable<Companion> {
    return this.http.get<Companion>(`${this.baseUrl}/${id}`);
  }

  getAllVisitorGuests(): Observable<Companion[]> {
    return this.http.get<Companion[]>(this.baseUrl);
  }

  updateVisitorGuest(id: number, guest: Companion): Observable<Companion> {
    return this.http.put<Companion>(`${this.baseUrl}/${id}`, guest);
  }

  deleteVisitorGuest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}