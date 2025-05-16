import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, ViewRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductForInvoice } from '@models/invoice.model';
import { MultiSelectOption } from 'src/app/shared-components/multi-select-dropdown/multi-select-dropdown.component';
import { LineItemData } from '@models/line-item-extensions';
import { PackageSelectionService } from '@services/package-selection.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-line-item',
  templateUrl: './invoice-line-item.component.html',
  styleUrls: ['./invoice-line-item.component.scss']
})
export class InvoiceLineItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() products: ProductForInvoice[] = [];
  @Input() lineItem: LineItemData | null = null;
  @Input() index: number = 0;
  @Input() allLineItems: LineItemData[] = [];

  @Output() lineItemChange = new EventEmitter<LineItemData>();
  @Output() removeLineItem = new EventEmitter<number>();

  form: FormGroup;
  selectedProduct: ProductForInvoice | null = null;
  selectedBigPackage: any = null;
  smallPackageOptions: MultiSelectOption[] = [];
  totalSelectedAmount: number = 0;
  selectedSmallPackages: string[] = [];
  bigPackageAlreadySelected = false;
  smallPackagesAlreadySelected: string[] = [];

  private destroy$ = new Subject<void>();
  private isInitializing = false;
  private isDestroyed = false;

  constructor(
    private fb: FormBuilder,
    private packageSelectionService: PackageSelectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      stockId: ['', Validators.required],
      productId: ['', Validators.required],
      bigPackageNumber: [''],
      smallPackageId: [''],
      unitAmount: [0, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    console.log('Line item component initialized for index:', this.index);
    
    // Set up form change subscriptions with debounce
    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(() => {
        if (!this.isInitializing && !this.isDestroyed) {
          this.safeEmitChanges();
        }
      });

    // Initialize from line item data if present
    if (this.lineItem) {
      this.initializeFromLineItem();
    }

    // Initial validation and options update
    this.safeUpdateAvailableOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isDestroyed) return;

    if (changes['products'] && !changes['products'].firstChange) {
      console.log('Products changed for line item', this.index);
      this.updateProductSelection();
    }

    if (changes['allLineItems'] && !changes['allLineItems'].firstChange) {
      console.log('All line items changed, updating validation for', this.index);
      this.safeUpdateAvailableOptions();
    }

    if (changes['lineItem'] && !changes['lineItem'].firstChange && this.lineItem) {
      console.log('Line item data changed for index', this.index);
      this.initializeFromLineItem();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private safeDetectChanges(): void {
    if (!this.isDestroyed && this.cdr && !(this.cdr as ViewRef).destroyed) {
      try {
        this.cdr.detectChanges();
      } catch (error) {
        console.warn('Change detection error in line item', this.index, error);
      }
    }
  }

  private safeEmitChanges(): void {
    if (this.isDestroyed) return;

    try {
      const lineItemData: LineItemData = {
        ...this.form.value,
        totalPrice: this.calculateTotal(),
        productName: this.selectedProduct?.productName || '',
        type: this.selectedProduct?.type || '',
        sizeDescription: this.getSelectedSizeDescription(),
        _selectedSmallPackages: [...this.selectedSmallPackages],
        _bigPackageInfo: this.selectedBigPackage
      };

      console.log('Emitting line item change for index', this.index, ':', lineItemData);
      this.lineItemChange.emit(lineItemData);
    } catch (error) {
      console.error('Error emitting line item changes:', error);
    }
  }

  private safeUpdateAvailableOptions(): void {
    if (this.isDestroyed) return;

    try {
      this.validateSelections();
      this.updateSmallPackageOptions();
    } catch (error) {
      console.error('Error updating available options:', error);
    }
  }

  private initializeFromLineItem(): void {
    if (!this.lineItem || this.isDestroyed) return;

    console.log('Initializing line item', this.index, 'from data:', this.lineItem);
    
    this.isInitializing = true;

    try {
      // Set selected packages first
      this.selectedSmallPackages = this.lineItem._selectedSmallPackages || 
        (this.lineItem.smallPackageId ? [this.lineItem.smallPackageId] : []);

      // Update form with values
      this.form.patchValue({
        stockId: this.lineItem.stockId,
        productId: this.lineItem.productId,
        bigPackageNumber: this.lineItem.bigPackageNumber,
        smallPackageId: this.lineItem.smallPackageId,
        unitAmount: this.lineItem.unitAmount,
        unitPrice: this.lineItem.unitPrice
      }, { emitEvent: false });

      // Set selections
      if (this.lineItem.productId) {
        this.setSelectedProduct(this.lineItem.productId);
      }
      
      if (this.lineItem.bigPackageNumber) {
        this.setSelectedBigPackage(this.lineItem.bigPackageNumber);
      }
    } catch (error) {
      console.error('Error initializing line item:', error);
    } finally {
      this.isInitializing = false;
      this.safeDetectChanges();
    }
  }

  private updateProductSelection(): void {
    const currentProductId = this.form.get('productId')?.value;
    if (currentProductId && !this.isDestroyed) {
      this.setSelectedProduct(currentProductId);
    }
  }

  private setSelectedProduct(productId: string): void {
    if (this.isDestroyed) return;

    this.selectedProduct = this.products.find(p => p.productId === productId) || null;
    console.log('Line item', this.index, '- Selected product:', this.selectedProduct?.productName);
    
    if (this.selectedProduct) {
      // Update stock ID and unit price automatically
      this.form.patchValue({
        stockId: this.selectedProduct.stockId,
        unitPrice: this.selectedProduct.price
      }, { emitEvent: false });

      // Check if product has big packages
      if (!this.selectedProduct.bigPackages || this.selectedProduct.bigPackages.length === 0) {
        console.log('Product has no big packages available');
        // Reset package-related fields and make them not required
        this.form.patchValue({
          bigPackageNumber: '',
          smallPackageId: '',
          unitAmount: 0
        }, { emitEvent: false });
        
        // Update validators for products without packages
        this.form.get('bigPackageNumber')?.clearValidators();
        this.form.get('smallPackageId')?.clearValidators();
        this.form.get('bigPackageNumber')?.updateValueAndValidity({ emitEvent: false });
        this.form.get('smallPackageId')?.updateValueAndValidity({ emitEvent: false });
        
        this.selectedBigPackage = null;
        this.smallPackageOptions = [];
        this.selectedSmallPackages = [];
        this.totalSelectedAmount = 0;
      } else {
        // Product has packages, restore validators
        this.form.get('bigPackageNumber')?.setValidators([Validators.required]);
        this.form.get('smallPackageId')?.setValidators([Validators.required]);
        this.form.get('bigPackageNumber')?.updateValueAndValidity({ emitEvent: false });
        this.form.get('smallPackageId')?.updateValueAndValidity({ emitEvent: false });
      }
    }

    this.updateControlStates();
    this.safeUpdateAvailableOptions();
  }

  private setSelectedBigPackage(packageNumber: string): void {
    if (this.isDestroyed) return;

    if (this.selectedProduct && packageNumber && this.selectedProduct.bigPackages) {
      this.selectedBigPackage = this.selectedProduct.bigPackages.find(
        bp => bp.packageNumber === packageNumber
      ) || null;

      console.log('Line item', this.index, '- Selected big package:', this.selectedBigPackage?.packageNumber);

      if (this.selectedBigPackage) {
        this.updateSmallPackageOptions();
        this.restoreSmallPackageSelections();
      }
    } else {
      this.selectedBigPackage = null;
      this.smallPackageOptions = [];
    }

    this.safeUpdateAvailableOptions();
  }

  private updateControlStates(): void {
    if (this.isDestroyed) return;

    const bigPackageControl = this.form.get('bigPackageNumber');
    
    if (this.selectedProduct && this.selectedProduct.bigPackages && this.selectedProduct.bigPackages.length > 0 && bigPackageControl) {
      if (bigPackageControl.disabled) {
        bigPackageControl.enable({ emitEvent: false });
      }
    } else if (bigPackageControl) {
      if (bigPackageControl.enabled) {
        bigPackageControl.disable({ emitEvent: false });
      }
    }
  }

  private validateSelections(): void {
    if (this.isDestroyed) return;

    const bigPackageNumber = this.form.get('bigPackageNumber')?.value;

    // Validate big package
    this.bigPackageAlreadySelected = bigPackageNumber ?
      this.packageSelectionService.isBigPackageSelected(this.allLineItems, bigPackageNumber, this.index) : false;

    // Validate small packages
    this.smallPackagesAlreadySelected = this.selectedSmallPackages.filter(packageId =>
      this.packageSelectionService.isSmallPackageSelected(this.allLineItems, packageId, this.index)
    );
  }

  private updateSmallPackageOptions(): void {
    if (this.isDestroyed || !this.selectedBigPackage || !this.selectedBigPackage.smallPackages) {
      this.smallPackageOptions = [];
      return;
    }

    try {
      this.smallPackageOptions = this.selectedBigPackage.smallPackages
        .filter((sp: any) => sp.sizeAmount > 0 || sp.quantity > 0)
        .map((sp: any) => {
          const isAlreadySelected = this.packageSelectionService.isSmallPackageSelected(
            this.allLineItems, sp.packageId, this.index
          );

          return {
            id: sp.packageId,
            label: `${sp.packageId} - ${sp.sizeAmount} ${sp.sizeDescription}${isAlreadySelected ? ' (Already Selected)' : ''}`,
            selected: this.selectedSmallPackages.includes(sp.packageId),
            disabled: isAlreadySelected,
            data: sp
          };
        });

      console.log('Updated small package options for line item', this.index, ':', this.smallPackageOptions);
    } catch (error) {
      console.error('Error updating small package options:', error);
      this.smallPackageOptions = [];
    }
  }

  private restoreSmallPackageSelections(): void {
    if (!this.selectedSmallPackages.length || this.isDestroyed) return;

    try {
      // Update options selection state
      this.smallPackageOptions.forEach(option => {
        option.selected = this.selectedSmallPackages.includes(option.id);
      });

      this.updateTotalAmount();
    } catch (error) {
      console.error('Error restoring small package selections:', error);
    }
  }

  private updateTotalAmount(): void {
    if (this.isDestroyed) return;

    if (!this.selectedBigPackage || !this.selectedBigPackage.smallPackages || this.selectedSmallPackages.length === 0) {
      this.totalSelectedAmount = 0;
      this.form.patchValue({ unitAmount: 0 }, { emitEvent: false });
      return;
    }

    try {
      // Calculate total from selected packages
      const selectedPackages = this.selectedBigPackage.smallPackages
        .filter((sp: any) => this.selectedSmallPackages.includes(sp.packageId));

      this.totalSelectedAmount = selectedPackages.reduce((sum: number, sp: any) => sum + sp.sizeAmount, 0);
      this.form.patchValue({ unitAmount: this.totalSelectedAmount }, { emitEvent: false });
    } catch (error) {
      console.error('Error updating total amount:', error);
    }
  }

  // Event handlers
  onProductSelected(): void {
    if (this.isDestroyed) return;

    console.log('Product selected for line item', this.index);
    const productId = this.form.get('productId')?.value;
    
    this.isInitializing = true;
    
    try {
      // Reset dependent fields
      this.form.patchValue({
        bigPackageNumber: '',
        smallPackageId: '',
        unitAmount: 0
      }, { emitEvent: false });

      // Reset selections
      this.selectedBigPackage = null;
      this.selectedSmallPackages = [];
      this.smallPackageOptions = [];
      this.totalSelectedAmount = 0;

      // Set the selected product
      this.setSelectedProduct(productId);
    } catch (error) {
      console.error('Error in product selection:', error);
    } finally {
      this.isInitializing = false;
      this.safeEmitChanges();
    }
  }

  onBigPackageSelected(): void {
    if (this.isDestroyed) return;

    console.log('Big package selected for line item', this.index);
    const packageNumber = this.form.get('bigPackageNumber')?.value;
    
    this.isInitializing = true;
    
    try {
      // Reset small package selections
      this.form.patchValue({
        smallPackageId: '',
        unitAmount: 0
      }, { emitEvent: false });
      
      this.selectedSmallPackages = [];
      this.totalSelectedAmount = 0;

      // Set the selected big package
      this.setSelectedBigPackage(packageNumber);
    } catch (error) {
      console.error('Error in big package selection:', error);
    } finally {
      this.isInitializing = false;
      this.safeEmitChanges();
    }
  }

  onSmallPackagesSelected(selectedOptions: MultiSelectOption[]): void {
    if (this.isDestroyed) return;

    console.log('Small packages selected for line item', this.index, ':', selectedOptions);
    
    try {
      // Filter out disabled options
      const validSelections = selectedOptions.filter(option => !option.disabled);
      this.selectedSmallPackages = validSelections.map(option => option.id);

      // Set the first package as smallPackageId for form compatibility
      const firstPackageId = this.selectedSmallPackages.length > 0 ? this.selectedSmallPackages[0] : '';
      this.form.patchValue({ smallPackageId: firstPackageId }, { emitEvent: false });

      // Update total amount
      this.updateTotalAmount();
      this.safeUpdateAvailableOptions();
      this.safeEmitChanges();
    } catch (error) {
      console.error('Error in small package selection:', error);
    }
  }

  // Getters and utility methods
  get formControls() {
    return this.form.controls;
  }

  getAvailableBigPackages(): any[] {
    if (!this.selectedProduct || this.isDestroyed) {
      console.log('Line item', this.index, '- No selected product');
      return [];
    }

    if (!this.selectedProduct.bigPackages || this.selectedProduct.bigPackages.length === 0) {
      console.log('Line item', this.index, '- Product has no big packages');
      return [];
    }

    try {
      // Filter big packages to only include those with available small packages
      const availablePackages = this.selectedProduct.bigPackages.filter(bigPackage => 
        bigPackage.smallPackages && bigPackage.smallPackages.some(smallPackage => 
          smallPackage.quantity > 0 || smallPackage.sizeAmount > 0
        )
      );

      console.log('Line item', this.index, '- Available big packages:', availablePackages);

      const packagesWithStatus = this.packageSelectionService.getAvailableBigPackages(
        availablePackages, this.allLineItems, this.index
      );

      console.log('Line item', this.index, '- Big packages with status:', packagesWithStatus);
      return packagesWithStatus;
    } catch (error) {
      console.error('Error getting available big packages:', error);
      return [];
    }
  }

  calculateTotal(): number {
    const unitAmount = this.form.get('unitAmount')?.value || 0;
    const unitPrice = this.form.get('unitPrice')?.value || 0;
    return unitAmount * unitPrice;
  }

  getSelectedSizeDescription(): string {
    if (this.isDestroyed || !this.selectedBigPackage || !this.selectedBigPackage.smallPackages || this.selectedSmallPackages.length === 0) return '';

    try {
      const firstSelected = this.selectedBigPackage.smallPackages
        .find((sp: any) => this.selectedSmallPackages.includes(sp.packageId));

      return firstSelected?.sizeDescription || '';
    } catch (error) {
      console.error('Error getting selected size description:', error);
      return '';
    }
  }

  isBigPackageOptionDisabled(pkg: any): boolean {
    return pkg.isDisabled || pkg.isAlreadySelected;
  }

  // Validation getters
  isBigPackageInvalid(): boolean {
    return this.bigPackageAlreadySelected;
  }

  isSmallPackageInvalid(): boolean {
    return this.smallPackagesAlreadySelected.length > 0;
  }

  getBigPackageErrorMessage(): string {
    return this.bigPackageAlreadySelected ?
      'This big package is already selected in another line item' :
      'Big package is required';
  }

  getSmallPackageErrorMessage(): string {
    return this.smallPackagesAlreadySelected.length > 0 ?
      `Package(s) ${this.smallPackagesAlreadySelected.join(', ')} already selected in another line item` :
      'At least one small package is required';
  }

  // Check if the selected product has packages available
  hasAvailablePackages(): boolean {
    return this.selectedProduct !== null && 
           this.selectedProduct.bigPackages !== null && 
           this.selectedProduct.bigPackages !== undefined && 
           this.selectedProduct.bigPackages.length > 0;
  }

  onRemove(): void {
    console.log('Removing line item', this.index);
    this.removeLineItem.emit(this.index);
  }
}