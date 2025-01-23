import { Routes } from '@angular/router';
import { RegisterComponent } from './Components/auth/register/register.component'; 
import { CreateUserComponent } from './Components/user-management/create-user/create-user.component';
import { LoginComponent } from './Components/auth/login/login.component';
import { SadComponent } from './Components/user-management/super-admin-dashboard/super-admin-dashboard.component';
import { AddContactComponent } from './Components/contact-management/add-contact/add-contact.component';
import { BulkuploadComponent } from './Components/contact-management/bulkupload/bulkupload.component';
import { ContactmanagementComponent } from './Components/contact-management/contactmanagement/contactmanagement.component';
import { DashboardLayoutComponent } from './Components/Layout/dashboard-layout.component';
import { ApprovalFormComponent } from './Components/user-management/approval-form/approval-form.component';
import { RejectUserComponent } from './Components/user-management/reject-user/reject-user.component';
import { TaskComponent } from './Components/task-management/task/task.component';
import { LeadDashboardComponent } from './Components/lead-management/lead-dashboard/lead-dashboard.component';
import { CreateLeadComponent } from './Components/lead-management/create-lead/create-lead.component';
import { ViewLeadComponent } from './Components/lead-management/view-lead/view-lead.component';
import { CreateTaskComponent } from './Components/task-management/create-task/create-task.component';
import { DealmanagementComponent } from './Components/deal-management/dealmanagement/dealmanagement.component';
import { CreateDealComponent } from './Components/deal-management/create-deal/create-deal.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: SadComponent 
      },
      {
        path: 'contacts', component: ContactmanagementComponent ,
        children: [
         
          { path: 'add', component: AddContactComponent },
          { path: 'bulk-upload', component: BulkuploadComponent }
        ]
      },
      {
        path:'lead',
        children:[
          {path:'',component:LeadDashboardComponent},
          {path:'add-lead',component:CreateLeadComponent},
          
        ]
      },
      {
        path: 'deal',
        children: [
          { path: '', component: DealmanagementComponent},
          {path:'create-deal',component:CreateDealComponent}
       
        ]
      },
      {
        path: 'task',
        children: [
          { path: '', component: TaskComponent},
          {path:'create-task',component:CreateTaskComponent}
       
        ]
      },
      {
        path: 'users',
        children: [
          { path: 'create', component: CreateUserComponent },
          { path: 'approvals', component: ApprovalFormComponent },
          { path: 'rejected', component: RejectUserComponent }
        ]
      }
    ]
  },
];
