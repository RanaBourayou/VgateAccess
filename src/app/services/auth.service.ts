import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest } from '../models/auth-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/visteonS/api/auth';
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.storeToken(response.token))
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/me`);
  }

  // Store token in localStorage
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Decode token to get user ID
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.id || decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Get full user info (from API)
  getCurrentUserInfo(): Observable<any> {
    return this.getCurrentUser();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  registerRequester(user: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/register/requester`, user);
}

registerReceptionist(user: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/register/receptionist`, user);
}
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: number, user: User): Observable<User> {
  return this.http.put<User>(`${this.baseUrl}/users/${id}`, user);
}
deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/users/${id}`);
}

updateUserRole(userId: number, role: string): Observable<any> {
  const url = `http://localhost:8080/visteonS/api/users/${userId}/role`;
  const params = new HttpParams().set('role', role);
  return this.http.put(url, null, { params });
}
getUsersPaged(page: number = 0, size: number = 10): Observable<any> {
  const params = { page: page.toString(), size: size.toString() };
  return this.http.get<any>(`${this.baseUrl}/paginated`, { params });
}


}