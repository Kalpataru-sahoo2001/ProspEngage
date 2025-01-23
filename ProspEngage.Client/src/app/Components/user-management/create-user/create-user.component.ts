import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service'; 
import { CommonModule } from '@angular/common';
 
 
@Component({
  selector: 'app-create-user',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  standalone: true,
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css',
 
})
export class CreateUserComponent {
@Output() cancel = new EventEmitter<void>();
@Output() save = new EventEmitter<any>();
 
titles = ['Mr', 'Mrs', 'Ms', 'Miss'];
roles = [
  { id: 1, name: 'CEO' },
  { id: 2, name: 'VP' },
  { id: 3, name: 'Sales Manager' },
  { id: 4, name: 'Sales Reps' }
];
 
profiles = [
  { id: 1, name: 'SuperAdmin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'User' }
];
 
statuses = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'Inactive' },
  { id: 3, name: 'Deleted' }
];
 
user = {
  title: '',
  firstName: '',
  lastName: '',
 
  email: '',
  mobile:'',
  roleId: null,
  profileId: null,
  statusId: null,
  createdBy: 'Admin' // Assuming this is set dynamically
};
 
constructor(private userService: UserService) {}
 
onSubmit() {
  if (!this.user.firstName || !this.user.lastName || !this.user.email || !this.user.roleId || !this.user.profileId || !this.user.statusId) {
    alert('Please fill in all required fields.');
    return;
  }
 
  this.userService.registerUser(this.user).subscribe({
    next: (response) => {
      console.log('User created successfully:', response);
      alert('User created successfully');
      this.save.emit(this.user);
    },
    error: (error) => {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.error?.message || error.message}`);
    }
  });
}
 
onCancel() {
  this.cancel.emit();
}
}