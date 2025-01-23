import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { catchError, Observable, throwError } from 'rxjs';
  import { UserDTO } from '../models/user.dto'; 
  import { environment } from '../Environments/environments.dev'; 
  import { ApprovalRequest } from '../models/approval-payload.interface'; 
  
  @Injectable({
    providedIn: 'root',
  })
  export class ActiveInactserviceService {
    private apiBaseUrl = `${environment.apiBaseUrl}/User`;
  
    constructor(private http: HttpClient) {}
  
    getPendingUsers(): Observable<UserDTO[]> {
      return this.http.get<UserDTO[]>(`${this.apiBaseUrl}/pending`);
    }
  
    getActiveUsers(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiBaseUrl}/active`);
    }
    // Update user status (instead of delete)
    updateUserStatus(userId: number, user: UserDTO): Observable<any> {
      return this.http.put(`${this.apiBaseUrl}/User/${userId}`, user);
    }
  
    approveUser(userId: number, payload: ApprovalRequest): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
  
      const url = `${this.apiBaseUrl}/approve`;
      console.log('Making API request to:', url);
      console.log('With payload:', payload);
  
      return this.http
        .post(url, payload, {
          headers: headers,
          responseType: 'text',
        })
        .pipe(catchError(this.handleError));
    }
  
    private handleError(error: HttpErrorResponse) {
      console.error('API Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error,
      });
  
      return throwError(() => error);
    }
  
    rejectUser(userId: number): Observable<any> {
      const url = `${this.apiBaseUrl}/reject/${userId}`;
      console.log('Reject API URL:', url, 'UserId:', userId); // Debug log
      
      return this.http.post(url, {}, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
        responseType: 'text'  // Add this if your API returns text response
      }).pipe(
        catchError(this.handleError)
      );
    }
  }
  