import { Component, OnInit } from '@angular/core';
import { CreateUserComponent } from '../create-user/create-user.component';
import { CommonModule } from '@angular/common';
import { ActiveInactserviceService } from '../../../services/active-inactservice.service'; 
import { ApprovalFormComponent } from '../approval-form/approval-form.component'; 
import { RejectUserComponent } from '../reject-user/reject-user.component';
import { UserDTO } from '../../../models/user.dto';
import { Users } from '../../../models/active.dto'; 
import { ApprovalRequest } from '../../../models/approval-payload.interface'; 

@Component({
  selector: 'app-sad',
  standalone: true,
  imports: [
    CreateUserComponent,
    CommonModule,
    ApprovalFormComponent,
    RejectUserComponent,
  ],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css',
})
export class SadComponent implements OnInit {
  isApprovalFormVisible = false;
  isCreateUserFormVisible = false;
  isRejectDialogVisible = false;

  userToDeactivateId: number | null = null;
  activeUsers: Users[] = [];
  pendingUsers: UserDTO[] = [];
  selectedUser: UserDTO | null = null;
  loading = false;
  error: string | null = null;

  constructor(private activeInactService: ActiveInactserviceService) {}

  ngOnInit(): void {
    this.fetchPendingUsers();
    this.fetchActiveUsers();
  }

  fetchPendingUsers(): void {
    this.loading = true;
    this.activeInactService.getPendingUsers().subscribe({
      next: (users) => {
        console.log('Pending users fetched:', users);
        this.pendingUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching pending users:', error);
        this.error = 'Failed to fetch pending users. Please try again.';
        this.loading = false;
      },
    });
  }

  fetchActiveUsers(): void {
    this.activeInactService.getActiveUsers().subscribe({
      next: (users) => {
        this.activeUsers = users;
      },
      error: (error) => {
        console.error('Error fetching active users:', error);
        this.error = 'Failed to fetch active users. Please try again.';
      },
    });
  }

  showCreateUserForm(): void {
    this.isCreateUserFormVisible = true;
  }

  hideCreateUserForm(): void {
    this.isCreateUserFormVisible = false;
  }

  handleSave(userData: UserDTO): void {
    console.log('User data saved:', userData);
    this.hideCreateUserForm();
    this.fetchActiveUsers();
  }

  showApprovalForm(userId: number): void {
    // The find() method returns UserDTO | undefined
    const user = this.pendingUsers.find((user) => user.userId === userId);
    // Convert undefined to null to match the selectedUser type
    this.selectedUser = user || null;
    if (this.selectedUser) {
      this.isApprovalFormVisible = true;
    } else {
      console.error('User not found:', userId);
      this.error = 'Selected user not found.';
    }
  }

  cancelApproval(): void {
    this.isApprovalFormVisible = false;
    this.selectedUser = null;
  }

  deactivateUser(userId: number): void {}

  // rejectUser(userId: number): void {
  //   this.isRejectDialogVisible = true;
  //   this.userToDeactivateId = userId;
  // }

  rejectUser(userId: number): void {
    console.log('Reject button clicked for userId:', userId); // Debug log
    this.userToDeactivateId = userId;
    this.isRejectDialogVisible = true;
  }
  
  onRejectConfirmed(): void {
    if (this.userToDeactivateId) {
      console.log('Confirming rejection for userId:', this.userToDeactivateId); // Debug log
      this.loading = true;
  
      this.activeInactService.rejectUser(this.userToDeactivateId).subscribe({
        next: (response) => {
          console.log('Rejection successful:', response); // Debug log
          this.loading = false;
          this.pendingUsers = this.pendingUsers.filter(
            (user) => user.userId !== this.userToDeactivateId
          );
          this.resetRejectDialogState();
          this.fetchPendingUsers();
          alert('User rejected successfully!');
        },
        error: (err) => {
          console.error('Rejection failed:', {
            status: err.status,
            message: err.message,
            error: err.error
          }); // Detailed error log
          this.loading = false;
          alert('Failed to reject user: ' + (err.error || err.message || 'Please try again.'));
          this.resetRejectDialogState();
        }
      });
    }
  }
  onRejectCancelled(): void {
    this.resetRejectDialogState();
  }

  resetRejectDialogState(): void {
    this.isRejectDialogVisible = false;
    this.userToDeactivateId = null;
  }

  processApproval(payload: { roleId: string; profileId: string; statusId: string }): void {
    if (this.selectedUser) {
      this.loading = true;

      const approvalPayload: ApprovalRequest = {
        userId: this.selectedUser.userId,
        roleId: +payload.roleId,
        profileId: +payload.profileId,
        statusId: +payload.statusId,
        isApproved: true, // Set this to true since it's an approval action
        approvedBy: 'SuperAdmin' // You might want to get this from your auth service
      };

      console.log('Sending approval payload:', approvalPayload);

      this.activeInactService.approveUser(this.selectedUser.userId, approvalPayload)
        .subscribe({
          next: (response) => {
            this.loading = false;
            console.log('Approval Success:', response);
            this.pendingUsers = this.pendingUsers.filter(user => user.userId !== this.selectedUser?.userId);
            this.cancelApproval();
            this.fetchPendingUsers();
            this.fetchActiveUsers();
            alert('User approved successfully!');
          },
          error: (err) => {
            this.loading = false;
            console.error('Full error object:', err);
            let errorMessage = 'Failed to approve user';
            
            if (err.error && typeof err.error === 'string') {
              errorMessage += ': ' + err.error;
            } else if (err.error?.message) {
              errorMessage += ': ' + err.error.message;
            } else if (err.message) {
              errorMessage += ': ' + err.message;
            }
            
            alert(errorMessage);
          }
        });
    }
  }
}
