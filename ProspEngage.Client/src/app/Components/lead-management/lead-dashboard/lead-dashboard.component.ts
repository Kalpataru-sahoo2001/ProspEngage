import { CommonModule } from '@angular/common';
import { Component,Input,input,OnDestroy,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreateLeadComponent } from '../create-lead/create-lead.component';
import { ViewLeadComponent } from '../view-lead/view-lead.component';
import { LeadService ,User,UserLeadAssignment} from '../../../services/lead.service'; 
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { FormBuilder } from '@angular/forms';



interface Lead {
  leadId: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  sourceProfile: string;
  company: string;
  dealSize: number;
  numberOfEmployees: number;
  leadStatus: string;
  budget: number;
  authority: string;
  need: string;
  timeline: string;
  leadSource: string;
  comments: string;
  created_On: string;
  created_By: string;
  modified_On: string;
  modified_By: string;
  isActive: boolean;
}
 
interface LeadAssignmentRequest {
  userId: string;
  leadIds: number[];
}
interface AssignmentResponse {
  message: string;
  success: boolean;
}
@Component({
  selector: 'app-lead-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule,CreateLeadComponent,ViewLeadComponent],
  templateUrl: './lead-dashboard.component.html',
  styleUrl: './lead-dashboard.component.css'
})
export class LeadDashboardComponent implements OnInit,OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  leads: Lead[] = [];
  paginatedLead: Lead[] = [];
  protected readonly Math = Math;
  editingLead: any = null;
  searchQuery: string = '';
  noResults: boolean = false;
  searchMinLength: number = 3;
  loading: boolean = false;
  errorMessage: string = '';
  filteredLeads: Lead[] = [];
  error: string | null = null;
  @Input() leadId!: number;
  users: User[] = [];
  selectedLeadIds: number[] = [];
  selectedUser: string = '';
  searchTerm = '';
  isLoading = false;
  isCreateLeadFormVisible=false;
  isEditLeadFormVisible=false;
  isViewLeadVisible=false;
  router: any;
  selectedLead: Lead | null = null;
  allLeads:Lead[]=[];
  lead: Lead[] = [];
  isDeleteDialogVisible: boolean = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';    
 
  constructor(private leadService: LeadService,private fb: FormBuilder,private http:HttpClient) {
 
   
  }
 
 
  toggleLeadSelection(leadId: number, event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.selectedLeadIds.includes(leadId)) {
        this.selectedLeadIds.push(leadId);
      }
    } else {
      this.selectedLeadIds = this.selectedLeadIds.filter(id => id !== leadId);
    }
    console.log('Selected leads:', this.selectedLeadIds);
  }
 
  // Method to handle "select all" checkbox
  toggleAllCheckboxes(element: any): void {
    const isChecked = element.checked;
    this.paginatedLeads.forEach(lead => {
      const index = this.selectedLeadIds.indexOf(lead.leadId);
      if (isChecked && index === -1) {
        this.selectedLeadIds.push(lead.leadId);
      } else if (!isChecked && index !== -1) {
        this.selectedLeadIds.splice(index, 1);
      }
    });
  }
  isLeadSelected(leadId: number): boolean {
    return this.selectedLeadIds.includes(leadId);
  }
  assignLead(): void {
    if (this.selectedLeadIds.length === 0) {
      alert('Please select at least one lead to assign');
      return;
    }
 
    if (!this.selectedUser) {
      alert('Please select a user to assign the leads to');
      return;
    }
 
    this.leadService.assignLeads(this.selectedUser, this.selectedLeadIds).subscribe({
      next: () => {
        alert('Leads assigned successfully!');
        this.selectedLeadIds = []; // Clear selections
        this.selectedUser = ''; // Reset user dropdown
        this.fetchLeads(); // Refresh the leads list
      },
      error: (error) => {
        console.error('Error assigning leads:', error);
        alert('Failed to assign leads. Please try again.');
      }
    });
  }
 
  onLeadSelect(leadId: number, event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.selectedLeadIds.includes(leadId)) {
        this.selectedLeadIds.push(leadId);
      }
    } else {
      this.selectedLeadIds = this.selectedLeadIds.filter(id => id !== leadId);
    }
  }
  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed.');
  }
 
  handleError(error: any): void {
    if (typeof ErrorEvent !== 'undefined' && error instanceof ErrorEvent) {
      console.error('Client-side error:', error.message);
      this.errorMessage = 'A client-side error occurred. Please try again.';
    } else {
      console.error('Server-side error:', error);
      this.errorMessage = 'A server-side error occurred. Please contact support.';
    }
  }
 
 
  ngOnInit(): void {
    this.fetchLeads();
    this.fetchUsers();
   
  }
  onLeadCreated(newLead: Lead): void {
    // Add the new lead to the beginning of the leads array
    this.leads = [newLead, ...this.leads];
   
    // Update total items and pagination
    this.totalItems = this.leads.length;
    this.calculateTotalPages();
    this.updatePaginatedLeads();
   
    // Show notification
    this.notificationMessage = 'Lead created successfully!';
    this.notificationType = 'success';
    this.showNotification = true;
   
    // Hide notification after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
   
    // Hide the create lead form
    this.hideCreateLeadForm();
  }
 
  // Add method to handle notification close
  onNotificationClose(): void {
    this.showNotification = false;
  }
  leadToDelete: Lead | null = null;
 
  showDeleteDialog(leadId: number): void {
    if (confirm('Are you sure you want to delete this lead ')) {
      this.leadService.deleteLeadById(leadId).subscribe({
        next: () => {
          // Remove the lead from the displayed list
          this.leads = this.leads.filter((lead) => lead.leadId !== leadId);
          alert('Lead deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting lead:', error);
          alert('Failed to delete the lead. Please try again.');
        },
      });
    }
  }                                                                                                                                                                           confirmDelete(lead: Lead): void {
    this.leadToDelete = lead; // Set the selected lead
    this.isDeleteDialogVisible = true; // Show confirmation dialog
  }
 
    deleteLead(): void {
      if (!this.leadToDelete) return;
   
      this.leadService.deleteLeadById(this.leadToDelete.leadId).subscribe(
        (response) => {
          console.log('Lead deleted successfully:', response);
   
          // Remove the deleted lead from the array
          this.leads = this.leads.filter((lead) => lead.leadId !== this.leadToDelete!.leadId);
   
          this.isDeleteDialogVisible = false; // Close the dialog
          this.leadToDelete = null; // Reset the selected lead
        },
        (error) => {
          console.error('Error deleting lead:', error);
          this.errorMessage = 'Failed to delete lead. Please try again.';
          this.isDeleteDialogVisible = false; // Close the dialog even if there’s an error
        }
      );
    }
 
   
 
    assignLeads(): void {
      if (!this.selectedUser || this.selectedLeadIds.length === 0) {
        alert('Please select both a user and at least one lead to assign');
        return;
      }
 
      this.leadService.assignLeads(this.selectedUser, this.selectedLeadIds).subscribe({
        next: (response: any) => {
          alert('Leads assigned successfully!');
          this.selectedLeadIds = []; // Clear selections
          this.selectedUser = ''; // Reset user selection
          this.fetchLeads(); // Refresh the leads list
        },
        error: (error: any) => {
          console.error('Error assigning leads:', error);
          alert('Failed to assign leads. Please try again.');
        }
      });
    }
 
 
 
 
  showCreateLeadForm(): void {
    this.isCreateLeadFormVisible = true;
    document.body.classList.add('form-open');
  }
 
 
  showEditLeadForm(lead: any): void {
    this.editingLead = lead;
    this.isCreateLeadFormVisible = true; // Reuse the same form
    document.body.classList.add('form-open');
  }
   
  showViewLead(leadId: string): void {
    this.router.navigate(['lead/:leadId', leadId]);
    this.isViewLeadVisible=true;
  }
  // Hide the form
  hideCreateLeadForm(): void {
    this.isCreateLeadFormVisible = false;
    document.body.classList.remove('form-open');
  }
 
  hideEditLeadForm(): void {
    this.editingLead = null;
    this.isCreateLeadFormVisible = false;
    document.body.classList.remove('form-open');
  }
 
  // Handle save event
  handleSave(userData: any): void {
    console.log('User data saved:', userData);
    this.hideCreateLeadForm(); // Optionally hide the form after saving
  }
  getLinkedInUrl(sourceProfile: string): string {
    if (!sourceProfile) {
      console.warn('Source Profile is missing or invalid');
      return '#'; // Fallback URL
    }
    return `${sourceProfile}`;
  }
 
  
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }
 
 
  onLeadClick(lead: Lead): void {
    this.selectedLead = lead;
  }
 
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'New': 'status-new',
      'Contacted': 'status-contacted',
      'Qualified': 'status-qualified',
      'Disqualified': 'status-disqualified'
    };
    return statusMap[status] || '';
  }
 
 
 
 
 
 
  onCancel() {
    this.isDeleteDialogVisible = false;
    this.leadToDelete = null;
  }
 
 
 
 
 
  createLead() {
    this.router.navigate(['/create']); // Ensure the '/lead' route exists in your routing module
  }
 
  get paginatedLeads(): Lead[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.leads.slice(startIndex, endIndex);
  }
 
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedLeads();
    }
  }
 
 
  updatePaginatedLeads(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    this.paginatedLead = this.leads.slice(startIndex, endIndex);
  }
 
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedLeads();
    }
  }
 
  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when changing page size
    this.calculateTotalPages();
    this.updatePaginatedLeads();
  }
 
 
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
 
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
 
 
  searchLeads(): void {
    // Reset no results flag
    this.noResults = false;
   
    // Clear results if search query is empty
    if (!this.searchQuery.trim()) {
      this.fetchLeads();
      return;
    }
   
    // Only search if query is 3 or more characters
    if (this.searchQuery.trim().length < this.searchMinLength) {
      return;
    }
   
    this.loading = true;
    this.errorMessage = '';
   
    this.leadService
      .searchLeads(this.searchQuery)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (results) => {
          this.leads = results;
          this.totalItems = results.length;
          this.noResults = results.length === 0;
          this.calculateTotalPages();
          this.updatePaginatedLeads();
         
          // Reset to first page when search results change
          this.currentPage = 1;
        },
        error: (error) => {
          console.error('Error searching leads:', error);
          this.errorMessage = 'An error occurred while searching for leads.';
          this.leads = [];
          this.totalItems = 0;
          this.noResults = true;
          this.calculateTotalPages();
        },
      });
  }
 
 
  getDisplayedItemsRange(): string {
    const start = ((this.currentPage - 1) * this.pageSize) + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `${start}-${end} of ${this.totalItems} items`;
  }
 
 
    closeView(): void {
      this.selectedLead = null;
    }
 
    fetchUsers(): void {
      this.leadService.getUsersForDropdown().subscribe({
        next: (users: User[]) => {
          this.users = users;
        },
        error: (err: any) => {
          console.error('Error fetching users:', err);
          this.error = 'Failed to load users.';
        },
      });
    }

    // sorting code
    sortTable(column: string, direction: 'asc' | 'desc'): void {
      this.sortColumn = column;
      this.sortDirection = direction;
   
      this.leads.sort((a: Lead, b: Lead) => {
        const aValue = this.getValueByPath(a, column);
        const bValue = this.getValueByPath(b, column);
   
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return direction === 'asc' ? comparison : -comparison;
        }
   
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
   
        // Handle null/undefined values
        if (!aValue && bValue) return direction === 'asc' ? -1 : 1;
        if (aValue && !bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
   
      // Update paginated leads after sorting
      this.updatePaginatedLeads();
    }
   
    // Helper method to safely get nested object values
    private getValueByPath(obj: any, path: string): any {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
    fetchLeads(): void {
      this.loading = true;
     
      this.leadService.getAllLeads().subscribe({
        next: (data) => {
          this.leads = data;
          if (this.sortColumn) {
            this.sortTable(this.sortColumn, this.sortDirection);
          }
          this.totalItems = data.length;
          this.calculateTotalPages();
          this.updatePaginatedLeads();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load leads';
          this.loading = false;
          console.error('Error fetching leads:', error);
        }
      });
    }    
    toggleAllLeads(event: any): void {
      const isChecked = event.target.checked;
     
      if (isChecked) {
        // Add all currently displayed leads that aren't already selected
        this.paginatedLeads.forEach(lead => {
          if (!this.selectedLeadIds.includes(lead.leadId)) {
            this.selectedLeadIds.push(lead.leadId);
          }
        });
      } else {
        // Remove all currently displayed leads from selection
        this.selectedLeadIds = this.selectedLeadIds.filter(id =>
          !this.paginatedLeads.some(lead => lead.leadId === id)
        );
      }
    }
    areAllLeadsSelected(): boolean {
      return this.paginatedLeads.length > 0 &&
             this.paginatedLeads.every(lead => this.selectedLeadIds.includes(lead.leadId));
    }

}
