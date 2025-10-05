// visitor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Visitor } from '../models/visitor.model';  
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private baseUrl = 'http://localhost:8080/visteonS/api/visitors'; 

  constructor(private http: HttpClient) {}

 getAllVisitors(): Observable<Visitor[]> {
    return this.http.get<Visitor[]>(this.baseUrl);
  }

  getVisitorById(id: number): Observable<Visitor> {
    return this.http.get<Visitor>(`${this.baseUrl}/${id}`);
  }

  createVisitor(visitor: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(this.baseUrl, visitor);
  }

  updateVisitor(id: number, visitor: Visitor): Observable<Visitor> {
    return this.http.put<Visitor>(`${this.baseUrl}/${id}`, visitor);
  }

  deleteVisitor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getVisitorsPaged(page: number = 0, size: number = 10): Observable<any> {
    const params = { page: page.toString(), size: size.toString() };
    return this.http.get<any>(`${this.baseUrl}/paginated`, { params });
  }
}
