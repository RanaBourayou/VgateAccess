import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/departments.model';  

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private baseUrl = 'http://localhost:8080/visteonS/api/departments';

  constructor(private http: HttpClient) {}

   getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/getALl`);
  }

   getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/getById?id=${id}`);
  }

   addDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/addDepartment`, department);
  }

   updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/updateDepartment/?id=${id}`, department);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/deleteDepartment?id=${id}`, {});
  }
}
