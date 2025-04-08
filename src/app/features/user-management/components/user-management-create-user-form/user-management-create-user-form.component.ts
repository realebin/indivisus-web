/* eslint-disable @typescript-eslint/no-explicit-any */
// user-management-create-user-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from '@models/_component-base.model';
import { SiteOverviewList } from '@models/site.model';
import { UserManagementCreateAppUserModelRequest } from '@models/user-management.model';
import { Subscription } from '@node_modules/rxjs/dist/types';
import { SiteService } from '@services/site.service';

@Component({
  selector: 'app-user-management-create-user-form',
  templateUrl: './user-management-create-user-form.component.html',
  styleUrl: './user-management-create-user-form.component.scss',
})
export class UserManagementCreateUserFormComponent implements OnInit {
  @Input() data!: UserManagementCreateAppUserModelRequest;
  @Input() isFormValid: boolean;
  @Input() isEditMode = false;
  @Output() dataChange =
    new EventEmitter<UserManagementCreateAppUserModelRequest>();
  @Output() formValidityChange = new EventEmitter<boolean>();
  @Input() errorMessageCreate: string;
  formGroup!: FormGroup;
  inquirySites$: Subscription;
  sites: SiteOverviewList[] = [];
  errorMessage: string;
  showPasswordFields = false;
  btnPasswordText = 'Update Password';
  isLoading = false;

  fields: FieldConfig[] = [
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'Enter Role',
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'User', value: 'User' },
      ],
      validators: [Validators.required],
      validationMessages: {
        required: 'Role is required',
      },
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter username',
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^[a-zA-Z0-9_]*$/),
      ],
      validationMessages: {
        required: 'Username is required',
        minlength: 'Username must be at least 4 characters long',
        pattern: 'Username can only contain letters, numbers and underscore',
      },
    },
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
      name: 'site',
      label: 'Site',
      type: 'select',
      placeholder: 'Enter Site',
      validators: [Validators.required],
      validationMessages: {
        required: 'Site is required',
      },
      options: [],
    },
  ];

  passwordField: FieldConfig = {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    validators: this.isEditMode
      ? []
      : [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
        ],
    validationMessages: {
      required: 'Password is required',
      minlength: 'Password must be at least 8 characters long',
      pattern: 'Password must contain at least one letter and one number',
    },
  };

  constructor(private fb: FormBuilder, private siteService: SiteService) {}
  ngOnInit(): void {
    this.inquirySitesDropdown();
    this.initForm();

    // Handle disabled fields differently
    if (this.isEditMode) {
      const usernameField = this.fields.find(field => field.name === 'username');
      if (usernameField) {
        usernameField.isDisabled = true;
      }

      this.formGroup.get('password')?.clearValidators();
      this.formGroup.get('password')?.updateValueAndValidity();
    }

    this.patchFormData();
    this.resetFormState();

    this.formGroup.valueChanges.subscribe((value) => {
      // Use a clean approach to emit data changes
      const formValue = this.formGroup.getRawValue(); // Get values including disabled controls
      const updatedData = {
        ...this.data,
        ...formValue,
        fullName: `${formValue.firstName || ''} ${formValue.lastName || ''}`.trim(),
      };
      this.dataChange.emit(updatedData);
    });

    // this.formGroup.statusChanges.subscribe((status) => {
    //   this.formValidityChange.emit(status === 'VALID');
    // });
    this.formGroup.statusChanges.subscribe((status) => {
      let isValid = status === 'VALID';
      
      // In edit mode without password showing, consider form valid if other fields are valid
      if (this.isEditMode && !this.showPasswordFields) {
        // Only check non-password fields
        isValid = true;
        Object.keys(this.formGroup.controls)
          .filter(key => key !== 'password')
          .forEach(key => {
            if (this.formGroup.get(key)?.invalid) {
              isValid = false;
            }
          });
        }
          this.formValidityChange.emit(isValid);
        });
  }
  

  private initForm(): void {
    this.formGroup = this.fb.group({
      role: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(4)]],
      firstName: ['', Validators.required],
      lastName: [''],
      site: ['', Validators.required],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(8)],
      ],
    });

    // Disable username field if in edit mode
    if (this.isEditMode) {
      this.formGroup.get('username')?.disable();
    }
  }



// In user-management-create-user-form.component.ts
ngOnChanges(changes: SimpleChanges): void {
  if (changes['data'] && this.formGroup) {
    this.patchFormData();
    this.resetFormState();
  }

  if (changes['isEditMode'] && this.formGroup) {
    const usernameControl = this.formGroup.get('username');
    if (usernameControl) {
      if (this.isEditMode) {
        usernameControl.disable();
        
        // In edit mode, clear password validators until toggled
        this.formGroup.get('password')?.clearValidators();
        this.formGroup.get('password')?.updateValueAndValidity();
      } else {
        usernameControl.enable();
        
        // In create mode, password is required
        this.formGroup.get('password')?.setValidators([
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]);
        this.formGroup.get('password')?.updateValueAndValidity();
      }
    }
  }
}

private patchFormData(): void {
  if (this.data && this.formGroup) {
    console.log('Patching form data:', this.data);

    // Patch the form with data
    this.formGroup.patchValue({
      role: this.data.role || '',
      username: this.data.username || '',
      firstName: this.data.firstName || '',
      lastName: this.data.lastName || '',
      site: this.data.site || '',
      password: this.isEditMode ? '' : (this.data.password || '')
    });
  }
}

getPasswordField(): FieldConfig | undefined {
  // Always return the password field when in create mode
  // In edit mode, return only when the toggle is active
  // if (!this.isEditMode || this.showPasswordFields) {
  //   // Return the password field with the appropriate validators
  //   return {
  //     ...this.passwordField,
  //     validators: this.isEditMode && this.showPasswordFields
  //       ? [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]
  //       : this.isEditMode && !this.showPasswordFields
  //         ? []
  //         : [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]
  //   };
  // }
  // return undefined;
  if (!this.isEditMode || this.showPasswordFields) {
    return {
      ...this.passwordField,
      validators: this.isEditMode && this.showPasswordFields
        ? [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]
        : this.passwordField.validators
    };
  }
  return undefined;
}

// Fix the togglePasswordFields method to properly update the password control
togglePasswordFields() {
  this.showPasswordFields = !this.showPasswordFields;
  this.btnPasswordText = this.showPasswordFields
    ? 'Cancel Update Password'
    : 'Update Password';

  // When showing password fields, make password required
  // When hiding, remove the requirement
  const passwordControl = this.formGroup.get('password');
  if (passwordControl) {
    if (this.showPasswordFields) {
      passwordControl.setValidators([
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
      ]);
    } else {
      passwordControl.clearValidators();
      passwordControl.setValue('');
      passwordControl.updateValueAndValidity();
    }
    passwordControl.updateValueAndValidity();
  }

  setTimeout(() => {
    let isValid = this.formGroup.valid;
    if (this.isEditMode && !this.showPasswordFields) {
      // Only check non-password fields
      isValid = true;
      Object.keys(this.formGroup.controls)
        .filter(key => key !== 'password')
        .forEach(key => {
          if (this.formGroup.get(key)?.invalid) {
            isValid = false;
          }
        });
    }
    this.formValidityChange.emit(isValid);
  });
}

private resetFormState(): void {
  // Reset the form's state without changing values
  Object.keys(this.formGroup.controls).forEach(key => {
    const control = this.formGroup.get(key);
    control?.markAsPristine();
    control?.markAsUntouched();
  });
}


  isFieldConfig(field: FieldConfig | any): field is FieldConfig {
    return (field as FieldConfig).name !== undefined;
  }

  inquirySitesDropdown() {
    this.isLoading = true;
    this.siteService.getSiteForFilter().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.sites = data.data;
        this.updateSiteOptions();
      },
      error: ({ message }) => {
        this.isLoading = false;
        this.errorMessage = message;
      },
    });
  }

  updateSiteOptions() {
    const siteField = this.fields.find((field) => field.name === 'site');
    if (siteField) {
      siteField.options = this.sites.map((site) => ({
        label: site.siteName,
        value: site.siteId,
      }));
    }
  }
}
