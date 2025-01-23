import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../Environments/environments.dev';

export interface CreateTaskDto {
  subject: string;
  dueDate: string;
  statusId: number;
  priorityId: number;
  relatedTo: string;
  contactName: string;
  emailId: string;
  taskOwner: string;
  reminder: boolean;
  reminderDate: string | null;
  description: string;
  createdBy: string;
}
 
export interface TaskResponseDto {
  taskId: number;
  subject: string;
  dueDate: string;
  statusId: number;
  priorityId: number;
  relatedTo: string;
  contactName: string;
  emailId: string;
  contactId: number;
  taskOwner: string;
  reminder: boolean;
  reminderDate: string | null;
  description: string;
  createdOn: string;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})


export class TaskService {
  private apiUrl = `${environment.apiBaseUrl}/Task`;
  //private apiUrl = 'https://localhost:44390/api/Task'; 

  constructor(private http: HttpClient) { }

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  } 

  deleteTask(taskId: number): Observable<void> {
    console.log('Task is deleted: ' + taskId);
    alert('Task deleted successfully');
    return new Observable<void>((observer) => {
      observer.next();
      observer.complete();
    });
   // return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }
  
  createTask(taskData: CreateTaskDto): Observable<TaskResponseDto> {
    return this.http.post<TaskResponseDto>(this.apiUrl, taskData)
      .pipe(
        catchError(this.handleError)
      );
  }
 
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
 
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 400) {
        // Handle validation errors
        errorMessage = error.error.message || 'Invalid input data';
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
    }
 
    console.error('Error:', error);
    return throwError(() => new Error(errorMessage));
  }
 
  // Helper methods for status and priority options
  getStatusOptions() {
    return [
      { id: 1, text: 'Not Started' },
      { id: 2, text: 'In Progress' },
      { id: 3, text: 'Completed' }
    ];
  }
 
  getPriorityOptions() {
    return [
      { id: 1, text: 'Highest' },
      { id: 2, text: 'Normal' },
      { id: 3, text: 'Low' }
    ];
  }
}