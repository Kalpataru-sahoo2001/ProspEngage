import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ContactManagementService } from '../../../services/contact-management.service';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { utils, writeFile } from 'xlsx';
interface ContactRow {
  ContactName: string;
  LeadSource?: string;
  EmailID: string;
  PhoneNumber: string;
  CompanyName?: string;
  Address?: string;
  Country: string;
  State: string;
  City: string;
  Pincode?: string;  
  DateAndTime?: string;
  Created_On?: string;
  Created_By?: string;
  Modified_On?: string;
  Modified_By?: string;
  IsActive?: boolean;
}

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  records?: number;
  hash?: string; 
}

@Component({
  selector: 'app-bulkupload',
  standalone :true,
  imports: [CommonModule],
  templateUrl: './bulkupload.component.html',
  styleUrl: './bulkupload.component.css'
})
export class BulkuploadComponent {
  @Output() close = new EventEmitter<void>();
  
  selectedFiles: FileUploadStatus[] = [];
  dragOver = false;
  loading = false;
  totalRecords = 0;
  showAlert = false;
  alertMessage = '';
  uploadInProgress = false;

  private readonly SUPPORTED_EXTENSIONS = ['xls', 'xlsx', 'csv'];
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  private readonly MAX_FILES = 10;
  private readonly REQUIRED_COLUMNS = [
    'ContactName',
    'EmailID',
    'PhoneNumber',
    //  'CompanyName',
    //  'Address',
    'Country',
    'State',
    'City'
  ];

  constructor(private contactService: ContactManagementService) {}

  private showMessage(message: string) {
    this.alertMessage = message;
    this.showAlert = true;
  }

  closeAlert() {
    this.showAlert = false;
    this.alertMessage = '';
  }

  private generateFileHash(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }


  private isDuplicateFile(file: File): boolean {
    const newFileHash = this.generateFileHash(file);
    return this.selectedFiles.some(existingFile => 
      existingFile.hash === newFileHash
    );
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    
    input.value = '';
  }

  private getFileErrorMessage(file: File): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (this.isDuplicateFile(file)) {
      return `Duplicate File: ${file.name} has already been selected`;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return `File Size Error: ${file.name} exceeds 25MB limit`;
    }

    if (!extension || !this.SUPPORTED_EXTENSIONS.includes(extension)) {
      return `Invalid File Type: ${file.name} must be XLS, XLSX or CSV`;
    }

    return null;
  }

  async handleFiles(files: File[]) {
    if (this.selectedFiles.length + files.length > this.MAX_FILES) {
      this.showMessage(`Maximum ${this.MAX_FILES} files can be uploaded at once`);
      return;
    }

    for (const file of files) {
      const errorMessage = this.getFileErrorMessage(file);
      if (errorMessage) {
        this.showMessage(errorMessage);
        continue;
      }

      try {
        const data = await this.readFileData(file);
        if (data && data.length > 0) {
          const headerValidation = this.validateFileStructure(data[0]);
          if (headerValidation.isValid) {
            const fileHash = this.generateFileHash(file);
            this.selectedFiles.push({
              file,
              status: 'pending',
              records: data.length,
              hash: fileHash
            });
            this.totalRecords += data.length;
          } else {
            this.showMessage(`Invalid Format in ${file.name}: Missing required columns`);
          }
        } else {
          this.showMessage(`Empty File: ${file.name} contains no records`);
        }
      } catch (error) {
        this.showMessage(`Error reading ${file.name}. Please check the file format`);
        console.error('Error reading file:', error);
      }
    }
  }

  removeFile(index: number) {
    if (this.selectedFiles[index].status === 'processing') {
      return; 
    }
    this.totalRecords -= this.selectedFiles[index].records || 0;
    this.selectedFiles.splice(index, 1);
  }

  downloadSampleFile() {
    
    const headers = [
      'ContactName',
      'LeadSource', 
      'EmailID',
      'PhoneNumber',
      'CompanyName',
      'Address',
      'Country',
      'State',
      'City',
      'Pincode'
    ];

 
    const ws = utils.aoa_to_sheet([headers]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Contacts');

   
    const colWidths = [
      { wch: 15 }, // ContactName
      { wch: 12 }, // LeadSource
      { wch: 25 }, // EmailID
      { wch: 15 }, // PhoneNumber
      { wch: 15 }, // CompanyName
      { wch: 25 }, // Address
      { wch: 15 },  // Country
      { wch: 15 },  // State
      { wch: 15 },  // City
      { wch: 10 }   // Pincode
    ];
    ws['!cols'] = colWidths;


    writeFile(wb, 'contact_upload_template.xlsx', { bookType: 'xlsx' });
  }

  private validateFileStructure(firstRow: any): { isValid: boolean; missingColumns: string[] } {
    const presentColumns = Object.keys(firstRow);
    const missingColumns = this.REQUIRED_COLUMNS.filter(
      col => !presentColumns.includes(col)
    );
    
    return {
      isValid: missingColumns.length === 0,
      missingColumns
    };
  }

  private async readFileData(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  private async processFileData(file: File): Promise<FormData> {
    try {
      const data = await this.readFileData(file);
      const currentDateTime = new Date().toISOString();
      
      const processedData = data.map((row: ContactRow) => ({
      
        ContactName: row.ContactName,
        LeadSource: row.LeadSource || '',      // Optional field
        EmailID: row.EmailID,
        PhoneNumber: row.PhoneNumber,
        CompanyName: row.CompanyName || '',    // Optional field
        Address: row.Address || '',            // Optional field
        Country: row.Country,
        State: row.State,
        City: row.City,
        Pincode: row.Pincode || '',           // Optional field
        // Add required backend fields programmatically
        DateAndTime: currentDateTime,
        Created_On: currentDateTime,
        Created_By: 'system',
        Modified_On: currentDateTime,
        Modified_By: 'system',
        IsActive: true
      }));
  
      const ws = XLSX.utils.json_to_sheet(processedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
  
      const processedFile = XLSX.write(wb, { 
        bookType: 'csv', 
        type: 'array'
      });
      
      const processedBlob = new Blob([processedFile], { 
        type: 'text/csv' 
      });
      const processedFileObj = new File(
        [processedBlob], 
        'processed_contacts.csv', 
        { type: 'text/csv' }
      );
  
      const formData = new FormData();
      formData.append('file', processedFileObj);
      return formData;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0) {
      this.showMessage('Please select files to upload');
      return;
    }

    this.uploadInProgress = true;
    let hasError = false;

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const fileStatus = this.selectedFiles[i];
      if (fileStatus.status === 'success') continue;

      fileStatus.status = 'processing';
      try {
        const formData = await this.processFileData(fileStatus.file);
        await this.uploadSingleFile(formData);
        fileStatus.status = 'success';
        fileStatus.message = 'Upload successful';
      } catch (error) {
        hasError = true;
        fileStatus.status = 'error';
        fileStatus.message = 'Upload failed';
        console.error(`Error uploading ${fileStatus.file.name}:`, error);
      }
    }

    this.uploadInProgress = false;
    
    if (hasError) {
      this.showMessage('Some files failed to upload. Check the status for details.');
    } else {
      this.showMessage('All files uploaded successfully!');
      setTimeout(() => this.closeModal(), 2000);
    }
  }

  private uploadSingleFile(formData: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.contactService.bulkUploadFile(formData).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });
  }

  closeModal() {
    if (this.uploadInProgress) {
      this.showMessage('Upload in progress. Please wait.');
      return;
    }
    this.close.emit();
  }
}
