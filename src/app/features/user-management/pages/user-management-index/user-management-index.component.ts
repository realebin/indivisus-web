import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AppUser,
  Customer,
  Supplier,
  UserManagementCreateAppUserModelRequest,
  UserManagementCreateCustomerModelRequest,
  UserManagementCreateSupplierModelRequest,
} from '@models/user-management.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from '@node_modules/rxjs/dist/types';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { SiteAllListResponse } from '@models/site.model';
import { UserManagementDictionaryEnum } from '@cores/enums/custom-variable.enum';
@Component({
  selector: 'app-user-management-index',
  templateUrl: './user-management-index.component.html',
  styleUrl: './user-management-index.component.scss',
})
export class UserManagementIndexComponent implements OnInit, OnDestroy {
  activeTab = UserManagementDictionaryEnum.AppUser; // Default active tab
  _enumCustomer = UserManagementDictionaryEnum.Customer;
  _enumAppUser = UserManagementDictionaryEnum.AppUser;
  _enumSupplier = UserManagementDictionaryEnum.Supplier;
  previousType: string;
  isLoading: boolean;
  inquiryAppUser$: Subscription;
  inquirySupplier$: Subscription;
  inquiryCustomer$: Subscription;
  errorMessage: string;
  errorMessageCreateAppUser: string;
  errorMessageCreateCustomer: string;
  errorMessageCreateSupplier: string;
  appUsers: AppUser[];
  modalRef?: BsModalRef;
  suppliers: Supplier[];
  customers: Customer[];
  isUserFormValid = false;
  isCustomerFormValid = false;
  isSupplierFormValid = false;
  isEditMode = false;
  selectedUser: any;
  @ViewChild('createUserModal') createUserModal!: TemplateRef<any>;
  @ViewChild('createCustomerModal') createCustomerModal!: TemplateRef<any>;
  @ViewChild('createSupplierModal') createSupplierModal!: TemplateRef<any>;
  requestDataUser: UserManagementCreateAppUserModelRequest = {
    role: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    fullName: '',
    site: '',
  };
  requestDataCustomer: UserManagementCreateCustomerModelRequest = {
    firstName: '',
    lastName: '',
    fullName: '',
    address: '',
    city: '',
    phoneNumber: '',
    postalCode: '',
    notes: '',
  };
  requestDataSupplier: UserManagementCreateSupplierModelRequest = {
    name: '',
    description: '',
    country: '',
    address: '',
    city: '',
    phoneNumber: '',
    postalCode: '',
  };

  siteList: SiteAllListResponse;

  constructor(
    private userManagementService: UserManagementService,
    private siteService: SiteService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.inquiryAppUser();
    this.errorMessage = '';
  }

  ngOnDestroy(): void {
    this.inquiryAppUser$?.unsubscribe();
    this.inquirySupplier$?.unsubscribe();
    this.inquiryCustomer$?.unsubscribe();
  }

  createNew(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    if (!this.isEditMode) {
      // Reset form data when creating new
      this.resetForm();
    }
    this.modalRef = this.modalService.show(template);
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.hide();
      this.resetForm();
    }
  }

  setActiveTab(tab: UserManagementDictionaryEnum) {
    this.activeTab = tab;
    if (tab === UserManagementDictionaryEnum.Customer) {
      this.inquiryCustomer();
    } else if (tab === UserManagementDictionaryEnum.AppUser) {
      this.inquiryAppUser();
    } else if (tab === UserManagementDictionaryEnum.Supplier) {
      this.inquirySupplier();
    }
  }

  inquiryAppUser() {
    this.errorMessage = '';
    this.isLoading = true;
    this.inquiryAppUser$ = this.userManagementService
      .inquiryAppUser()
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.appUsers = data.appUsers;
        },
        error: ({ message }) => {
          this.isLoading = false;
          this.errorMessage = message;
        },
      });
  }

  inquirySupplier() {
    this.errorMessage = '';
    this.isLoading = true;
    this.inquirySupplier$ = this.userManagementService
      .inquirySupplier()
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.suppliers = data.suppliers;
        },
        error: ({ message }) => {
          this.isLoading = false;
          this.errorMessage = message;
        },
      });
  }

  inquiryCustomer() {
    this.errorMessage = '';
    this.isLoading = true;
    this.inquiryCustomer$ = this.userManagementService
      .inquiryCustomer()
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.customers = data.customers;
        },
        error: ({ message }) => {
          this.isLoading = false;
          this.errorMessage = message;
        },
      });
  }

  inquirySiteForFilter() {
    this.siteService.getSiteForFilter().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.siteList = response;
      },
      error: ({ message }) => {
        this.isLoading = false;
        this.errorMessage = message;
      },
    });
  }

  refreshTable(): void {
    if (this.activeTab === UserManagementDictionaryEnum.AppUser) {
      this.inquiryAppUser();
    } else if (this.activeTab === UserManagementDictionaryEnum.Customer) {
      this.inquiryCustomer();
    } else if (this.activeTab === UserManagementDictionaryEnum.Supplier) {
      this.inquirySupplier();
    }
  }

  createEditUser(): void {
    this.errorMessageCreateAppUser = '';
    this.errorMessage = '';
    this.isLoading = true;
    if (!this.isEditMode) {
      this.userManagementService.createAppUser(this.requestDataUser).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.refreshTable();
          this.closeModal();
          this.resetForm();
          this.errorMessage = data;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessageCreateAppUser = error.message || 'An error occurred';
        },
      });
    } else {
      this.userManagementService.editAppUser(this.requestDataUser).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.refreshTable();
          this.closeModal();
          this.resetForm();
          this.errorMessage = data;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessageCreateAppUser = error.message || 'An error occurred';
        },
      });
    }
  }

  createEditCustomer(): void {
    this.errorMessage = '';
    this.errorMessageCreateCustomer = '';
    this.isLoading = true;

    if (!this.isEditMode) {
      this.userManagementService
        .createCustomer(this.requestDataCustomer)
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            this.refreshTable();
            this.closeModal();
            this.resetForm();
            this.errorMessage = data;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessageCreateCustomer = error.message || 'An error occurred';
          },
        });
    } else {
      this.userManagementService
        .editCustomer(this.requestDataCustomer)
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            this.refreshTable();
            this.closeModal();
            this.resetForm();
            this.errorMessage = data;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessageCreateCustomer = error.message || 'An error occurred';
          },
        });
    }
  }

  createEditSupplier(): void {
    this.errorMessageCreateSupplier = '';
    this.errorMessage = '';
    this.isLoading = true;

    if (!this.isEditMode) {
      this.userManagementService
        .createSupplier(this.requestDataSupplier)
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            this.refreshTable();
            this.closeModal();
            this.resetForm();
            this.errorMessage = data;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessageCreateSupplier = error.message || 'An error occurred';
          },
        });
    } else {
      this.userManagementService
        .editSupplier(this.requestDataSupplier)
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            this.refreshTable();
            this.closeModal();
            this.resetForm();
            this.errorMessage = data;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessageCreateSupplier = error.message || 'An error occurred';
          },
        });
    }
  }

  editUser(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.userManagementService.editAppUser(this.requestDataUser).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.refreshTable();
        this.closeModal();
        this.resetForm();
        this.errorMessage = data;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'An error occurred';
      },
    });
  }

  editCustomer(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.userManagementService
      .editCustomer(this.requestDataCustomer)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.refreshTable();
          this.closeModal();
          this.resetForm();
          this.errorMessage = data;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'An error occurred';
        },
      });
  }

  editSupplier(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.userManagementService
      .editSupplier(this.requestDataSupplier)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.refreshTable();
          this.closeModal();
          this.resetForm();
          this.errorMessage = data;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'An error occurred';
        },
      });
  }

  onUserFormDataChange(updatedData: UserManagementCreateAppUserModelRequest) {
    this.requestDataUser = { ...this.requestDataUser, ...updatedData };
  }

  onCustomerFormDataChange(
    updatedData: UserManagementCreateCustomerModelRequest
  ) {
    this.requestDataCustomer = { ...this.requestDataCustomer, ...updatedData };
  }

  onSupplierFormDataChange(
    updatedData: UserManagementCreateSupplierModelRequest
  ) {
    this.requestDataSupplier = { ...this.requestDataSupplier, ...updatedData };
  }

  onUserFormValidityChange(isValid: boolean) {
    this.isUserFormValid = isValid;
  }

  onCustomerFormValidityChange(isValid: boolean) {
    this.isCustomerFormValid = isValid;
  }

  onSupplierFormValidityChange(isValid: boolean) {
    this.isSupplierFormValid = isValid;
  }

  createModalUser(user: any): void {
    this.isEditMode = true;
    this.selectedUser = user;

    if (this.activeTab === UserManagementDictionaryEnum.AppUser) {
      this.requestDataUser = {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password,
        fullName: user.fullName,
        site: user.site,
      };
      this.openModal(this.createUserModal);
    } else if (this.activeTab === UserManagementDictionaryEnum.Customer) {
      this.requestDataCustomer = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        address: user.address,
        city: user.city,
        phoneNumber: user.phoneNumber,
        postalCode: user.postalCode,
        notes: user.notes,
      };
      this.openModal(this.createCustomerModal);
    } else if (this.activeTab === UserManagementDictionaryEnum.Supplier) {
      this.requestDataSupplier = {
        id: user.id,
        name: user.name,
        description: user.description,
        country: user.country,
        address: user.address,
        city: user.city,
        phoneNumber: user.phoneNumber,
        postalCode: user.postalCode,
      };
      this.openModal(this.createSupplierModal);
    }
  }

  deleteUser() {
    this.refreshTable();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedUser = null;

    // Reset form data
    this.requestDataUser = {
      role: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      fullName: '',
      site: '',
    };

    this.requestDataCustomer = {
      firstName: '',
      lastName: '',
      fullName: '',
      address: '',
      city: '',
      phoneNumber: '',
      postalCode: '',
      notes: '',
    };

    this.requestDataSupplier = {
      name: '',
      description: '',
      country: '',
      address: '',
      city: '',
      phoneNumber: '',
      postalCode: '',
    };
  }
}
