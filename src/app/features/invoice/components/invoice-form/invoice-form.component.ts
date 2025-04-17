import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductForInvoice } from '@models/invoice.model';
import { SiteService } from '@services/site.service';
import { UserManagementService } from '@services/user-management.service';
import { InvoiceService } from '@services/invoice.service';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';
import { LineItemData, expandMultiSelectLineItems } from '@models/line-item-extensions';

export interface InvoiceFormData {
  customerId: string;
  siteId: string;
  dueDate: string;
  notes?: string;
  status?: 'PENDING' | 'PAID' | 'CANCELLED';
  lineItems: LineItemData[];
}

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() invoiceNumber: string = '';
  @Input() initialData: InvoiceFormData | null = null;

  @Output() formSubmit = new EventEmitter<InvoiceFormData>();
  @Output() cancel = new EventEmitter<void>();

  invoiceForm: FormGroup;
  customers: Customer[] = [];
  sites: SiteOverviewList[] = [];
  products: ProductForInvoice[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';
  lineItemArray: LineItemData[] = [];

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private userManagementService: UserManagementService,
    private siteService: SiteService
  ) {
    // Initialize form
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      siteId: ['', Validators.required],
      dueDate: ['', Validators.required],
      notes: [''],
      status: [{ value: 'PENDING', disabled: !this.isEditMode }]
    });
  }

  ngOnInit(): void {
    // Load data for dropdowns
    this.loadCustomers();
    this.loadSites();

    // If editing an existing invoice
    if (this.isEditMode && this.initialData) {
      this.patchForm();
    }

    // Handle site change
    this.invoiceForm.get('siteId')?.valueChanges.subscribe(siteId => {
      if (siteId) {
        this.loadProductsForSite(siteId);
      }
    });
  }

  private patchForm(): void {
    if (this.initialData) {
      // Patch main form fields
      this.invoiceForm.patchValue({
        customerId: this.initialData.customerId,
        siteId: this.initialData.siteId,
        dueDate: this.initialData.dueDate,
        notes: this.initialData.notes,
        status: this.initialData.status || 'PENDING'
      });

      // Enable status field in edit mode
      this.invoiceForm.get('status')?.enable();

      // Add line items
      if (this.initialData.lineItems && this.initialData.lineItems.length > 0) {
        // Clear existing line items
        this.lineItemArray = [];

        // Set line items
        this.lineItemArray = [...this.initialData.lineItems];

        // Load products for the site
        this.loadProductsForSite(this.initialData.siteId);
      }
    }
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.userManagementService.inquiryCustomer().subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load customers';
        this.isLoading = false;
      }
    });
  }

  loadSites(): void {
    this.isLoading = true;
    this.siteService.getSiteForFilter().subscribe({
      next: (response) => {
        this.sites = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load sites';
        this.isLoading = false;
      }
    });
  }

  loadProductsForSite(siteId: string): void {
    this.isLoading = true;
    this.invoiceService.getProductListForInvoice(siteId).subscribe({
      next: (response) => {
        this.products = response.productList.products;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  addLineItem(): void {
    this.lineItemArray.push({
      stockId: '',
      productId: '',
      bigPackageNumber: '',
      smallPackageId: '',
      unitAmount: 0,
      unitPrice: 0,
      // Initialize empty selected packages array for multi-select support
      _selectedSmallPackages: []
    });
  }

  removeLineItem(index: number): void {
    this.lineItemArray.splice(index, 1);
  }

  updateLineItem(lineItem: LineItemData, index: number): void {
    this.lineItemArray[index] = lineItem;
  }

  getTotalPrice(): number {
    return this.lineItemArray.reduce((total, item) => {
      const lineTotal = (item.unitAmount || 0) * (item.unitPrice || 0);
      return total + lineTotal;
    }, 0);
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.markFormGroupTouched(this.invoiceForm);
      return;
    }

    if (this.lineItemArray.length === 0) {
      this.errorMessage = 'At least one line item is required';
      return;
    }

    const formValue = this.invoiceForm.getRawValue();

    // Process multi-selected small packages if needed
    const processedLineItems = expandMultiSelectLineItems(this.lineItemArray);

    const invoiceData: InvoiceFormData = {
      customerId: formValue.customerId,
      siteId: formValue.siteId,
      dueDate: formValue.dueDate,
      notes: formValue.notes,
      status: this.isEditMode ? formValue.status : 'PENDING',
      lineItems: processedLineItems
    };

    this.formSubmit.emit(invoiceData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Method to check if the entire form is valid including line items
  isFormValid(): boolean {
    if (!this.invoiceForm.valid) return false;
    if (this.lineItemArray.length === 0) return false;

    // Check if all line items are complete
    return this.lineItemArray.every(item => 
      item.productId &&
      item.bigPackageNumber &&
      (item.smallPackageId || (item._selectedSmallPackages && item._selectedSmallPackages.length > 0)) &&
      item.unitAmount > 0
    );
  }
}