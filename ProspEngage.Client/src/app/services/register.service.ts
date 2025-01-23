import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../Environments/environments.dev'; 

interface RegisterData {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  registrationId: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiBaseUrl = environment.apiBaseUrl;

  private apiUrl = `${this.apiBaseUrl}/User`;
  

  constructor(private http: HttpClient) {}

  register(formData: RegisterData): Observable<{ registrationId: string }> {

    const processedData = {
      ...formData,
      email: formData.email.toLowerCase()
    };

    return this.http.post<RegisterResponse>(
      this.apiUrl, 
      processedData
    ).pipe(
      map(response => ({ registrationId: 'REG-' + Date.now() })), 
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);

    let errorMessage = 'Something went wrong. Please try again.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid form data';
          break;
        case 404:
          errorMessage = 'Registration endpoint not found';
          break;
        case 409:
          errorMessage = 'Email already exists';
          break;
        case 422:
          errorMessage = 'Invalid email domain';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = 'Something went wrong. Please try again';
      }
    }

    return throwError(() => errorMessage);
  }
}