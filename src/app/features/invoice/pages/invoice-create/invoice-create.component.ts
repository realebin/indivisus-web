import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';
import { ProductForInvoice } from '@models/invoice.model';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { InvoiceService } from '@services/invoice.service';
import { PackageSelectionService } from '@services/package-selection.service';
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
    private siteService: SiteService,
    private packageSelectionService: PackageSelectionService
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

  // Helper methods to check if packages are already selected
  isBigPackageSelected(packageNumber: string, currentIndex: number): boolean {
    return this.packageSelectionService.isBigPackageSelected(this.lineItems, packageNumber, currentIndex);
  }

  isSmallPackageSelected(packageId: string, currentIndex: number): boolean {
    return this.packageSelectionService.isSmallPackageSelected(this.lineItems, packageId, currentIndex);
  }

  // Updated method to get big packages with availability check
  getBigPackages(index: number): any[] {
    const product = this.selectedProducts[index];
    if (!product) return [];

    return this.packageSelectionService.getAvailableBigPackages(
      product.bigPackages,
      this.lineItems,
      index
    );
  }

  // Updated method to get small package options with availability check
  getSmallPackageOptions(index: number): MultiSelectOption[] {
    if (!this.selectedBigPackages[index]) return [];

    const availablePackages = this.packageSelectionService.getAvailableSmallPackages(
      this.selectedBigPackages[index],
      this.lineItems,
      index,
      this.lineItems[index]._selectedSmallPackages || []
    );

    return availablePackages.map((sp: any) => ({
      id: sp.packageId,
      label: `${sp.packageId} - ${sp.sizeAmount} ${sp.sizeDescription}${sp.isAlreadySelected ? ' (Already Selected)' : ''}`,
      selected: (this.lineItems[index]._selectedSmallPackages || []).includes(sp.packageId),
      disabled: sp.isDisabled,
      data: {
        sizeAmount: sp.sizeAmount,
        sizeDescription: sp.sizeDescription
      }
    }));
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

  // FIXED: Enhanced removeLineItem method with proper cache cleanup
  removeLineItem(index: number): void {
    console.log('Removing line item at index:', index);

    // Remove the line item from the array
    this.lineItems.splice(index, 1);

    // Clean up caches - create new objects to avoid reference issues
    const newSelectedProducts: { [index: number]: ProductForInvoice | null } = {};
    const newSelectedBigPackages: { [index: number]: any | null } = {};

    // Rebuild caches with correct indices
    Object.keys(this.selectedProducts).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex < index) {
        // Keep items before the removed index as-is
        newSelectedProducts[oldIndex] = this.selectedProducts[oldIndex];
      } else if (oldIndex > index) {
        // Shift items after the removed index down by 1
        newSelectedProducts[oldIndex - 1] = this.selectedProducts[oldIndex];
      }
      // Skip the removed index
    });

    Object.keys(this.selectedBigPackages).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex < index) {
        // Keep items before the removed index as-is
        newSelectedBigPackages[oldIndex] = this.selectedBigPackages[oldIndex];
      } else if (oldIndex > index) {
        // Shift items after the removed index down by 1
        newSelectedBigPackages[oldIndex - 1] = this.selectedBigPackages[oldIndex];
      }
      // Skip the removed index
    });

    // Replace the old caches with the new ones
    this.selectedProducts = newSelectedProducts;
    this.selectedBigPackages = newSelectedBigPackages;

    // Force change detection to update the view
    this.triggerValidationUpdate();

    console.log('Line item removed. Remaining items:', this.lineItems.length);
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

      // Clear big package and small package selections when product changes
      this.lineItems[index].bigPackageNumber = '';
      this.lineItems[index].smallPackageId = '';
      this.lineItems[index]._selectedSmallPackages = [];
      this.selectedBigPackages[index] = null;
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

        // Reset small package selection when big package changes
        this.lineItems[index].smallPackageId = '';
        this.lineItems[index]._selectedSmallPackages = [];
        this.lineItems[index].unitAmount = 0;
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

  onMultiSmallPackagesSelected(selectedOptions: MultiSelectOption[], index: number): void {
    // Get selected IDs, filtering out disabled options
    const selectedIds = selectedOptions
      .filter(option => !option.disabled)
      .map(option => option.id);

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

  // Add validation method for big package selection
  isBigPackageInvalid(index: number): boolean {
    const packageNumber = this.lineItems[index].bigPackageNumber;
    return packageNumber ? this.isBigPackageSelected(packageNumber, index) : false;
  }

  // Method to find duplicate packages across line items
  findDuplicatePackages(): string[] {
    const { allDuplicates } = this.packageSelectionService.findDuplicatePackages(this.lineItems);
    return allDuplicates;
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

    // Validate no duplicate packages are selected
    const duplicatePackages = this.findDuplicatePackages();
    if (duplicatePackages.length > 0) {
      this.error = `Duplicate packages selected: ${duplicatePackages.join(', ')}`;
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

    // Check for duplicate packages
    if (this.findDuplicatePackages().length > 0) return false;

    // Check if all line items are complete
    return this.lineItems.every(item =>
      item.productId &&
      item.bigPackageNumber &&
      item.smallPackageId &&
      item.unitAmount > 0
    );
  }

  // Helper methods for template
  getValidLineItemsCount(): number {
    return this.lineItems.filter(item => this.isLineItemValid(item)).length;
  }

  getInvalidLineItemsCount(): number {
    return this.lineItems.length - this.getValidLineItemsCount();
  }

  private isLineItemValid(item: LineItemData): boolean {
    // Check if line item is complete
    const isComplete = !!(
      item.productId &&
      item.bigPackageNumber &&
      item.smallPackageId &&
      item.unitAmount > 0 &&
      item.unitPrice > 0
    );

    if (!isComplete) return false;

    // Check for package conflicts
    const bigPackageIndex = this.lineItems.findIndex(li => li === item);
    const hasBigPackageConflict = this.isBigPackageSelected(item.bigPackageNumber, bigPackageIndex);

    // Check small package conflicts
    const smallPackages = item._selectedSmallPackages || (item.smallPackageId ? [item.smallPackageId] : []);
    const hasSmallPackageConflict = smallPackages.some(packageId =>
      this.isSmallPackageSelected(packageId, bigPackageIndex)
    );

    return !hasBigPackageConflict && !hasSmallPackageConflict;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    // Check for incomplete line items
    const incompleteItems = this.lineItems.filter(item => !this.isLineItemValid(item));
    if (incompleteItems.length > 0) {
      errors.push(`${incompleteItems.length} line item(s) are incomplete or have conflicts`);
    }

    // Check for specific duplicate packages
    const duplicates = this.findDuplicatePackages();
    if (duplicates.length > 0) {
      errors.push(`Duplicate packages: ${duplicates.join(', ')}`);
    }

    return errors;
  }

  // Enhanced updateLineItem method to trigger validation
  updateLineItem(lineItem: LineItemData, index: number): void {
    this.lineItems[index] = lineItem;

    // Trigger validation update for all line items
    // This ensures that if a package becomes available again, other line items can use it
    this.triggerValidationUpdate();
  }

  private triggerValidationUpdate(): void {
    // Force update of all line item validations
    // This is needed when packages become available/unavailable
    setTimeout(() => {
      // Trigger change detection if needed
    }, 0);
  }

  // Template helper methods for package summary
  getCompletionPercentage(): number {
    if (this.lineItems.length === 0) return 0;
    return Math.round((this.getValidLineItemsCount() / this.lineItems.length) * 100);
  }

  getCompletionBadgeClass(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage === 100) return 'bg-success';
    if (percentage >= 75) return 'bg-info';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getUsedBigPackagesCount(): number {
    const usedPackages = new Set(
      this.lineItems
        .filter(item => item.bigPackageNumber)
        .map(item => item.bigPackageNumber)
    );
    return usedPackages.size;
  }

  getUsedSmallPackagesCount(): number {
    const usedPackages = new Set<string>();
    this.lineItems.forEach(item => {
      const packages = item._selectedSmallPackages ||
        (item.smallPackageId ? [item.smallPackageId] : []);
      packages.forEach(pkg => usedPackages.add(pkg));
    });
    return usedPackages.size;
  }

  getTotalAmount(): number {
    return this.lineItems.reduce((total, item) => total + (item.unitAmount || 0), 0);
  }
}
