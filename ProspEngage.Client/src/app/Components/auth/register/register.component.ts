import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterService } from '../../../services/register.service'; 
import { Router, RouterModule } from '@angular/router';
import { RegistrationStatusComponent } from '../register-status/register-status.component'; 
import { ToastrModule, ToastrService } from 'ngx-toastr';

// Define types for validation messages
interface ValidationMessage {
  [key: string]: string;
}

interface ValidationMessages {
  [key: string]: ValidationMessage;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RegistrationStatusComponent,
    ToastrModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  isLoading: boolean = false;
  registrationId: string = '';
  showStatus = false;
  formTouched = false;

  // Type-safe validation messages
  validationMessages: ValidationMessages = {
    title: {
      required: 'Please select a title'
    },
    firstName: {
      required: 'First name is required',
      minlength: 'First name must be at least 2 characters',
      pattern: 'First name can only contain letters'
    },
    middleName: {
      minlength: 'Middle name must be at least 2 characters',
      pattern: 'Middle name can only contain letters'
    },
    lastName: {
      required: 'Last name is required',
      minlength: 'Last name must be at least 2 characters',
      pattern: 'Last name can only contain letters'
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
      pattern: 'Email must be a Kalpita Technologies email'
    },
    mobileNumber: {
      pattern: 'Please enter a valid 10-digit mobile number'
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private registerService: RegisterService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValidation();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      title: ['', Validators.required],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      middleName: ['', [
        Validators.minLength(2),
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._-]+@[kK][aA][lL][pP][iI][tT][aA][tT][eE][cC][hH][nN][oO][lL][oO][gG][iI][eE][sS].[cC][oO][mM]$')
      ]],
      mobileNumber: ['', [
        Validators.pattern('^[0-9]{10}$')
      ]]
    });
  }

  private setupFormValidation(): void {
    this.registerForm.valueChanges.subscribe(() => {
      if (this.formTouched) {
        this.validateAllFormFields();
      }
    });

    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.valueChanges.subscribe(() => {
        if (!this.formTouched) {
          this.formTouched = true;
        }
      });
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  get isFormValid(): boolean {
    const requiredFieldsValid = 
      this.f['title'].valid &&
      this.f['firstName'].valid &&
      this.f['lastName'].valid &&
      this.f['email'].valid;

    const optionalFieldsValid = 
      (!this.f['middleName'].value || this.f['middleName'].valid) &&
      (!this.f['mobileNumber'].value || this.f['mobileNumber'].valid);

    return requiredFieldsValid && optionalFieldsValid;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.f[fieldName];
    return field.invalid && (field.dirty || field.touched || this.submitted);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.f[fieldName];
    if (control && control.errors && this.validationMessages[fieldName]) {
      const firstError = Object.keys(control.errors)[0];
      return this.validationMessages[fieldName][firstError] || 'Invalid field';
    }
    return '';
  }

  private validateAllFormFields(): void {
    Object.keys(this.f).forEach(field => {
      const control = this.f[field];
      if (control.value !== '') {
        control.markAsTouched();
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.validateAllFormFields();
    
    if (this.registerForm.invalid) {
      const invalidFields = Object.keys(this.f)
        .filter(key => this.f[key].invalid && this.f[key].errors && this.validationMessages[key])
        .map(key => {
          const firstError = Object.keys(this.f[key].errors!)[0];
          return this.validationMessages[key][firstError] || 'Invalid field';
        });
      
      if (invalidFields.length > 0) {
        this.toastr.warning(invalidFields[0], 'Form Validation');
      }
      return;
    }

    this.isLoading = true;

    this.registerService.register(this.registerForm.value).subscribe({
      next: (response: { registrationId: string }) => {
        console.log('Registration successful:', response);
        this.toastr.success('Registration successful!', 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
        this.registrationId = response.registrationId;
        
        setTimeout(() => {
          this.isLoading = false;
          this.showStatusComponent();
        }, 2000);
      },
      error: (error: any) => {
        console.error('Registration failed:', error);
        this.toastr.error(
          typeof error === 'string' ? error : 'Registration failed. Please try again.',
          'Error',
          {
            timeOut: 5000,
            progressBar: true,
            closeButton: true
          }
        );
        this.isLoading = false;
      }
    });
  }

  private showStatusComponent(): void {
    const formContainer = document.querySelector('.signup-form-container');
    if (formContainer) {
      formContainer.classList.add('hidden');
    }
    this.showStatus = true;
  }
}