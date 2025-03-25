/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from '@models/_component-base.model';
import { SiteCreateEditModelRequest } from '@models/site.model';
import { UserManagementInquiryAppUserModelResponse } from '@models/user-management.model';
import { UserManagementService } from '@services/user-management.service';

@Component({
  selector: 'app-site-create-form',
  templateUrl: './site-create-form.component.html',
  styleUrls: ['./site-create-form.component.scss']
})
export class SiteCreateFormComponent implements OnInit {
  @Input() data: SiteCreateEditModelRequest = {
    siteName: '',
    address: '',
    picUserId: ''
  };
  @Input() isFormValid: boolean = false;
  @Input() errorMessage: string = '';
  @Output() formValidityChange = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<SiteCreateEditModelRequest>();

  formGroup!: FormGroup;
  users: any[] = [];
  isLoading: boolean = false;

  fields: FieldConfig[] = [
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'text',
      placeholder: 'Enter site name',
      validators: [Validators.required],
      validationMessages: {
        required: 'Site name is required'
      }
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter address',
      validators: [Validators.required],
      validationMessages: {
        required: 'Address is required'
      }
    },
    {
      name: 'picUserId',
      label: 'PIC User',
      type: 'select',
      placeholder: 'Select a user',
      validators: [Validators.required],
      validationMessages: {
        required: 'PIC User is required'
      },
      options: []
    }
  ];

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.patchFormData();

    this.formGroup.valueChanges.subscribe((value) => {
      const updatedData = { ...this.data, ...value };
      this.dataChange.emit(updatedData);
    });

    this.formGroup.statusChanges.subscribe((status) => {
      this.formValidityChange.emit(status === 'VALID');
    });
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      siteName: ['', Validators.required],
      address: ['', Validators.required],
      picUserId: ['', Validators.required]
    });
  }

  private patchFormData(): void {
    if (this.data) {
      this.formGroup?.patchValue(this.data);
    }
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.userManagementService.inquiryAppUser().subscribe({
      next: (response: UserManagementInquiryAppUserModelResponse) => {
        this.users = response.appUsers;
        // Update the select options with the users
        const picUserField = this.fields.find(field => field.name === 'picUserId');
        if (picUserField) {
          picUserField.options = this.users.map(user => ({
            label: `${user.fullName} (${user.username})`,
            value: user.id
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
    }
  }
}
