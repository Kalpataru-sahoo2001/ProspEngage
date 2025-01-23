import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Country, Lead, State } from '../../../models/lead.types';
import { LeadService } from '../../../services/lead.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-create-lead',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule,HttpClientModule],
  templateUrl: './create-lead.component.html',
  styleUrl: './create-lead.component.css'
})
export class CreateLeadComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() leadCreated = new EventEmitter<Lead>();
 
  companyForm!: FormGroup;
  expandedContacts: boolean[] = [true];
  statuses: string[] = [];
  countries: Country[] = [];
  states: State[] = [];
  contacts!: FormArray;
  loading = false;
  errorMessage = '';
  showSuccessAlert = false;
  successMessage = '';
 
  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private router: Router
  ) {
    this.initializeForm();
  }
 
  private initializeForm(): void {
    this.companyForm = this.fb.group({
      status: ['New'],
      contacts: this.fb.array([this.createContactFormGroup()]),
      companyName: ['', Validators.required],
      DealSize: ['', Validators.required],
      employeeCount: ['', [Validators.min(1)]],
      budget: ['', [Validators.required, Validators.min(0)]],
      addressLine1: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{6}(-\d{4})?$/)]],
      authority: ['', Validators.required],
      need: ['', Validators.required],
      timeline: ['', Validators.required],
      leadSource: ['', Validators.required],
      comments: ['']
    });
 
    this.contacts = this.companyForm.get('contacts') as FormArray;
  }
 
  private createContactFormGroup(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      SourceProfile: ['', [Validators.pattern(/^https?:\/\/.*/)]],
    });
  }
 
  ngOnInit() {
    this.loadDataFromAPI();
  }
 
  loadDataFromAPI() {
    this.loading = true;
    this.errorMessage = '';
 
    this.leadService.getStatusData().subscribe({
      next: (response) => {
        this.statuses = response;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load status data. Please try again later.';
        console.error('Status loading error:', error);
      }
    });
 
    this.leadService.getCountryData().subscribe({
      next: (countries: Country[]) => {
        this.countries = countries;
        if (this.countries.length > 0) {
          this.loadStates(this.countries[0].countryId);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load country data. Please try again later.';
        console.error('Country loading error:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
 
  loadStates(countryId: number) {
    this.loading = true;
    this.leadService.getStateData(countryId).subscribe({
      next: (states: State[]) => {
        this.states = states;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load state data. Please try again later.';
        console.error('State loading error:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
 
  onCountryChange(event: any) {
    const countryId = parseInt(event.target.value, 10);
    if (countryId) {
      this.loadStates(countryId);
      this.companyForm.patchValue({ state: '' });
    } else {
      this.states = [];
    }
  }
 
  addContact(): void {
    this.contacts.push(this.createContactFormGroup());
    this.expandedContacts.push(true);
  }
 
  removeContact(index: number, event: Event): void {
    event.stopPropagation();
    if (this.contacts.length > 1) {
      this.contacts.removeAt(index);
      this.expandedContacts.splice(index, 1);
    }
  }
 
  toggleContact(index: number): void {
    this.expandedContacts[index] = !this.expandedContacts[index];
  }
 
  onCancel() {
    this.cancel.emit();
  }
 
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
      control.markAsTouched();
    });
  }
 
  onSubmit(): void {
    if (this.companyForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
 
      const formData = this.companyForm.value;
     
      this.leadService.saveLead(formData).subscribe({
        next: (response) => {
          alert(this.successMessage = 'Lead created successfully!');
          this.leadCreated.emit(response);
          setTimeout(() => {
            this.companyForm.reset();
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error) => {
          alert(this.errorMessage = typeof error === 'string' ? error : 'Failed to save lead. Please try again.');
          console.error('Error saving lead:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.companyForm);
      alert(this.errorMessage = 'Please fill in all required fields correctly.');
    }
  }
}
