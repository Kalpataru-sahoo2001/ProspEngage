import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private displayModal = new BehaviorSubject<boolean>(false);
  displayModal$ = this.displayModal.asObservable();
 
  openModal() {
    this.displayModal.next(true);
  }
 
  closeModal() {
    this.displayModal.next(false);
  }
}