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
import { UserManagementCreateSupplierModelRequest } from '@models/user-management.model';

@Component({
  selector: 'app-user-management-create-supplier-form',
  templateUrl: './user-management-create-supplier-form.component.html',
  styleUrl: './user-management-create-supplier-form.component.scss',
})
export class UserManagementCreateSupplierFormComponent implements OnInit {
  @Input() data!: UserManagementCreateSupplierModelRequest;
  @Input() isFormValid: boolean;
  @Input() isEditMode = false;
  @Input() errorMessageCreate: string;
  @Output() formValidityChange = new EventEmitter<boolean>();
  @Output() dataChange =
    new EventEmitter<UserManagementCreateSupplierModelRequest>();
  formGroup!: FormGroup;
  fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter Name',
      validators: [Validators.required],
      validationMessages: {
        required: 'Name is required',
      },
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter Country',
      validators: [Validators.required],
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
      name: 'description',
      label: 'Notes',
      type: 'text',
      placeholder: 'Enter Notes',
      validators: [],
    },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.patchFormData();
    this.resetFormState();

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
      name: ['', Validators.required],
      country: ['', Validators.required],
      description: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      postalCode: ['', Validators.required],

    });
  }

  private resetFormState(): void {
    // Reset the form's state without changing values
    Object.keys(this.formGroup.controls).forEach((key) => {
      const control = this.formGroup.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  private patchFormData(): void {
    if (this.data) {
      this.formGroup?.patchValue(this.data);
    }
  }

  resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.patchFormData();
      this.resetFormState();
    }
  }

  get requestData(): UserManagementCreateSupplierModelRequest {
    const formValue = this.formGroup?.value;
    return {
      name: formValue?.name,
      country: formValue?.name,
      description: formValue?.decription,
      address: formValue?.address,
      city: formValue?.city,
      phoneNumber: formValue?.phoneNumber,
      postalCode: formValue?.postalCode,
    };
  }
}
