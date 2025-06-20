import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '@models/user-management.model';
import { SiteOverviewList } from '@models/site.model';
import { ProductForInvoice } from '@models/invoice.model';
import { UserManagementService } from '@services/user-management.service';
import { SiteService } from '@services/site.service';
import { InvoiceService } from '@services/invoice.service';
import { PackageSelectionService } from '@services/package-selection.service';
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
    private packageSelectionService: PackageSelectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      siteId: ['', Validators.required],
      dueDate: ['', Validators.required],
      notes: [''],
      reference: [''], // Optional reference field
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
        // Store all products without filtering
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
          reference: invoice.reference || '', // Optional reference field
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
                smallPackageId: item.smallPackageId || '',
                unitAmount: item.unitAmount || 0,
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
    const newLineItem: LineItemData = {
      stockId: '',
      productId: '',
      bigPackageNumber: '',
      smallPackageId: '',
      unitAmount: 0,
      unitPrice: 0,
      _selectedSmallPackages: []
    };

    this.lineItems.push(newLineItem);

    // Force change detection
    this.cdr.detectChanges();

  }

  removeLineItem(index: number): void {

    // Validate index
    if (index < 0 || index >= this.lineItems.length) {
      console.error('Invalid line item index:', index);
      return;
    }

    // Remove the line item from the array
    this.lineItems.splice(index, 1);

    // Clean up caches using the service method
    this.selectedProducts = this.packageSelectionService.reindexCaches(this.selectedProducts, index);
    this.selectedBigPackages = this.packageSelectionService.reindexCaches(this.selectedBigPackages, index);

    // Force immediate change detection
    this.cdr.detectChanges();


    // Update validation after removal
    setTimeout(() => {
      this.forceValidationUpdate();
    }, 100);
  }

  // updateLineItem(lineItem: LineItemData, index: number): void {
  //   // Validate index and line item
  //   if (index < 0 || index >= this.lineItems.length) {
  //     console.error('Invalid line item index:', index);
  //     return;
  //   }

  //   if (!lineItem) {
  //     console.error('Invalid line item data:', lineItem);
  //     return;
  //   }

  //   // Create a safe copy of the line item
  //   const safeLineItem = { ...lineItem };

  //   // Update the line item safely
  //   this.lineItems[index] = safeLineItem;

  //   // Force change detection
  //   this.cdr.detectChanges();

  // }
  updateLineItem(lineItem: LineItemData, index: number): void {
    // Validate index and line item
    if (index < 0 || index >= this.lineItems.length) {
      console.error('Invalid line item index:', index);
      return;
    }
  
    if (!lineItem) {
      console.error('Invalid line item data:', lineItem);
      return;
    }
  
    // Update in a single synchronous operation
    this.lineItems[index] = { ...lineItem };
    
    // Run change detection once
    this.cdr.detectChanges();
  }

  getInvoiceTotal(): number {
    return this.lineItems.reduce((total, item) => {
      const lineTotal = (item.unitAmount || 0) * (item.unitPrice || 0);
      return total + lineTotal;
    }, 0);
  }

  // Helper methods to check if packages are already selected
  isBigPackageSelected(packageNumber: string, currentIndex: number): boolean {
    return this.packageSelectionService.isBigPackageSelected(this.lineItems, packageNumber, currentIndex);
  }

  isSmallPackageSelected(packageId: string, currentIndex: number): boolean {
    return this.packageSelectionService.isSmallPackageSelected(this.lineItems, packageId, currentIndex);
  }
  forceValidationUpdate(): void {
    // Ensure change detection is run
    this.cdr.detectChanges();

    // Optional: Mark for check if using OnPush strategy
    this.cdr.markForCheck();
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
        reference: formValue.reference || '', // Optional reference field
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
        reference: formValue.reference || '', // Optional reference field
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

    if (!this.invoiceForm.valid) {
      return false;
    }

    if (this.lineItems.length === 0) {
      return false;
    }

    // Check for duplicate packages
    const duplicates = this.findDuplicatePackages();
    if (duplicates.length > 0) {
      return false;
    }

    // Check if all line items are complete
    const allValid = this.lineItems.every(item => {
      const isValid = !!(
        item.productId &&
        item.bigPackageNumber &&
        item.smallPackageId &&
        item.unitAmount > 0
      );

      return isValid;
    });

    return allValid;
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

  // Debug method
  debugLineItems(): void {
    console.log('=== DEBUG LINE ITEMS ===');
    console.log('Line items:', this.lineItems);
    console.log('Selected products cache:', this.selectedProducts);
    console.log('Selected big packages cache:', this.selectedBigPackages);
    console.log('Products array:', this.products);
    console.log('=== END DEBUG ===');
  }
}
