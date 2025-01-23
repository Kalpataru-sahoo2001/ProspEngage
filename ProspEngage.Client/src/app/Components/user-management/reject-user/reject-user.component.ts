import { Component, EventEmitter, Output } from '@angular/core';
 
@Component({
  selector: 'app-reject-user',
  imports: [],
  templateUrl: './reject-user.component.html',
  styleUrl: './reject-user.component.css'
})
// export class RejectUserComponent {
//   @Output() confirmReject = new EventEmitter<void>(); // Event for confirming reject
//   @Output() cancelReject = new EventEmitter<void>();  // Event for canceling reject
 
//   onConfirm(): void {
//     this.confirmReject.emit(); // Emit confirm reject event
//   }
 
//   onCancel(): void {
//     this.cancelReject.emit(); // Emit cancel reject event
//   }
// }
export class RejectUserComponent {
  @Output() confirmReject = new EventEmitter<void>();
  @Output() cancelReject = new EventEmitter<void>();
 
  onConfirm(): void {
    this.confirmReject.emit();
  }
 
  onCancel(): void {
    this.cancelReject.emit();
  }
}