import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approval-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './approval-form.component.html',
  standalone: true,
  styleUrl: './approval-form.component.css'
})
export class ApprovalFormComponent {
  @Input() user: any = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCanceled = new EventEmitter<void>();

  isApprovalFormVisible = true;
  selectedRole = '';
  selectedProfile = '';
  selectedStatus = '';

  closeApprovalForm() {
    this.isApprovalFormVisible = false;
    this.selectedRole = '';
    this.selectedProfile = '';
    this.selectedStatus = '';
    this.formCanceled.emit();
  }

  submitApprovalForm(): void {
    if (!this.selectedRole || !this.selectedProfile || !this.selectedStatus) {
      alert('Please fill in all fields');
      return;
    }

    // Log the values before emitting
    console.log('Form Values:', {
      role: this.selectedRole,
      profile: this.selectedProfile,
      status: this.selectedStatus
    });

    this.formSubmitted.emit({
      roleId: this.selectedRole,
      profileId: this.selectedProfile,
      statusId: this.selectedStatus
    });
  }
}