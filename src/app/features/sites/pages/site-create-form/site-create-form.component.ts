import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from '@models/_component-base.model';
import { SiteCreateRequest } from '@models/site.model';
import { UserManagementService } from '@services/user-management.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-site-create-form',
  templateUrl: './site-create-form.component.html',
  styleUrls: ['./site-create-form.component.scss']
})
export class SiteCreateFormComponent implements OnInit {
  @Input() data: SiteCreateRequest = {
    siteName: '',
    address: '',
    picUserId: ''
  };

  @Input() isEditMode = false;
  @Input() errorMessage = '';

  @Output() formValidityChange = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<SiteCreateRequest>();

  formGroup!: FormGroup;
  users: any[] = [];
  isLoadingUsers = false;

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
      placeholder: 'Enter full address',
      validators: [Validators.required],
      validationMessages: {
        required: 'Address is required'
      }
    },
    {
      name: 'picUserId',
      label: 'Person In Charge (PIC)',
      type: 'select',
      placeholder: 'Select a user',
      validators: [Validators.required],
      validationMessages: {
        required: 'PIC is required'
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

    // If data is available, populate the form
    if (this.data) {
      this.formGroup.patchValue(this.data);
    }
  }

  private loadUsers(): void {
    this.isLoadingUsers = true;
    this.userManagementService.inquiryAppUser()
      .pipe(finalize(() => this.isLoadingUsers = false))
      .subscribe({
        next: (response) => {
          this.users = response.appUsers;

          // Update the select options with the users
          const picUserField = this.fields.find(field => field.name === 'picUserId');
          if (picUserField) {
            picUserField.options = this.users.map(user => ({
              label: `${user.fullName} (${user.username})`,
              value: user.id.toString()
            }));
          }

          // Re-patch the form data now that we have the options
          if (this.data) {
            this.formGroup.patchValue(this.data);
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load users';
        }
      });
  }

  resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
    }
  }
}
