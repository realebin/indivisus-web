/* eslint-disable @typescript-eslint/no-explicit-any */
// user-management-create-user-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
        Validators.minLength(4),
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
    if (this.isEditMode) {
      const usernameField = this.fields.find(field => field.name === 'username');
      if (usernameField) {
        usernameField.isDisabled = true;
      }

      // Also disable the control in the form
      this.formGroup.get('username')?.disable();
    }
    this.patchFormData();
    this.formGroup.valueChanges.subscribe((value) => {
      const updatedData = {
        ...this.data,
        ...value,
        fullName: `${value.firstName} ${value.lastName}`.trim(),
      };
      this.dataChange.emit(updatedData);
    });
    this.formGroup.statusChanges.subscribe((status) => {
      this.formValidityChange.emit(status === 'VALID');
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
  }

  private patchFormData(): void {
    if (this.data) {
      this.formGroup?.patchValue(this.data);
    }
  }

  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;
    this.btnPasswordText = this.showPasswordFields
      ? 'Cancel Update Password'
      : 'Update Password'; // Toggle text
  }

  getPasswordField(): FieldConfig | undefined {
    if (!this.isEditMode || this.showPasswordFields) {
      // Show in create mode or when toggle is clicked
      return this.passwordField;
    }
    return undefined;
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
    console.log(siteField, this.sites);
    if (siteField) {
      siteField.options = this.sites.map((site) => ({
        label: site.siteName,
        value: site.siteId,
      }));
    }
  }
}
