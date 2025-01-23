import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSubject = new Subject<{query: string, type: string}>();
  searchEvent$ = this.searchSubject.asObservable();
  triggerSearch(query: string, type: string) {
    this.searchSubject.next({ query, type });
  }
//   constructor() { }
}