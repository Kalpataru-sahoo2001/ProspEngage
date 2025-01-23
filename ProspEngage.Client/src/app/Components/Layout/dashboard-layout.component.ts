
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  ContactManagementService,
  SearchResult,
} from '../../services/contact-management.service';
import { SearchService } from '../../services/search.service';
import { ModalService } from '../../services/ModalService';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';
import { BulkuploadComponent } from '../contact-management/bulkupload/bulkupload.component';
import { AddContactComponent } from '../contact-management/add-contact/add-contact.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    BulkuploadComponent,
    AddContactComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
  animations: [
    trigger('sidebarAnimation', [
      state(
        'expanded',
        style({
          width: '200px',
        })
      ),
      state(
        'collapsed',
        style({
          width: '70px',
        })
      ),
      transition('expanded <=> collapsed', [animate('0.2s ease-in-out')]),
    ]),
  ],
})
export class DashboardLayoutComponent implements OnInit {
  sidebarState: 'expanded' | 'collapsed' = 'expanded';
  searchText: string = '';
  dropdownOptions = ['All', 'Contacts', 'Leads', 'Deals', 'Users'];
  selectedOption: string = 'All';
  filteredResults: SearchResult[] = [];
  showResults: boolean = false;
  showSuggestions: boolean = false;
  suggestions: SearchResult[] = [];
  allContacts: SearchResult[] = [];
  isAddNewDropdownOpen: boolean = false;
  showAddContactForm: boolean = false;
  noResults: boolean = false;
  showBulkUploadForm = false;
  searchTerms = new Subject<string>();
  private searchSubject = new Subject<string>();
private searchSubscription: Subscription | null = null;
  router: any;

  constructor(
    private searchService: SearchService,
    private contactService: ContactManagementService,
    private modalService: ModalService
  ) {
   
  }



  ngOnInit(): void {
    this.modalService.displayModal$.subscribe(
      display => this.showAddContactForm = display
    );
     // Set up search subscription
  this.searchSubscription = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  ).subscribe(query => {
    if (query.length >= 3) {
      this.searchService.triggerSearch(query, this.selectedOption.toLowerCase());
    }
  });
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.header-container');
    const mainContent = document.querySelector('.main-content');
    
    sidebar?.classList.toggle('collapsed');
    header?.classList.toggle('collapsed');
    mainContent?.classList.toggle('collapsed');
  }

  openAddContactForm() {
    this.showAddContactForm = true;
    this.isAddNewDropdownOpen = false;
  }
  onBulkUploadClose(){
    this.showBulkUploadForm = false;
  }
  closeAddContactForm() {
    this.showAddContactForm = false;
  }

  searchContacts() {
    if (this.searchText.length >= 3) {
      this.contactService.searchGlobal(this.searchText)
        .subscribe({
          next: (results) => {
            // Check if there are no results
            this.noResults = results.length === 0;
            
            if (this.selectedOption.toLowerCase() === 'all' || 
                this.selectedOption.toLowerCase() === 'contacts') {
              this.searchService.triggerSearch(this.searchText, this.selectedOption.toLowerCase());
            }
          },
          error: (error) => {
            console.error('Error in global search:', error);
            this.noResults = true; // Show no results on error as well
          }
        });
    } else {
      this.noResults = false; // Reset when search text is too short
    }
  }
  onContactSaved() {
    alert('Contact added successfully!');
    this.showAddContactForm = false;
  }

  openBulkUploadForm() {
    this.showBulkUploadForm = true;
    this.isAddNewDropdownOpen = false;
  }

  closeBulkUploadForm() {
    this.showBulkUploadForm = false;
  }

  onDropdownChange(event: any): void {
    this.selectedOption = event.target.value;
  }

  toggleAddNewDropdown() {
    this.isAddNewDropdownOpen = !this.isAddNewDropdownOpen;
  }

  onSearchInputChange() {
    if (this.searchText.trim()) {
      this.searchTerms.next(this.searchText.trim());
    } else {
      this.showSuggestions = false;
      this.suggestions = [];
    }
  }

  filterSuggestions(term: string): SearchResult[] {
    return this.allContacts.filter((contact) =>
      contact.name.toLowerCase().includes(term.toLowerCase())
    );
  }

  onSuggestionClick(suggestion: SearchResult) {
    this.searchText = suggestion.name;
    this.showSuggestions = false;
    this.searchContacts();
  }

  onSearch() {
    if (this.searchText.trim()) {
      this.searchService.triggerSearch(
        this.searchText,
        this.selectedOption.toLowerCase()
      );
    }
  }


  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
