import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';
import { ProductForInvoice } from '@models/invoice.model';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { InvoiceService } from '@services/invoice.service';
import { MultiSelectOption } from 'src/app/shared-components/multi-select-dropdown/multi-select-dropdown.component';
import { LineItemData } from '@models/line-item-extensions';


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
  lineItems: LineItemData[] = [];

  // Selected product cache for each line item
  selectedProducts: { [index: number]: ProductForInvoice | null } = {};
  selectedBigPackages: { [index: number]: any | null } = {};

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
        this.invoiceService.getProductListForInvoice(invoice.siteId).subscribe({
          next: (productsResponse) => {
            this.products = productsResponse.productList.products;

            // Set line items and initialize _selectedSmallPackages
            this.lineItems = invoice.lineItems.map(item => {
              // Find the product for this line item
              const product = this.products.find(p => p.productId === item.productId);

              return {
                stockId: item.stockId,
                productId: item.productId,
                bigPackageNumber: item.bigPackageNumber,
                smallPackageId: item.smallPackageId,
                unitAmount: item.unitAmount,
                unitPrice: item.unitPrice,
                productName: item.productName,
                type: item.type,
                sizeDescription: item.sizeDescription,
                _selectedSmallPackages: item.smallPackageId ? [item.smallPackageId] : [],
                _bigPackageInfo: product ?
                  product.bigPackages.find(bp => bp.packageNumber === item.bigPackageNumber)
                  : null
              };
            });

            // Setup product and package selections for each line item
            this.lineItems.forEach((lineItem, index) => {
              this.onProductSelected(index);
              this.onBigPackageSelected(index);
            });

            this.isLoading = false;
          },
          error: (error) => {
            this.error = 'Failed to load products for the site';
            this.isLoading = false;
          }
        });
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
      unitPrice: 0,
      _selectedSmallPackages: []
    });
  }

  removeLineItem(index: number): void {
    this.lineItems.splice(index, 1);
    // Clean up caches
    delete this.selectedProducts[index];
    delete this.selectedBigPackages[index];
  }

  onProductSelected(index: number): void {
    const productId = this.lineItems[index].productId;
    const selectedProduct = this.products.find(p => p.productId === productId);

    if (selectedProduct) {
      this.selectedProducts[index] = selectedProduct;

      // Update line item details
      this.lineItems[index].stockId = selectedProduct.stockId;
      this.lineItems[index].productName = selectedProduct.productName;
      this.lineItems[index].type = selectedProduct.type;

      // Update big package info
      this.selectedBigPackages[index] = this.lineItems[index]._bigPackageInfo || null;

      // Set unit price from product
      this.lineItems[index].unitPrice = selectedProduct.price;
    }
  }

  onBigPackageSelected(index: number): void {
    const product = this.selectedProducts[index];
    const packageNumber = this.lineItems[index].bigPackageNumber;

    if (product) {
      const selectedBigPackage = product.bigPackages.find(
        bp => bp.packageNumber === packageNumber
      );

      if (selectedBigPackage) {
        this.selectedBigPackages[index] = selectedBigPackage;

        // Reset small package selection
        this.lineItems[index].smallPackageId =
          this.lineItems[index]._selectedSmallPackages?.[0] || '';

        // Update unit amount and size description based on selected small package
        if (this.lineItems[index]._selectedSmallPackages?.length) {
          const smallPackage = selectedBigPackage.smallPackages.find(
            sp => sp.packageId === this.lineItems[index].smallPackageId
          );

          if (smallPackage) {
            this.lineItems[index].unitAmount = smallPackage.sizeAmount;
            this.lineItems[index].sizeDescription = smallPackage.sizeDescription;
          }
        }
      }
    }
  }

  onSmallPackageSelected(index: number): void {
    if (!this.selectedBigPackages[index]) return;

    const packageId = this.lineItems[index].smallPackageId;
    const smallPackage = this.selectedBigPackages[index].smallPackages.find(
      (sp: { packageId: string }) => sp.packageId === packageId
    );

    if (smallPackage) {
      // Set the unit amount to the available size amount
      this.lineItems[index].unitAmount = smallPackage.sizeAmount;
      this.lineItems[index].sizeDescription = smallPackage.sizeDescription;

      // Also update the _selectedSmallPackages array for multi-select compatibility
      this.lineItems[index]._selectedSmallPackages = [packageId];
    }
  }

  // Multi-select specific methods
  // In invoice-create.component.ts

  // Updated method to filter out zero quantity packages before they reach the dropdown
  getSmallPackageOptions(index: number): MultiSelectOption[] {
    if (!this.selectedBigPackages[index]) return [];

    return this.selectedBigPackages[index].smallPackages
      // First, filter to only include open packages with size amount > 0
      .filter((sp: any) => {
        return (sp.sizeAmount > 0 || sp.quantity > 0);
      })
      // Then map to dropdown options
      .map((sp: any) => ({
        id: sp.packageId,
        label: `${sp.packageId} - ${sp.sizeAmount} ${sp.sizeDescription}`,
        selected: (this.lineItems[index]._selectedSmallPackages || []).includes(sp.packageId),
        disabled: false,
        data: {
          sizeAmount: sp.sizeAmount,
          sizeDescription: sp.sizeDescription
        }
      }));
  }

  onMultiSmallPackagesSelected(selectedOptions: MultiSelectOption[], index: number): void {
    // Get selected IDs
    const selectedIds = selectedOptions.map(option => option.id);

    // Update the lineItem
    this.lineItems[index]._selectedSmallPackages = selectedIds;

    // For compatibility, set the first one as smallPackageId
    if (selectedIds.length > 0) {
      this.lineItems[index].smallPackageId = selectedIds[0];
    } else {
      this.lineItems[index].smallPackageId = '';
    }

    // Update the unit amount
    this.updateLineItemAmount(index);
  }

  updateLineItemAmount(index: number): void {
    if (!this.selectedBigPackages[index]) return;

    let totalAmount = 0;
    const selectedIds = this.lineItems[index]._selectedSmallPackages || [];

    if (selectedIds.length > 0) {
      // Find all selected small packages
      const selectedPackages = this.selectedBigPackages[index].smallPackages
        .filter((sp: any) => selectedIds.includes(sp.packageId));

      // Sum up their size amounts
      totalAmount = selectedPackages.reduce((sum: number, sp: any) => sum + sp.sizeAmount, 0);
    }

    // Update unit amount
    this.lineItems[index].unitAmount = totalAmount;
  }

  // Standard methods
  getBigPackages(index: number): any[] {
    return this.selectedProducts[index]?.bigPackages || [];
  }

  getSmallPackages(index: number): any[] {
    return this.selectedBigPackages[index]?.smallPackages || [];
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

  // Check if a small package is invalid (for template binding)
  isSmallPackageInvalid(index: number): boolean {
    return !this.lineItems[index].smallPackageId && !!this.lineItems[index].bigPackageNumber;
  }

// Correct onSubmit method that includes line items in update requests

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
    // Process multi-selected small packages before submitting
    const expandedLineItems = this.expandMultiSelectedPackages();

    // Update existing invoice - NOW INCLUDES LINE ITEMS as per API documentation
    const updateData = {
      invoiceNumber: this.invoiceNumber,
      customerId: formValue.customerId,
      siteId: formValue.siteId,
      dueDate: formValue.dueDate,
      notes: formValue.notes,
      status: formValue.status,
      lineItems: expandedLineItems, // Include line items in update request
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
    // Create new invoice logic remains the same
    const expandedLineItems = this.expandMultiSelectedPackages();

    const createData = {
      customerId: formValue.customerId,
      siteId: formValue.siteId,
      dueDate: formValue.dueDate,
      notes: formValue.notes,
      lineItems: expandedLineItems,
      createdBy: localStorage.getItem('username') || 'admin'
    };

    this.isLoading = true;
    this.invoiceService.createInvoice(createData).subscribe({
      next: () => {
        this.router.navigate(['/invoice']);
      },
      error: (error) => {
        this.error = error.message || 'Error creating invoice';
        this.isLoading = false;
      }
    });
  }
}

// Expand multi-selected small packages into individual line items
expandMultiSelectedPackages(): any[] {
  return this.lineItems.flatMap(item => {
    const selectedPackages = item._selectedSmallPackages || [];

    if (selectedPackages.length > 1) {
      // Create a separate line item for each selected package
      return selectedPackages.map(packageId => {
        // Find the small package to get its size amount
        const smallPackage = this.findSmallPackageById(item.productId, item.bigPackageNumber, packageId);
        const sizeAmount = smallPackage ? smallPackage.sizeAmount :
          (item.unitAmount / selectedPackages.length);

        return {
          // DON'T include lineItemId - the API doesn't expect it
          stockId: item.stockId,
          productId: item.productId,
          bigPackageNumber: item.bigPackageNumber,
          smallPackageId: packageId,
          unitAmount: sizeAmount,
          unitPrice: item.unitPrice
        };
      });
    } else {
      // If there's only one or no selected packages, return the original
      return [{
        // DON'T include lineItemId - the API doesn't expect it
        stockId: item.stockId,
        productId: item.productId,
        bigPackageNumber: item.bigPackageNumber,
        smallPackageId: item.smallPackageId,
        unitAmount: item.unitAmount,
        unitPrice: item.unitPrice
      }];
    }
  });
}

  // Helper method to find a small package by ID
  findSmallPackageById(productId: string, bigPackageNumber: string, smallPackageId: string): any {
    const product = this.products.find(p => p.productId === productId);
    if (!product) return null;

    const bigPackage = product.bigPackages.find(bp => bp.packageNumber === bigPackageNumber);
    if (!bigPackage) return null;

    return bigPackage.smallPackages.find(sp => sp.packageId === smallPackageId);
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
