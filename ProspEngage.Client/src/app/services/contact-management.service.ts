// contact-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../Environments/environments.dev';
 
// pagination code
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}
 
// coutry state api
export interface Country {
  countryId: number;
  countryName: string;
}
 
export interface State {
  stateId: number;
  stateName: string;
  countryId: number;
}
export interface City {
  cityId: number;
  cityName: string;
  stateId: number;
}
 
export interface Contact {
  id: number;
  contactName: string;
  leadSource: string;
  emailID: string;
  phoneNumber: string;
  companyName: string;
  address: string;
  dateAndTime: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  created_On?: string;
  created_By?: string;
  modified_On?: string | null;
  modified_By?: string | null;
  isActive?: boolean;
  isSelected?: boolean;
}
 
export interface SearchResult {
  entityType: string;
  entityID: number;
  name: string;
  leadSource: string;
  email: string;
  phone: string;
  companyName: string;
  address: string;
  country: string;
  detailsUrl: string;
}
 
@Injectable({
  providedIn: 'root',
})
export class ContactManagementService {
 
  private apiUrl = environment.apiBaseUrl;
 
  constructor(private http: HttpClient) {}

  uploadContacts(contacts: Contact[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/BulkUpload/upload`, contacts);
  }

  bulkUploadFile(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/BulkUpload/upload`, formData, {
      responseType: 'text' as 'json'
    });
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/CrudContacts`);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/CrudContacts/${id}`);
  }

   // Add new method for contact-specific search
   searchContactsOnly(searchTerm: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/CrudContacts/search`, {
      params: { searchTerm }
    }).pipe(
      catchError(error => {
        console.error('Error searching contacts:', error);
        return throwError(() => new Error('Failed to search contacts'));
      })
    );
  }
  searchGlobal(searchQuery: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}/Search/search`, {
      params: {
        query: searchQuery,
        entityType: 'all'
      }
    });
  }

  createContact(contact: Contact): Observable<Contact> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const backendContact = {
      id: contact.id,
      contactName: contact.contactName,
      leadSource: contact.leadSource,
      emailID: contact.emailID,
      phoneNumber: contact.phoneNumber,
      companyName: contact.companyName,
      address: contact.address,
      pincode: contact.pincode,
      dateAndTime: new Date().toISOString(),
      country: contact.country,
      state: contact.state,
      city: contact.city,
      created_On: new Date().toISOString(),
      created_By: 'system', // Replace with actual user if available
      modified_On: new Date().toISOString(),
      modified_By: 'system', 
      isActive: true
    };
    console.log('Sending contact data:', backendContact);

    return this.http.post<Contact>(`${this.apiUrl}/CrudContacts`, backendContact, { headers }).pipe(
      catchError(error => {
        console.error('Error creating contact:', error);
        
        let errorMessage = 'Contact is already exists. Please try again.';
        
        // Check for various types of duplicate/existing data errors
        if (error.status === 409 || 
            (error.error?.message && error.error.message.toLowerCase().includes('duplicate')) ||
            (error.error?.message && error.error.message.toLowerCase().includes('already exists')) ||
            (error.error?.errors && Object.values(error.error.errors).some(err => 
              String(err).toLowerCase().includes('duplicate') || 
              String(err).toLowerCase().includes('already exists')
            ))) {
          errorMessage = 'A contact with this information already exists in the system.';
        } else if (error.error?.errors) {
          // Handle validation errors
          errorMessage = Object.values(error.error.errors).flat().join(', ');
        }
        
        // Show error in alert
        alert(errorMessage);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  // for country and state
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/Country/all`).pipe(
      catchError(error => {
        console.error('Error fetching countries:', error);
        return throwError(() => new Error('Failed to load countries. Please try again.'));
      })
    );
  }
  getStates(countryId: number): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/Country/states/${countryId}`).pipe(
      catchError(error => {
        console.error('Error fetching states:', error);
        return throwError(() => new Error('Failed to load states. Please try again.'));
      })
    );
  }
  getCities(countryId: number, stateId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/City/GetCitiesByState`, {
      params: {
        stateId: stateId.toString(),
        countryId: countryId.toString()
      }
    }).pipe(
      catchError(error => {
        console.error('Error fetching cities:', error);
        return throwError(() => new Error('Failed to load cities. Please try again.'));
      })
    );
  }

  // edit contact page 
  getContactById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/CrudContacts/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching contact:', error);
        return throwError(() => new Error('Failed to load contact details.'));
      })
    );
  }

  updateContact(id: number, contact: Contact): Observable<Contact> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const currentTime = new Date().toISOString();
    
    const backendContact = {
      id: id,
      contactName: contact.contactName,
      leadSource: contact.leadSource,
      emailID: contact.emailID,
      phoneNumber: contact.phoneNumber,
      companyName: contact.companyName,
      address: contact.address,
      pincode: contact.pincode,
      dateAndTime: currentTime,
      country: contact.country,
      state: contact.state,
      city: contact.city,
      created_On: contact.created_On,
      created_By: contact.created_By,
      modified_On: currentTime,
      modified_By: 'system',
      isActive: true
    };
  
    console.log('Updating contact with data:', backendContact);
  
    return this.http.put<Contact>(`${this.apiUrl}/CrudContacts/${id}`, backendContact, { headers }).pipe(
      catchError(error => {
        console.error('Error updating contact:', error);
        const errorMessage = error.error?.errors ? 
          Object.values(error.error.errors).flat().join(', ') : 
          'Failed to update contact';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}