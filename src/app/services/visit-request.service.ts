import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { VisitRequest } from '../models/visit-request.model'; 
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Companion } from '../models/companion.model';

@Injectable({
  providedIn: 'root'
})
export class VisitRequestService {
  private baseUrl = 'http://localhost:8080/visteonS/api/visit-requests'; 

  constructor(private http: HttpClient) {}

  createVisitRequest(request: VisitRequest): Observable<VisitRequest> {
    return this.http.post<VisitRequest>(this.baseUrl, request);
  }

  getVisitRequestById(id: number): Observable<VisitRequest> {
    return this.http.get<VisitRequest>(`${this.baseUrl}/${id}`);
  }

  getAllVisitRequests(): Observable<VisitRequest[]> {
    return this.http.get<VisitRequest[]>(this.baseUrl);
  }

  getVisitRequestsPaged(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>('http://localhost:8080/visteonS/api/visit-requests', { params });
  }

/*updateVisitRequest(id: number, request: any): Observable<VisitRequest> {
  const payload = {
    ...request,
    version: request.version, // Include version field
    requester: { id: request.requester?.id },
    visitor: request.visitor ? { 
      idVisitor: request.visitor.idVisitor,
      ...request.visitor 
    } : null,
    guests: request.guests ? request.guests.map((guest: any) => ({
      ...guest,
      arrival: guest.arrivalTime ? this.combineDateTime(request.visitDate, guest.arrivalTime) : null,
      departure: guest.departureTime ? this.combineDateTime(request.visitDate, guest.departureTime) : null
    })) : []
  };
  return this.http.put<VisitRequest>(`${this.baseUrl}/${id}`, payload);
}*/
updateVisitRequest(id: number, request: any): Observable<VisitRequest> {
  const payload = {
    ...request,
    version: request.version,
    requester: { id: request.requester?.id },
    visitor: request.visitor ? { 
      idVisitor: request.visitor.idVisitor,
      ...request.visitor 
    } : null,
    // Correct field names and handle null values
    additionalGuests: request.guests ? request.guests.map((guest: any) => ({
      idCompanion: guest.idCompanion,
      firstName: guest.firstName,  // Use 'firstName'
      lastName: guest.lastName, 
      email: guest.email,
      phoneNumber: guest.phoneNumber,
      // Ensure these fields are never null
      Arrival: guest.arrivalTime ? this.combineDateTime(request.visitDate, guest.arrivalTime) : new Date().toISOString(),
      Departure: guest.departureTime ? this.combineDateTime(request.visitDate, guest.departureTime) : new Date().toISOString()
    })) : []
  };
  return this.http.put<VisitRequest>(`${this.baseUrl}/${id}`, payload);
}

private combineDateTime(dateString: string, timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(dateString);
  date.setHours(hours, minutes);
  return date.toISOString();
}
  deleteVisitRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignVisitorToRequest(requestId: number, visitorId: number): Observable<VisitRequest> {
    return this.http.post<VisitRequest>(`${this.baseUrl}/${requestId}/assign/${visitorId}`, null);
  }

  getRequestsByRequesterId(userId: number): Observable<VisitRequest[]> {
    return this.http.get<VisitRequest[]>(`${this.baseUrl}/by-requester/${userId}`);
  }
  getTodayRequests(): Observable<VisitRequest[]> {
    return this.http.get<VisitRequest[]>(`${this.baseUrl}/requests/today`);
  }
getVisitCountByStatus(): Observable<{ [status: string]: number }> {
  return this.http.get<{ [status: string]: number }>(`${this.baseUrl}/count-by-status`);
}
notifyRequester(payload: { requestId: number, status: string }): Observable<any> {
  const token = localStorage.getItem('auth_token');
  return this.http.post(
    `${this.baseUrl}/notify`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'text'  // Accept any response type
    }
  );
}

verifyPin(requestId: number, pin: number): Observable<boolean> {
  return this.http.get<boolean>(
    `${this.baseUrl}/verify-pin`,
    {
      params: {
        requestid: requestId.toString(),   
        pin: pin.toString()
      }
    }
  );
}

/*createRequestReceptionist(token: string, request: VisitRequest): Observable<VisitRequest> {
  const headers = new HttpHeaders({
    Authorization: token
  });
  
   return this.http.post<VisitRequest>(`${this.baseUrl}/receptionist`, request, { headers });
}
*/
createVisitRequestAsReceptionist(
  request: any,
  allowedStartHour: number,
  allowedEndHour: number
): Observable<any> {
  const token = localStorage.getItem('token');

  const params = new HttpParams()
    .set('allowedStartHour', allowedStartHour.toString())
    .set('allowedEndHour', allowedEndHour.toString());

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.post(
    'http://localhost:8080/visteonS/api/visit-requests/receptionist',
    request,
    {
      headers,
      params,
    }
  );
}


markAsDeparted(id: number): Observable<void> {
  return this.http.patch<void>(`${this.baseUrl}/${id}/depart`, null);
}

 markGuestAsDeparted(guestId: number, departureTime: Date): Observable<Companion> {
  // Convert to local time in ISO format (without timezone offset)
  const localTime = new Date(
    departureTime.getTime() - departureTime.getTimezoneOffset() * 60000
  );
  const formattedTime = localTime.toISOString().slice(0, 19);
  
  return this.http.patch<Companion>(
    `${this.baseUrl}/companions/${guestId}/depart`, 
    { departureTime: formattedTime }
  );

}


  getVisitorsStillOnSite(): Observable<VisitRequest[]> {
    return this.http.get<VisitRequest[]>(`${this.baseUrl}/active-visitors`);
  }

exportReport(format: 'csv' | 'pdf'): Observable<Blob> {
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
markAllVisitsAsCompleted() {
  return this.http.put('http://localhost:8080/visteonS/api/visit-requests/admin/complete-all', {}, { responseType: 'text' });
}

  getVisitsByStatus(): Observable<{ [status: string]: number }> {
    return this.http.get<{ [status: string]: number }>(
      'http://localhost:8080/visteonS/api/visit-requests/visits-by-status'
    );
  }

  getVisitsBySupplier(): Observable<{ [supplier: string]: number }> {
    return this.http.get<{ [supplier: string]: number }>(
      'http://localhost:8080/visteonS/api/visit-requests/visits-by-supplier'
    );
  }
}
