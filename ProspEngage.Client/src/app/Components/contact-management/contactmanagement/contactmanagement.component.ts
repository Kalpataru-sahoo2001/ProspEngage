import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BulkuploadComponent } from '../bulkupload/bulkupload.component';
import { AddContactComponent } from '../add-contact/add-contact.component';
import { Contact, ContactManagementService, SearchResult } from '../../../services/contact-management.service';
import { debounceTime, distinctUntilChanged, finalize, map, Subject, Subscription } from 'rxjs';
import { SearchService } from '../../../services/search.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contactmanagement',
  standalone:true,
  imports: [CommonModule, FormsModule, BulkuploadComponent,AddContactComponent,RouterModule],
  templateUrl: './contactmanagement.component.html',
  styleUrl: './contactmanagement.component.css'
})
export class ContactmanagementComponent implements OnInit, OnDestroy{
  allContacts: Contact[] = [];
  contacts: Contact[] = [];
  showBulkUpload = false;
  showAddContact = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchQuery = '';
  noResults: boolean = false;
  selectAll = false;
  loading = false;
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null=null;
  contactId: number | null = null; 
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private contactService: ContactManagementService, private searchService: SearchService) {

    this.searchSubscription = this.searchService.searchEvent$.subscribe(
      ({ query, type }) => {
        this.searchQuery = query;
        this.performSearch(query, type);
      }
    );
  }

  ngOnInit() {
    this.loadContacts();
    
  this.searchSubscription = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  ).subscribe(query => {
    if (query.length >= 3) {
      this.performSearch(query, 'all');
    } else if (query.length === 0) {
      this.loadContacts();
    }
  });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private performSearch(query: string, type: string) {
    this.loading = true;
    this.currentPage = 1;
    
    this.contactService.searchContactsOnly(query)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (contacts) => {
          this.allContacts = contacts;
          this.totalItems = contacts.length;
          this.noResults = contacts.length === 0 && query.length > 0;
          this.updatePaginatedContacts();
        },
        error: (error) => {
          console.error('Error searching contacts:', error);
          this.allContacts = [];
          this.contacts = [];
          this.totalItems = 0;
          this.noResults = true;
        }
      });
  }
  loadContacts() {
    this.loading = true;
    this.noResults = false;
    this.contactService.getContacts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (contacts) => {
          this.allContacts = contacts;
          if (this.sortColumn) {
            this.sortTable(this.sortColumn, this.sortDirection);
          }
          this.totalItems = contacts.length;
          this.updatePaginatedContacts();
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.allContacts = [];
          this.contacts = [];
          this.totalItems = 0;
        }
      });
  }


 searchContacts() {
  this.searchSubject.next(this.searchQuery);
}


//  for bulk operation

getSelectedContactIds(): number[] {
  return this.contacts
    .filter(contact => contact.isSelected)
    .map(contact => contact.id);
}
onSendEmail() {
  
}

onCreateTask() {
  
}

onBulkDelete() {
}

onBulkEdit() {
  
}

// sorting code
sortTable(column: string, direction: 'asc' | 'desc'): void {
  this.sortColumn = column;
  this.sortDirection = direction;

  this.allContacts.sort((a: Contact, b: Contact) => {
    const aValue = this.getValueByPath(a, column);
    const bValue = this.getValueByPath(b, column);

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

 
    if (!aValue && bValue) return direction === 'asc' ? -1 : 1;
    if (aValue && !bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  this.updatePaginatedContacts();
}

private getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}


  updatePaginatedContacts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.contacts = this.allContacts.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.currentPage = page;
      this.updatePaginatedContacts();
    }
  }

  onItemsPerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(select.value, 10);
    this.currentPage = 1;
    this.updatePaginatedContacts();
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.contacts = this.contacts.map(contact => {
      return {
        ...contact,
        isSelected: this.selectAll
      };
    });
  }
  onCheckboxChange(contact: Contact) {
    contact.isSelected = !contact.isSelected;
    this.updateSelectAllState();
  }
  private updateSelectAllState() {
    this.selectAll = this.contacts.length > 0 && this.contacts.every(contact => contact.isSelected);
  }

  onEdit(id: number) {
    console.log('Edit button clicked for contact ID:', id);
    this.contactId = id;
    this.showAddContact = true;
  }

  contactToEdit: number | null = null;   //updated

  onDelete(contactId: number,contactName:string) {
    if (confirm(`Are you sure you want to delete the contact "${contactName}"?`)) {
      this.contactService.deleteContact(contactId).subscribe({
        next: () => {
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        }
      });
    }
  }

  toggleBulkUpload() {
    this.showBulkUpload = !this.showBulkUpload;
  }

  onBulkUploadClose() {
    this.showBulkUpload = false;
    this.loadContacts();
  }
  onAddContactClose()
  {
    this.showAddContact = false;
    this.contactId = null;
    this.loadContacts();
  }

  onContactSaved(contact: Contact) {
    const isEdit = this.contactId != null;
    this.loadContacts();
    this.showAddContact = false;
    this.contactId = null; // upd
    alert(isEdit ? 'Contact updated successfully!' : 'Contact created successfully!'); // updated
  }
  

  toggleAddContact() {
    this.showAddContact = !this.showAddContact;
  }

}
