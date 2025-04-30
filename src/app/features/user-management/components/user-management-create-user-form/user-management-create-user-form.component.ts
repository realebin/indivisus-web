/* eslint-disable @typescript-eslint/no-explicit-any */
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
    validators: [
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

  constructor(private fb: FormBuilder, private siteService: SiteService) { }
  ngOnInit(): void {
    this.inquirySitesDropdown();
    this.initForm();

    // Handle disabled username in edit mode
    if (this.isEditMode) {
      this.formGroup.get('username')?.disable();
    }

    this.patchFormData();
    this.setupFormListeners();
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
    }

    if (changes['isEditMode'] && this.formGroup) {
      const passwordControl = this.formGroup.get('password');
      const usernameControl = this.formGroup.get('username');

      if (this.isEditMode) {
        // In edit mode
        usernameControl?.disable();
        if (!this.showPasswordFields) {
          passwordControl?.clearValidators();
          passwordControl?.updateValueAndValidity();
        }
      } else {
        // In create mode
        usernameControl?.enable();
        passwordControl?.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]);
        passwordControl?.updateValueAndValidity();
      }

      this.updateFormValidity();
    }
  }

  private updateFormValidity(): void {
    // Calculate form validity with special handling for edit mode
    let isValid = false;

    if (this.isEditMode) {
      if (this.showPasswordFields) {
        // In edit mode with password showing, the entire form must be valid
        isValid = this.formGroup.valid;
      } else {
        // In edit mode without password showing, only check other fields
        isValid = true;
        Object.keys(this.formGroup.controls)
          .filter(key => key !== 'password')
          .forEach(key => {
            const control = this.formGroup.get(key);
            if (control && control.invalid && (control.touched || control.dirty)) {
              isValid = false;
            }
          });
      }
    } else {
      // In create mode, entire form must be valid
      isValid = this.formGroup.valid;
    }

    // Emit the calculated validity
    this.formValidityChange.emit(isValid);
  }

  private patchFormData(): void {
    if (this.data && this.formGroup) {
      // Create a copy of the data to patch
      const patchData = { ...this.data };

      // Instead of deleting, set password to empty string in edit mode when not showing password
      if (this.isEditMode && !this.showPasswordFields) {
        patchData.password = '';  // Set to empty string instead of deleting
      }

      this.formGroup.patchValue(patchData);
    }
  }

  getPasswordField(): FieldConfig | undefined {
    // if (!this.isEditMode || this.showPasswordFields) {
    //   return {
    //     ...this.passwordField,
    //     validators: this.isEditMode && this.showPasswordFields
    //       ? [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]
    //       : this.passwordField.validators
    //   };
    // }
    // return undefined;
    if (!this.isEditMode || this.showPasswordFields) {
      return this.passwordField;
    }
    return undefined;
  }

  private setupFormListeners(): void {
    // Listen for form changes
    this.formGroup.valueChanges.subscribe(value => {
      // Update the data
      const formValue = this.formGroup.getRawValue(); // Includes disabled fields
      const updatedData = {
        ...this.data,
        ...formValue,
        fullName: `${formValue.firstName || ''} ${formValue.lastName || ''}`.trim()
      };
      this.dataChange.emit(updatedData);
    });

    // Listen for form status changes
    this.formGroup.statusChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }


  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    this.btnPasswordText = this.showPasswordFields
      ? 'Cancel Update Password'
      : 'Update Password';

    const passwordControl = this.formGroup.get('password');
    if (passwordControl) {
      if (this.showPasswordFields) {
        // When showing password, add validators
        passwordControl.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]);
        passwordControl.setValue(''); // Clear any existing password
      } else {
        // When hiding password, remove validators
        passwordControl.clearValidators();
        passwordControl.setValue('');
      }

      passwordControl.updateValueAndValidity();
      this.updateFormValidity();
    }
  }

  // In user-management-create-user-form.component.ts

  resetForm(): void {
    if (this.formGroup) {
      // Reset the form values
      this.formGroup.reset();

      // Set default values
      const defaultValues = {
        role: '',
        username: '',
        firstName: '',
        lastName: '',
        site: '',
        password: ''
      };

      this.formGroup.patchValue(defaultValues);

      // Important: Mark all controls as pristine and untouched
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsPristine();
        control?.markAsUntouched();
      });

      // Reset password toggle state
      this.showPasswordFields = false;
      this.btnPasswordText = 'Update Password';

      // Disable username field if in edit mode
      if (this.isEditMode && this.formGroup.get('username')) {
        this.formGroup.get('username')?.disable();
      } else if (this.formGroup.get('username')) {
        this.formGroup.get('username')?.enable();
      }

      // Update form validity
      this.updateFormValidity();
    }
  }


  isFieldConfig(field: FieldConfig | any): boolean {
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
