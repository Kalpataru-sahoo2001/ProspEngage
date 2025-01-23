import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Environments/environments.dev'; 
 
@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  private apiUrl = `${environment.apiBaseUrl}/User`;
 
  constructor(private http: HttpClient) {}
 
  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/SuperadminCreateUser`, {
      FirstName: user.firstName,
      LastName: user.lastName,
      Phone: user.phone || null,
      Email: user.email,
      RoleId: user.roleId,
      ProfileId: user.profileId,
      StatusId: user.statusId,
      Title: user.title || null
    });
  }
}
 