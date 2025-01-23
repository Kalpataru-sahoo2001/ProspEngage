import { Component } from '@angular/core';
import { TaskResponseDto, TaskService } from '../../../services/task.service 1';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTaskComponent } from '../create-task/create-task.component';

@Component({
  selector: 'app-task',
  imports: [CommonModule, FormsModule,CreateTaskComponent],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']  // Fix here: Use styleUrls, not styleUrl
})
export class TaskComponent {
  tasks: any[] = [];
  filteredTasks: any[] = [];
  searchText: string = '';
  
  currentSortColumn: string = '';
  isAscending: boolean = true;

  //Create Task
  showAddTask = false;

  constructor(private taskService: TaskService) { }
  
  ngOnInit(): void {
    this.loadTasks();
  }
  
  loadTasks(): void {
    this.taskService.getTasks().subscribe(
      (data) => {
        this.tasks = data; 
        this.filteredTasks = data;  // Initialize filteredTasks with all tasks initially
      },
      (error) => {
        console.error('Error fetching tasks', error); 
      }
    );
  }

  filterTasks(): void {
    if (this.searchText.length < 3) {
      this.filteredTasks = [...this.tasks];  // Reset to all tasks if search text is less than 3 characters
      return;
    }
    const lowerCaseSearchText = this.searchText.toLowerCase();
    this.filteredTasks = this.tasks.filter(task =>
      Object.values(task).some(value =>
        value !== null && value !== undefined &&
        value.toString().toLowerCase().includes(lowerCaseSearchText)
      )
    );
  }

  getSortIcon(column: string): string { if (this.currentSortColumn === column) { 
    return this.isAscending ? 'bi-sort-up active' : 'bi-sort-down active'; } 
    return 'bi-filter'; // Default icon when not sorted 
  }

  sortTasks(column: string): void {
    if (this.currentSortColumn === column) {
      this.isAscending = !this.isAscending;  
    } else {
      this.currentSortColumn = column;  
      this.isAscending = true; 
    }

    const direction = this.isAscending ? 1 : -1;

    this.filteredTasks.sort((a, b) => {
      if (column === 'dueDate') {
        // Date comparison for Due Date
        const dateA = new Date(a[column]);
        const dateB = new Date(b[column]);
        return dateA < dateB ? -1 * direction : (dateA > dateB ? 1 * direction : 0);
      } else if (column === 'priority') {
        // Custom priority comparison for sorting
        const priorityOrder: { [key: string]: number } = { 'Highest': 1, 'Medium': 2, 'Low': 3 };

        // Safely access priorityOrder
        const priorityA = priorityOrder[a[column] as keyof typeof priorityOrder];
        const priorityB = priorityOrder[b[column] as keyof typeof priorityOrder];

        return priorityA < priorityB ? -1 * direction : (priorityA > priorityB ? 1 * direction : 0);
      } else {
        // String comparison for other columns
        const valueA = a[column]?.toString().toLowerCase();
        const valueB = b[column]?.toString().toLowerCase();
        return valueA < valueB ? -1 * direction : (valueA > valueB ? 1 * direction : 0);
      }
    });
  }

  onDelete(taskId: number, taskName: string): void {
    if (confirm(`Are you sure you want to delete the contact "${taskName}"?`)) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err: any) => {
          console.error('Error deleting task:', err);
        }
      });
    }
  }

  onTaskSaved(task: TaskResponseDto) {
    console.log('Task saved:', task);
    this.loadTasks(); // Refresh the task list
  }
 
  onTaskCancelled() {
    this.showAddTask = !this.showAddTask;
    console.log('Task creation cancelled');
  }

  toggleAddTask() {
    this.showAddTask = !this.showAddTask;
  }
}