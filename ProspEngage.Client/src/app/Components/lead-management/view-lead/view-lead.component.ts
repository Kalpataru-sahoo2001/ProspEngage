import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LeadService } from '../../../services/lead.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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

@Component({
  selector: 'app-view-lead',
  standalone:true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './view-lead.component.html',
  styleUrl: './view-lead.component.css'
})
export class ViewLeadComponent {
// lead: Lead | null = null;
error: string | null = null;
@Input() lead: Lead | null = null;
@Output() close = new EventEmitter<void>();

constructor(
  private route: ActivatedRoute,
  private leadService: LeadService
) {}

ngOnInit(): void {
  // Get id from the URL
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.loadLead(+id);
  }
}
private loadLead(id: number): void {
  this.leadService.getLeadById(id).subscribe({
    next: (lead) => {
      this.lead = lead;
    },
    error: (error) => {
      this.error = 'Failed to load lead details';
      console.error('Error loading lead:', error);
    }
  });
}
onClose(): void {
  this.close.emit();
}

}
