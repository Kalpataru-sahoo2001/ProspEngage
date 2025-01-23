import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactManagementService, Contact, Country, State, City } from '../../../services/contact-management.service';
import { ModalService } from '../../../services/ModalService';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-contact.component.html',
  styleUrl: './add-contact.component.css'
})
export class AddContactComponent {
  @Input() contactId: number | null = null; // upd
  isEditMode = false; // upd
  @Output() cancelClicked = new EventEmitter<void>();
  @Output() saveClicked = new EventEmitter<Contact>();

  contactToEdit: Contact = {
    id: 0,
    contactName: '',
    leadSource: '',
    emailID: '',
    phoneNumber: '',
    companyName: '',
    address: '',
    dateAndTime: new Date().toISOString(),
    country: '',
    state: '',
    city: '',
    pincode: '',
    isSelected: false,
    isActive: true
  };

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  selectedStateId: string = '';
  isSubmitting = false;
  errorMessage = '';
  selectedCountryId: string = ''; // New property to store country ID

  constructor(private contactService: ContactManagementService, private modalService: ModalService) { }

  ngOnInit() {
    // First load countries
    this.contactService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        // Only load contact details after countries are loaded
        if (this.contactId) {
          this.isEditMode = true;
          this.loadContactDetails();
        }
      },
      error: (error) => {
        console.error('Failed to load countries:', error);
        this.errorMessage = 'Failed to load countries. Please try again.';
      }
    });
  }
  // updated
  ngOnChanges(changes: SimpleChanges) {
    if (changes['contactId']) {
      this.isEditMode = !!changes['contactId'].currentValue;
      if (this.isEditMode) {
        this.loadContactDetails();
      } else {
        this.resetForm();
      }
    }
  }

  // updated
  private loadContactDetails() {
    if (!this.contactId) return;
  
    this.contactService.getContactById(this.contactId).subscribe({
      next: (contact) => {
        this.contactToEdit = {
          ...contact,
          isSelected: false,
          isActive: true
        };
  
        // First find the country
        const countryObj = this.countries.find(c => c.countryName === contact.country);
        if (countryObj) {
          this.selectedCountryId = countryObj.countryId.toString();
          
          // Load states and wait for response
          this.contactService.getStates(countryObj.countryId).subscribe({
            next: (states) => {
              this.states = states;
              const stateObj = states.find(s => s.stateName === contact.state);
              
              if (stateObj) {
                this.selectedStateId = stateObj.stateId.toString();
                
                // Load cities only after state is loaded
                this.contactService.getCities(countryObj.countryId, stateObj.stateId).subscribe({
                  next: (cities) => {
                    this.cities = cities;
                    // Ensure the city is set after cities are loaded
                    this.contactToEdit.city = contact.city;
                  },
                  error: (error) => {
                    console.error('Error loading cities:', error);
                    this.errorMessage = 'Failed to load cities';
                  }
                });
              }
            },
            error: (error) => {
              console.error('Error loading states:', error);
              this.errorMessage = 'Failed to load states';
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.errorMessage = 'Failed to load contact details';
      }
    });
  }
  loadCountries() {
    this.contactService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Failed to load countries:', error);
        this.errorMessage = 'Failed to load countries. Please try again.';
      }
    });
  }

  loadStates(countryId: number) {
    this.contactService.getStates(countryId).subscribe({
      next: (states) => {
        this.states = states;
      },
      error: (error) => {
        console.error('Failed to load states:', error);
        this.errorMessage = 'Failed to load states. Please try again.';
      }
    });
  }
  loadCities(countryId: number, stateId: number) {
    this.contactService.getCities(countryId, stateId).subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (error) => {
        console.error('Failed to load cities:', error);
        this.errorMessage = 'Failed to load cities. Please try again.';
      }
    });
  }

  onCountryChange(event: any) {
    const countryId = event.target.value;
    if (countryId) {
      this.selectedCountryId = countryId;
      const selectedCountry = this.countries.find(c => c.countryId.toString() === countryId);
      if (selectedCountry) {
        this.contactToEdit.country = selectedCountry.countryName;
      }
      this.loadStates(parseInt(countryId, 10));
      this.contactToEdit.state = '';
      this.contactToEdit.city = '';
      this.cities = [];
    } else {
      this.states = [];
      this.cities = [];
      this.contactToEdit.country = '';
      this.contactToEdit.state = '';
      this.contactToEdit.city = '';
    }
  }
  onStateChange(event: any) {
    const stateId = event.target.value;
    this.selectedStateId = stateId;

    if (stateId && this.selectedCountryId) {
      const selectedState = this.states.find(s => s.stateId.toString() === stateId);
      if (selectedState) {
        this.contactToEdit.state = selectedState.stateName;
        this.loadCities(parseInt(this.selectedCountryId), parseInt(stateId));
      }
    } else {
      this.cities = [];
      this.contactToEdit.city = '';
    }
  }

  // updated
  onSubmit() {
    if (this.isSubmitting) return;

    if (!this.validateForm()) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const currentTime = new Date().toISOString();

    const contactData = {
      ...this.contactToEdit,
      state: this.contactToEdit.state?.toString() || '',
      dateAndTime: currentTime,
      created_On: this.isEditMode ? this.contactToEdit.created_On : currentTime,
      created_By: this.isEditMode ? this.contactToEdit.created_By : 'system',
      modified_On: currentTime,
      modified_By: 'system',
      isActive: true
    };

    const request = this.isEditMode ?
      this.contactService.updateContact(this.contactId!, contactData) :
      this.contactService.createContact(contactData);

    request.subscribe({
      next: (response: Contact) => {
        // alert('Contact saved successfully!');
        this.saveClicked.emit(response);
        this.onClose(); // Close the form after successful save
      },
      error: (error) => {
        console.error('Error saving contact:', error);
        // alert(error.message); // Show error message in alert
        this.isSubmitting = false;
        this.onClose(); // Close the form after error alert is acknowledged
      }
    });
  }
  private validateForm(): boolean {
    const isContactNameValid = this.contactToEdit.contactName.length >= 3 && this.contactToEdit.contactName.length <= 256; if (!isContactNameValid) { this.errorMessage = 'Contact name must be between 3 and 256 characters.'; return false; }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.contactToEdit.emailID)) {
      this.errorMessage = 'Please enter a valid email address (e.g., user@gmail.com).';
      return false;
    }
    return Boolean(
      this.contactToEdit.contactName &&
      this.contactToEdit.emailID &&
      this.contactToEdit.phoneNumber &&
      this.contactToEdit.companyName &&
      this.contactToEdit.country &&
      this.contactToEdit.state &&
      this.contactToEdit.city &&
      this.contactToEdit.pincode
    );
  }

  onCancel() {
    this.resetForm();
    this.cancelClicked.emit();
  }

  onClose() {
    this.resetForm();
    this.cancelClicked.emit();
  }

  private resetForm() {
    this.contactToEdit = {
      id: 0,
      contactName: '',
      leadSource: '',
      emailID: '',
      phoneNumber: '',
      companyName: '',
      address: '',
      dateAndTime: new Date().toISOString(),
      country: '',
      state: '',
      city: '',
      pincode: '',
      isSelected: false,
      isActive: true
    };
    this.selectedCountryId = '';
    this.states = [];
    this.errorMessage = '';
    this.isSubmitting = false;
    this.isEditMode = false;
  }
}
