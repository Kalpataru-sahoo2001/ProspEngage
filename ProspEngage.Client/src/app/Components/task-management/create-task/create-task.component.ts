import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, CreateTaskDto, TaskResponseDto } from '../../../services/task.service 1'; 
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-create-task',
  imports: [CommonModule, 
    FormsModule,
    HttpClientModule],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css'
})
export class CreateTaskComponent {
  @Output() saveClicked = new EventEmitter<TaskResponseDto>();
  @Output() cancelClicked = new EventEmitter<void>();

  taskData: CreateTaskDto = {
    subject: '',
    dueDate: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    statusId: 1,
    priorityId: 2,
    relatedTo: '',
    contactName: '',
    emailId: '',
    taskOwner: '',
    reminder: false,
    reminderDate: null,
    description: '',
    createdBy: '' // This will be set with the logged-in user
  };

  statusOptions: { id: number; text: string; }[] = [];
  priorityOptions: { id: number; text: string; }[] = [];
  isSubmitting = false;
  errorMessage = '';
  isModalOpen = false;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.initializeForm();
    this.loadOptions();
  }

  private initializeForm() {
    // Set default date to current date and time
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    this.taskData.dueDate = localDateTime;
    
    // You might want to get the logged-in user here
    this.taskData.createdBy = 'Current User'; // Replace with actual user data
    this.taskData.taskOwner = 'Current User'; // Default task owner to current user
  }

  private loadOptions() {
    this.statusOptions = this.taskService.getStatusOptions();
    this.priorityOptions = this.taskService.getPriorityOptions();
  }

  openModal() {
    this.isModalOpen = true;
  }

  onSubmit() {
    if (this.isSubmitting) return;

    if (!this.validateForm()) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Format dates properly
    const formattedData = {
      ...this.taskData,
      dueDate: new Date(this.taskData.dueDate).toISOString(),
      reminderDate: this.taskData.reminder && this.taskData.reminderDate 
        ? new Date(this.taskData.reminderDate).toISOString()
        : null
    };

    this.taskService.createTask(formattedData)
      .subscribe({
        next: (response) => {
          this.saveClicked.emit(response);
          this.resetForm();
          this.isModalOpen = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  private validateForm(): boolean {
    // Basic required field validation
    if (!this.taskData.subject?.trim()) {
      this.errorMessage = 'Subject is required';
      return false;
    }
    if (!this.taskData.contactName?.trim()) {
      this.errorMessage = 'Contact Name is required';
      return false;
    }
    if (!this.taskData.emailId?.trim()) {
      this.errorMessage = 'Email ID is required';
      return false;
    }
    if (!this.taskData.taskOwner?.trim()) {
      this.errorMessage = 'Task Owner is required';
      return false;
    }
    if (!this.taskData.relatedTo?.trim()) {
      this.errorMessage = 'Related To is required';
      return false;
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.taskData.emailId)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    // Reminder date validation
    if (this.taskData.reminder && !this.taskData.reminderDate) {
      this.errorMessage = 'Reminder date is required when reminder is enabled';
      return false;
    }

    // Due date validation
    if (new Date(this.taskData.dueDate) < new Date()) {
      this.errorMessage = 'Due date cannot be in the past';
      return false;
    }

    return true;
  }

  onCancel() {
    this.resetForm();
    this.cancelClicked.emit();
    this.isModalOpen = false;
  }

  onClose() {
    this.resetForm();
    this.cancelClicked.emit();
    this.isModalOpen = false;
  }

  private resetForm() {
    this.initializeForm();
    this.taskData = {
      subject: '',
      dueDate: new Date().toISOString().slice(0, 16),
      statusId: 1,
      priorityId: 2,
      relatedTo: '',
      contactName: '',
      emailId: '',
      taskOwner: this.taskData.taskOwner, // Preserve the current user
      reminder: false,
      reminderDate: null,
      description: '',
      createdBy: this.taskData.createdBy // Preserve the current user
    };
    this.errorMessage = '';
    this.isSubmitting = false;
  }

  // Helper methods for the template
  onReminderChange() {
    if (this.taskData.reminder && !this.taskData.reminderDate) {
      // Set default reminder date to same as due date
      this.taskData.reminderDate = this.taskData.dueDate;
    }
  }

  // Method to get status text
  getStatusText(statusId: number): string {
    return this.statusOptions.find(opt => opt.id === statusId)?.text || '';
  }

  // Method to get priority text
  getPriorityText(priorityId: number): string {
    return this.priorityOptions.find(opt => opt.id === priorityId)?.text || '';
  }
}
