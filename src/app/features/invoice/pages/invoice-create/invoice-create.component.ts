/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';
import { ProductForInvoice } from '@models/invoice.model';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { InvoiceService } from '@services/invoice.service';

interface LineItem {
  stockId: string;
  productId: string;
  bigPackageNumber: string;
  smallPackageId: string;
  unitAmount: number;
  unitPrice: number;
  productName?: string;
  type?: string;
  sizeDescription?: string;
}

@Component({
  selector: 'app-invoice-create',
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.scss']
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm: FormGroup;
  isEditMode = false;
  invoiceNumber: string = '';
  isLoading = false;
  error: string = '';

  // Data for dropdowns
  customers: Customer[] = [];
  sites: SiteOverviewList[] = [];
  products: ProductForInvoice[] = [];

  // Line items
  lineItems: LineItem[] = [];

  // Selected product cache for each line item
  selectedProducts: { [index: number]: ProductForInvoice | null } = {};
  selectedBigPackages: { [index: number]: any | null } = {};
  selectedSmallPackages: { [index: number]: any | null } = {};

  breadcrumbs = [
    { label: 'Invoices', url: '/invoice' },
    { label: 'Create Invoice' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private userManagementService: UserManagementService,
    private siteService: SiteService
  ) {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      siteId: ['', Validators.required],
      dueDate: ['', Validators.required],
      notes: [''],
      status: ['PENDING']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadSites();

    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.invoiceNumber = id;
        this.breadcrumbs[1].label = 'Edit Invoice';
        this.loadInvoiceForEdit();
      }
    });

    // Handle site change to load products
    this.invoiceForm.get('siteId')?.valueChanges.subscribe(siteId => {
      if (siteId) {
        this.loadProducts(siteId);
      }
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.userManagementService.inquiryCustomer().subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load customers';
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
        this.error = error.message || 'Failed to load sites';
        this.isLoading = false;
      }
    });
  }

  loadProducts(siteId: string): void {
    this.isLoading = true;
    this.invoiceService.getProductListForInvoice(siteId).subscribe({
      next: (response) => {
        this.products = response.productList.products;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  loadInvoiceForEdit(): void {
    this.isLoading = true;
    this.invoiceService.getInvoiceById(this.invoiceNumber).subscribe({
      next: (response) => {
        const invoice = response.invoice;

        // Set form values
        this.invoiceForm.patchValue({
          customerId: invoice.customerId,
          siteId: invoice.siteId,
          dueDate: this.formatDateForInput(invoice.dueDate),
          notes: invoice.notes,
          status: invoice.status
        });

        // Load products for the site
        this.loadProducts(invoice.siteId);

        // Set line items
        this.lineItems = invoice.lineItems.map(item => ({
          stockId: item.stockId,
          productId: item.productId,
          bigPackageNumber: item.bigPackageNumber,
          smallPackageId: item.smallPackageId,
          unitAmount: item.unitAmount,
          unitPrice: item.unitPrice,
          productName: item.productName,
          type: item.type,
          sizeDescription: item.sizeDescription
        }));

        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load invoice data';
        this.isLoading = false;
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  addLineItem(): void {
    this.lineItems.push({
      stockId: '',
      productId: '',
      bigPackageNumber: '',
      smallPackageId: '',
      unitAmount: 0,
      unitPrice: 0
    });
  }

  removeLineItem(index: number): void {
    this.lineItems.splice(index, 1);
    // Clean up caches
    delete this.selectedProducts[index];
    delete this.selectedBigPackages[index];
    delete this.selectedSmallPackages[index];
  }

  onProductSelected(index: number): void {
    const productId = this.lineItems[index].productId;
    this.selectedProducts[index] = this.products.find(p => p.productId === productId) || null;

    if (this.selectedProducts[index]) {
      // Update stockId and clear other selections
      this.lineItems[index].stockId = this.selectedProducts[index]!.stockId;
      this.lineItems[index].bigPackageNumber = '';
      this.lineItems[index].smallPackageId = '';
      this.lineItems[index].productName = this.selectedProducts[index]!.productName;
      this.lineItems[index].type = this.selectedProducts[index]!.type;

      // Set unit price from product
      this.lineItems[index].unitPrice = this.selectedProducts[index]!.price;

      // Clear cached selections
      this.selectedBigPackages[index] = null;
      this.selectedSmallPackages[index] = null;
    }
  }

  onBigPackageSelected(index: number): void {
    if (!this.selectedProducts[index]) return;

    const packageNumber = this.lineItems[index].bigPackageNumber;
    this.selectedBigPackages[index] = this.selectedProducts[index]!.bigPackages.find(
      bp => bp.packageNumber === packageNumber
    ) || null;

    if (this.selectedBigPackages[index]) {
      // Clear small package selection
      this.lineItems[index].smallPackageId = '';
      this.selectedSmallPackages[index] = null;
    }
  }

  onSmallPackageSelected(index: number): void {
    if (!this.selectedBigPackages[index]) return;

    const packageId = this.lineItems[index].smallPackageId;
    this.selectedSmallPackages[index] = this.selectedBigPackages[index]!.smallPackages.find(
      (sp: { packageId: string }) => sp.packageId === packageId
    ) || null;

    if (this.selectedSmallPackages[index]) {
      // Set the unit amount to the available size amount
      this.lineItems[index].unitAmount = this.selectedSmallPackages[index]!.sizeAmount;
      this.lineItems[index].sizeDescription = this.selectedSmallPackages[index]!.sizeDescription;
    }
  }

  getBigPackages(index: number): any[] {
    return this.selectedProducts[index]?.bigPackages || [];
  }

  getSmallPackages(index: number): any[] {
    return this.selectedBigPackages[index]?.smallPackages.filter((sp: any) => sp.isOpen) || [];
  }

  getLineItemTotal(index: number): number {
    return (this.lineItems[index].unitAmount || 0) * (this.lineItems[index].unitPrice || 0);
  }

  getInvoiceTotal(): number {
    return this.lineItems.reduce((total, item) => {
      const lineTotal = (item.unitAmount || 0) * (item.unitPrice || 0);
      return total + lineTotal;
    }, 0);
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      // Mark all controls as touched to trigger validation messages
      Object.keys(this.invoiceForm.controls).forEach(key => {
        this.invoiceForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.lineItems.length === 0) {
      this.error = 'At least one line item is required';
      return;
    }

    const formValue = this.invoiceForm.value;

    if (this.isEditMode) {
      // Update existing invoice
      const updateData = {
        invoiceNumber: this.invoiceNumber,
        customerId: formValue.customerId,
        siteId: formValue.siteId,
        dueDate: formValue.dueDate,
        notes: formValue.notes,
        status: formValue.status,
        changedBy: localStorage.getItem('username') || 'admin'
      };

      this.isLoading = true;
      this.invoiceService.updateInvoice(updateData).subscribe({
        next: () => {
          this.router.navigate(['/invoice/detail', this.invoiceNumber]);
        },
        error: (error) => {
          this.error = error.message || 'Error updating invoice';
          this.isLoading = false;
        }
      });
    } else {
      // Create new invoice
      const createData = {
        customerId: formValue.customerId,
        siteId: formValue.siteId,
        dueDate: formValue.dueDate,
        notes: formValue.notes,
        lineItems: this.lineItems.map(item => ({
          stockId: item.stockId,
          productId: item.productId,
          bigPackageNumber: item.bigPackageNumber,
          smallPackageId: item.smallPackageId,
          unitAmount: item.unitAmount,
          unitPrice: item.unitPrice
        })),
        createdBy: localStorage.getItem('username') || 'admin'
      };

      this.isLoading = true;
      this.invoiceService.createInvoice(createData).subscribe({
        next: (response) => {
          // Navigate to the detail page of the new invoice
          this.router.navigate(['/invoice']);
        },
        error: (error) => {
          this.error = error.message || 'Error creating invoice';
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/invoice/detail', this.invoiceNumber]);
    } else {
      this.router.navigate(['/invoice']);
    }
  }

  isFormValid(): boolean {
    if (!this.invoiceForm.valid) return false;

    if (this.lineItems.length === 0) return false;

    // Check if all line items are complete
    return this.lineItems.every(item =>
      item.productId &&
      item.bigPackageNumber &&
      item.smallPackageId &&
      item.unitAmount > 0
    );
  }
}
