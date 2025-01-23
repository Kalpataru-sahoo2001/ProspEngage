import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Country, LeadFormData, State } from '../models/lead.types';
import { environment } from '../Environments/environments.dev';
 
interface LeadRequest {
  name: string;
  leadId: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  sourceProfile: string;
  company: string;
  dealSize: number;
  numberOfEmployees: number;
  leadStatus: string;
  budget: number;
  authority: string;
  need: string;
  timeline: string;
  leadSource: string;
  comments: string;
  created_On: string;
  created_By: string;
  modified_On: string;
  modified_By: string;
  isActive: boolean;
}
 
export interface User {
  userId: number;
  username: string;
}
 
export interface UserLeadAssignment {
  userId: number;
  leadIds: number[];
}
 
@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private baseUrl = environment.apiBaseUrl; // Updated base URL
 
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
 
  constructor(private http: HttpClient) {}
 
  // Handle errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
 
  // Fetch all leads
  getAllLeads(): Observable<LeadRequest[]> {
    return this.http.get<LeadRequest[]>(`${this.baseUrl}/Leads`)
      .pipe(retry(3), catchError(this.handleError));
  }
 
  // Get Lead status
  getStatusData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/LeadStatus/statuses`)
      .pipe(retry(3), catchError(this.handleError));
  }
 
  // Get country data
  getCountryData(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/Country/all`)
      .pipe(retry(3), catchError(this.handleError));
  }
 
  // Get state data based on country ID
  getStateData(countryId: number): Observable<State[]> {
    return this.http.get<State[]>(`${this.baseUrl}/Country/states/${countryId}`)
      .pipe(retry(3), catchError(this.handleError));
  }
 
  // Get lead by ID
  getLeadById(id: number): Observable<LeadRequest> {
    return this.http.get<LeadRequest>(`${this.baseUrl}/Leads/${id}`)
      .pipe(catchError(this.handleError));
  }
 
  // Assign leads to a user
  assignLeads(userId: string, leadIds: number[]): Observable<any> {
    const payload = { userId, leadIds };
    return this.http.post(`${this.baseUrl}/Leads/assign`, payload, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
 
  // Search leads by term
  searchLeads(searchQuery: string): Observable<LeadRequest[]> {
    const params = new HttpParams().set('searchterm', searchQuery);
    return this.http.get<LeadRequest[]>(`${this.baseUrl}/Leads/search`, { params })
      .pipe(catchError(this.handleError));
  }
 
  // Save lead
  saveLead(formData: LeadFormData): Observable<any> {
    const primaryContact = formData.contacts[0];
    const leadRequest: LeadRequest = {
      leadId: Number(formData.leadId) || 0,
      firstName: primaryContact.firstName,
      lastName: primaryContact.lastName,
      jobTitle: primaryContact.jobTitle,
      email: primaryContact.email,
      phoneNumber: primaryContact.phone,
      sourceProfile: primaryContact.SourceProfile || '',
      company: formData.companyName,
      dealSize: Number(formData.DealSize) || 0,
      numberOfEmployees: Number(formData.employeeCount) || 0,
      leadStatus: formData.status,
      budget: Number(formData.budget) || 0,
      authority: formData.authority,
      need: formData.need,
      timeline: formData.timeline,
      leadSource: formData.leadSource,
      comments: formData.comments || '',
      created_On: new Date().toISOString(),
      created_By: 'system',
      modified_On: new Date().toISOString(),
      modified_By: 'system',
      isActive: true,
      name: '',
    };
    return this.http.post<any>(`${this.baseUrl}/Leads`, leadRequest, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
 
  // Update lead
  updateLead(leadId: number, leadData: any): Observable<any> {
    const primaryContact = leadData.contacts[0];
    const leadRequest: LeadRequest = {
      leadId: Number(leadData.leadId) || 0,
      firstName: primaryContact.firstName,
      lastName: primaryContact.lastName,
      jobTitle: primaryContact.jobTitle,
      email: primaryContact.email,
      phoneNumber: primaryContact.phone,
      sourceProfile: primaryContact.SourceProfile || '',
      company: leadData.companyName,
      dealSize: Number(leadData.DealSize) || 0,
      numberOfEmployees: Number(leadData.employeeCount) || 0,
      leadStatus: leadData.status,
      budget: Number(leadData.budget) || 0,
      authority: leadData.authority,
      need: leadData.need,
      timeline: leadData.timeline,
      leadSource: leadData.leadSource,
      comments: leadData.comments || '',
      created_On: new Date().toISOString(),
      created_By: 'system',
      modified_On: new Date().toISOString(),
      modified_By: 'system',
      isActive: true,
      name: '',
    };
    return this.http.put<any>(`${this.baseUrl}/Leads/${leadId}`, leadRequest, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
 
  // Delete lead by ID
  deleteLeadById(leadId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/Leads/${leadId}`)
      .pipe(catchError(this.handleError));
  }
 
  // Get users for dropdown
  getUsersForDropdown(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/User/GetUsersForDropdown`)
      .pipe(catchError(this.handleError));
  }
}
 
