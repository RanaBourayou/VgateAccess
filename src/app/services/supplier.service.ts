import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { PagedResponse } from '../models/PagedResponse.model';
 
@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private apiUrl = 'http://localhost:8080/visteonS/api/supplier';

  constructor(private http: HttpClient) {}

  // Get all suppliers
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  // Get supplier by ID
  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  // Create a new supplier
  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier);
  }

  // Update supplier by ID
  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
  }

  // Delete supplier by ID
  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Assign supplier to company
  assignSupplierToCompany(supplierId: number, companyId: number): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}/${supplierId}/assign-company/${companyId}`, null);
  }

  // Get suppliers by company ID
  getSuppliersByCompany(companyId: number): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/company/${companyId}`);
  }

 getSuppliersPaged(page: number = 0, size: number = 10): Observable<PagedResponse<Supplier>> {
  const params = { page: page.toString(), size: size.toString() };
  return this.http.get<PagedResponse<Supplier>>(`${this.apiUrl}/paginated`, { params });
}

}
