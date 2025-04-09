// user-management-index.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { UserManagementDictionaryEnum } from '@cores/enums/custom-variable.enum';

// Declare Bootstrap for TypeScript
declare var bootstrap: any;

@Component({
  selector: 'app-user-management-index',
  templateUrl: './user-management-index.component.html',
  styleUrls: ['./user-management-index.component.scss'],
})
export class UserManagementIndexComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // Tab management
  activeTab = UserManagementDictionaryEnum.AppUser;
  _enumAppUser = UserManagementDictionaryEnum.AppUser;
  _enumCustomer = UserManagementDictionaryEnum.Customer;
  _enumSupplier = UserManagementDictionaryEnum.Supplier;

  // Modal instances
  private userModal: any;
  private customerModal: any;
  private supplierModal: any;

  // Data states
  isLoading = false;
  isEditMode = false;
  errorMessage = '';
  errorMessageCreateAppUser = '';
  errorMessageCreateCustomer = '';
  errorMessageCreateSupplier = '';

  // Form validation states
  isUserFormValid = false;
  isCustomerFormValid = false;
  isSupplierFormValid = false;

  // Data lists
  appUsers: any[] = [];
  customers: any[] = [];
  suppliers: any[] = [];

  // Request data objects
  requestDataUser: any = {};
  requestDataCustomer: any = {};
  requestDataSupplier: any = {};

  constructor(
    private userManagementService: UserManagementService,
    private siteService: SiteService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    this.initModals();
  }

  private loadInitialData(): void {
    this.inquiryAppUser();
  }

  private initModals(): void {
    // Initialize Bootstrap modals
    const userModalEl = document.getElementById('userFormModal');
    const customerModalEl = document.getElementById('customerFormModal');
    const supplierModalEl = document.getElementById('supplierFormModal');

    if (userModalEl) {
      this.userModal = new bootstrap.Modal(userModalEl);
      // Add event listener for modal closing
      userModalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
        this.changeDetectorRef.detectChanges();
      });
    }

    if (customerModalEl) {
      this.customerModal = new bootstrap.Modal(customerModalEl);
      customerModalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
        this.changeDetectorRef.detectChanges();
      });
    }

    if (supplierModalEl) {
      this.supplierModal = new bootstrap.Modal(supplierModalEl);
      supplierModalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  // TAB MANAGEMENT
  setActiveTab(tab: UserManagementDictionaryEnum): void {
    this.activeTab = tab;

    // Load data based on active tab
    if (tab === UserManagementDictionaryEnum.AppUser) {
      this.inquiryAppUser();
    } else if (tab === UserManagementDictionaryEnum.Customer) {
      this.inquiryCustomer();
    } else if (tab === UserManagementDictionaryEnum.Supplier) {
      this.inquirySupplier();
    }
  }

  // DATA LOADING METHODS
  inquiryAppUser(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userManagementService.inquiryAppUser().subscribe({
      next: (response) => {
        this.appUsers = response.appUsers;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load users';
        this.isLoading = false;
      },
    });
  }

  inquiryCustomer(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userManagementService.inquiryCustomer().subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load customers';
        this.isLoading = false;
      },
    });
  }

  inquirySupplier(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userManagementService.inquirySupplier().subscribe({
      next: (response) => {
        this.suppliers = response.suppliers;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load suppliers';
        this.isLoading = false;
      },
    });
  }

  // FORM HANDLING METHODS
  resetForm(): void {
    // Reset user form data
    this.requestDataUser = {
      role: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      fullName: '',
      site: '',
    };

    // Reset customer form data
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

    // Reset supplier form data
    this.requestDataSupplier = {
      name: '',
      description: '',
      country: '',
      address: '',
      city: '',
      phoneNumber: '',
      postalCode: '',
    };

    // Reset form states
    this.isUserFormValid = false;
    this.isCustomerFormValid = false;
    this.isSupplierFormValid = false;

    // Reset errors
    this.errorMessageCreateAppUser = '';
    this.errorMessageCreateCustomer = '';
    this.errorMessageCreateSupplier = '';
  }

  // MODAL ACTIONS
  createNew(): void {
    this.isEditMode = false;
    this.resetForm();

    // Force a clean state and change detection before showing modal
    this.changeDetectorRef.detectChanges();

    if (this.activeTab === UserManagementDictionaryEnum.AppUser) {
      setTimeout(() => this.userModal?.show(), 0);
    } else if (this.activeTab === UserManagementDictionaryEnum.Customer) {
      setTimeout(() => this.customerModal?.show(), 0);
    } else if (this.activeTab === UserManagementDictionaryEnum.Supplier) {
      setTimeout(() => this.supplierModal?.show(), 0);
    }
  }

  createModalUser(user: any): void {
    if (this.userModal) {
      this.userModal.hide();
    }
    this.isEditMode = true;
    this.errorMessageCreateAppUser = '';

    if (this.activeTab === UserManagementDictionaryEnum.AppUser) {
      this.requestDataUser = {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: '',
        fullName: user.fullName,
        site: user.site,
      };

      // Force change detection to update bindings
      this.changeDetectorRef.detectChanges();

      // Force data binding to complete
      setTimeout(() => {
        this.userModal?.show();
      }, 0);
    } else if (this.activeTab === UserManagementDictionaryEnum.Customer) {
      // Set customer data
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

      // Force change detection to update bindings
      this.changeDetectorRef.detectChanges();

      setTimeout(() => {
        this.customerModal?.show();
      }, 0);
    } else if (this.activeTab === UserManagementDictionaryEnum.Supplier) {
      // Set supplier data
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

      // Force change detection to update bindings
      this.changeDetectorRef.detectChanges();

      setTimeout(() => {
        this.supplierModal?.show();
      }, 0);
    }
  }

  // FORM DATA CHANGE HANDLERS
  onUserFormDataChange(data: any): void {
    this.requestDataUser = data;
  }

  onCustomerFormDataChange(data: any): void {
    this.requestDataCustomer = data;
  }

  onSupplierFormDataChange(data: any): void {
    this.requestDataSupplier = data;
  }

  onUserFormValidityChange(isValid: boolean): void {
    console.log('Form validity changed:', isValid);
    this.isUserFormValid = isValid;
  }
  onCustomerFormValidityChange(isValid: boolean): void {
    this.isCustomerFormValid = isValid;
  }

  onSupplierFormValidityChange(isValid: boolean): void {
    this.isSupplierFormValid = isValid;
  }

  // SAVE OPERATIONS
  saveUser(): void {
    this.createEditUser();
  }

  saveCustomer(): void {
    this.createEditCustomer();
  }

  saveSupplier(): void {
    this.createEditSupplier();
  }

  // CREATE/EDIT OPERATIONS
  createEditUser(): void {
    this.errorMessageCreateAppUser = '';
    this.errorMessage = '';
    this.isLoading = true;

    // If in edit mode and password field is not visible or empty, remove it from request
    if (this.isEditMode) {
      // Only include password if it has a value
      if (!this.requestDataUser.password) {
        const requestWithoutPassword = { ...this.requestDataUser };
        delete requestWithoutPassword.password;

        this.userManagementService
          .editAppUser(requestWithoutPassword)
          .subscribe({
            next: (data) => {
              this.isLoading = false;
              // Use the proper method to refresh data
              this.inquiryAppUser();
              this.userModal?.hide();
              this.resetForm();
              this.errorMessage = data;
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessageCreateAppUser =
                error.message || 'An error occurred';
            },
          });
      } else {
        // If password is provided, use the full request
        this.userManagementService.editAppUser(this.requestDataUser).subscribe({
          next: (data) => {
            this.isLoading = false;
            this.inquiryAppUser();
            this.userModal?.hide();
            this.resetForm();
            this.errorMessage = data;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessageCreateAppUser =
              error.message || 'An error occurred';
          },
        });
      }
    } else {
      // Create new user with full request
      this.userManagementService.createAppUser(this.requestDataUser).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.inquiryAppUser();
          this.userModal?.hide();
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
    this.isLoading = true;
    this.errorMessageCreateCustomer = '';
    this.errorMessage = '';

    const operation = this.isEditMode
      ? this.userManagementService.editCustomer(this.requestDataCustomer)
      : this.userManagementService.createCustomer(this.requestDataCustomer);

    operation.subscribe({
      next: (response) => {
        // Success handling
        this.isLoading = false;
        this.customerModal?.hide();
        this.resetForm();
        this.inquiryCustomer();

        // Display success message
        this.errorMessage = response; // This should be the success message from API

        // You can also add a temporary success alert
        const alertContainer = document.querySelector('.alert-container');
        if (alertContainer) {
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            ${this.isEditMode ? 'Customer updated successfully!' : 'New customer created successfully!'}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
          alertContainer.appendChild(successAlert);

          // Auto-remove after 5 seconds
          setTimeout(() => {
            successAlert.remove();
          }, 5000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessageCreateCustomer = error.message || 'An error occurred';
      },
    });
  }

  createEditSupplier(): void {
    this.isLoading = true;
    this.errorMessageCreateSupplier = '';
    this.errorMessage = '';

    const operation = this.isEditMode
      ? this.userManagementService.editSupplier(this.requestDataSupplier)
      : this.userManagementService.createSupplier(this.requestDataSupplier);

    operation.subscribe({
      next: (response) => {
        // Success handling
        this.isLoading = false;
        this.supplierModal?.hide();
        this.resetForm();
        this.inquirySupplier();

        // Display success message
        this.errorMessage = response; // This should be the success message from API

        // You can also add a temporary success alert
        const alertContainer = document.querySelector('.alert-container');
        if (alertContainer) {
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            ${this.isEditMode ? 'Supplier updated successfully!' : 'New supplier created successfully!'}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
          alertContainer.appendChild(successAlert);

          // Auto-remove after 5 seconds
          setTimeout(() => {
            successAlert.remove();
          }, 5000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessageCreateSupplier = error.message || 'An error occurred';
      },
    });
  }

  // DELETE OPERATIONS
  deleteUser(): void {
    // Refresh data after delete
    if (this.activeTab === UserManagementDictionaryEnum.AppUser) {
      this.inquiryAppUser();
    } else if (this.activeTab === UserManagementDictionaryEnum.Customer) {
      this.inquiryCustomer();
    } else if (this.activeTab === UserManagementDictionaryEnum.Supplier) {
      this.inquirySupplier();
    }
  }

  ngOnDestroy(): void {
    // Clean up resources
  }

  closeAndResetModal(): void {
    // Hide all modals
    this.userModal?.hide();
    this.customerModal?.hide();
    this.supplierModal?.hide();

    // Reset form data
    this.resetForm();

    // Force change detection
    this.changeDetectorRef.detectChanges();
  }
}
