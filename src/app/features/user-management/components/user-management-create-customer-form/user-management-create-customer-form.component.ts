import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from '@models/_component-base.model';
import { UserManagementCreateCustomerModelRequest } from '@models/user-management.model';

@Component({
  selector: 'app-user-management-create-customer-form',
  template: `
    <div class="container" *ngIf="!isLoading">
      <div class="alert alert-danger" role="alert" *ngIf="errorMessageCreate">
        {{ errorMessageCreate }}
      </div>
      <div class="alert alert-danger" role="alert" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
      <form [formGroup]="formGroup" class="needs-validation">
        <app-input-builder
          *ngFor="let field of fields"
          [formGroup]="formGroup"
          [config]="field"
        ></app-input-builder>
      </form>
    </div>
    <app-loader *ngIf="isLoading"></app-loader>
  `,
  styleUrls: ['./user-management-create-customer-form.component.scss']
})
export class UserManagementCreateCustomerFormComponent implements OnInit {
  @Input() data!: UserManagementCreateCustomerModelRequest;
  @Input() isFormValid: boolean;
  @Input() isEditMode = false;
  @Input() errorMessageCreate: string;
  @Output() formValidityChange = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<UserManagementCreateCustomerModelRequest>();
  
  formGroup!: FormGroup;
  errorMessage = '';
  isLoading = false;
  
  fields: FieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter First Name',
      validators: [Validators.required],
      validationMessages: {
        required: 'First Name is required',
      },
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter Last Name',
      validators: [],
      validationMessages: {},
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter Address',
      validators: [Validators.required],
      validationMessages: {
        required: 'Address is required',
      },
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter City',
      validators: [Validators.required],
      validationMessages: {
        required: 'City is required',
      },
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter Phone Number',
      validators: [Validators.required],
      validationMessages: {
        required: 'Phone Number is required',
      },
    },
    {
      name: 'postalCode',
      label: 'Postal Code',
      type: 'text',
      placeholder: 'Enter Postal Code',
      validators: [Validators.required],
      validationMessages: {
        required: 'Postal Code is required',
      },
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'text',
      placeholder: 'Enter Notes',
      validators: [],
      validationMessages: {},
    },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.patchFormData();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      postalCode: ['', Validators.required],
      notes: [''],
    });
  }

// In user-management-create-customer-form.component.ts
private setupFormListeners(): void {
  // Listen for form changes
  this.formGroup.valueChanges.subscribe(value => {
    const updatedData = { ...this.data, ...value };
    this.dataChange.emit(updatedData);
  });

  // Listen for form status changes
  this.formGroup.statusChanges.subscribe(status => {
    console.log('Customer form status:', status);
    this.formValidityChange.emit(status === 'VALID');
  });
}

// Add this method to check validity before saving
validateForm(): boolean {
  this.markFormAsTouched();
  return this.formGroup.valid;
}

  private updateFormValidity(): void {
    this.formValidityChange.emit(this.formGroup.valid);
  }

  markFormAsTouched(): void {
    if (this.formGroup) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
    }
  }

  private patchFormData(): void {
    if (this.data) {
      this.formGroup?.patchValue(this.data);
    }
  }

  resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
      
      // Set default values
      const defaultValues = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phoneNumber: '',
        postalCode: '',
        notes: ''
      };
      
      this.formGroup.patchValue(defaultValues);
      
      // Mark all controls as pristine and untouched
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsPristine();
        control?.markAsUntouched();
      });
      
      // Update form validity
      this.updateFormValidity();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.formGroup) {
      this.patchFormData();
    }
  }

  isFieldConfig(field: FieldConfig | any): boolean {
    return (field as FieldConfig).name !== undefined;
  }
}