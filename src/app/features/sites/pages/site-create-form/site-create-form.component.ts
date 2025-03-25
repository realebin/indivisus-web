/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
