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

      this.updateProductSelection();
    }

    if (changes['allLineItems'] && !changes['allLineItems'].firstChange) {

      this.safeUpdateAvailableOptions();
    }

    if (changes['lineItem'] && !changes['lineItem'].firstChange && this.lineItem) {

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
  
    // Store current unit price before updating product
    const currentUnitPrice = this.form.get('unitPrice')?.value;
  
    this.selectedProduct = this.products.find(p => p.productId === productId) || null;
  
    if (this.selectedProduct) {
      // Only update stockId and set unit price if it's not already set
      this.form.patchValue({
        stockId: this.selectedProduct.stockId,
        // Use current price if exists, otherwise use product's default price
        unitPrice: currentUnitPrice || this.selectedProduct.price
      }, { emitEvent: false });
  
      // Check if product has big packages
      if (!this.selectedProduct.bigPackages || this.selectedProduct.bigPackages.length === 0) {
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
    } else {
      // Reset form if no product is selected
      this.form.patchValue({
        stockId: '',
        bigPackageNumber: '',
        smallPackageId: '',
        unitAmount: 0,
        unitPrice: currentUnitPrice // Preserve the current price even if no product selected
      }, { emitEvent: false });
    }
  
    this.updateControlStates();
    this.safeUpdateAvailableOptions();
  }

  private setSelectedBigPackage(packageNumber: string): void {
    if (this.selectedProduct && packageNumber && this.selectedProduct.bigPackages) {
      // Store current unit price
      const currentUnitPrice = this.form.get('unitPrice')?.value;
  
      this.selectedBigPackage = this.selectedProduct.bigPackages.find(
        bp => bp.packageNumber === packageNumber
      ) || null;
  
      if (this.selectedBigPackage) {
        // Only reset smallPackageId and unitAmount, preserve unitPrice
        this.form.patchValue({
          smallPackageId: '',
          unitAmount: 0,
          // Restore the current unit price
          unitPrice: currentUnitPrice
        }, { emitEvent: false });
  
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

    } catch (error) {
      // TODO : Handle error gracefully
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

    const productId = this.form.get('productId')?.value;
    const currentUnitPrice = this.form.get('unitPrice')?.value;

    this.isInitializing = true;

    try {
      // Reset dependent fields but preserve unit price
      this.form.patchValue({
        bigPackageNumber: '',
        smallPackageId: '',
        unitAmount: 0,
        unitPrice: currentUnitPrice // Preserve current price
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

  const packageNumber = this.form.get('bigPackageNumber')?.value;
  const currentUnitPrice = this.form.get('unitPrice')?.value;

  this.isInitializing = true;

  try {
    // Reset only small package selections
    this.form.patchValue({
      smallPackageId: '',
      unitAmount: 0,
      unitPrice: currentUnitPrice
    }, { emitEvent: false });

    this.selectedSmallPackages = [];
    this.totalSelectedAmount = 0;

    // Set selected big package
    if (this.selectedProduct && packageNumber) {
      this.selectedBigPackage = this.selectedProduct.bigPackages.find(
        bp => bp.packageNumber === packageNumber
      ) || null;

      // Force immediate UI update
      this.cdr.detectChanges();
      
      // Queue another update
      setTimeout(() => {
        this.updateSmallPackageOptions();
        this.cdr.detectChanges();
      });
    }
  } catch (error) {
    console.error('Error in big package selection:', error);
  } finally {
    this.isInitializing = false;
    this.safeEmitChanges();
  }
}

  onSmallPackagesSelected(selectedOptions: MultiSelectOption[]): void {
    if (this.isDestroyed) return;
  
    this.isInitializing = true;
    try {
      // Update selected packages immediately
      this.selectedSmallPackages = selectedOptions
        .filter(option => !option.disabled)
        .map(option => option.id);
  
      // Update form control
      const firstPackageId = this.selectedSmallPackages[0] || '';
      this.form.patchValue({ 
        smallPackageId: firstPackageId 
      }, { emitEvent: false });
  
      // Force update small package options to reflect new selections
      this.updateSmallPackageOptions();
      
      // Update amounts
      this.updateTotalAmount();
      
      // Force UI update
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error in small package selection:', error);
    } finally {
      this.isInitializing = false;
      this.safeEmitChanges();
    }
  }

  // Getters and utility methods
  get formControls() {
    return this.form.controls;
  }

  getAvailableBigPackages(): any[] {
    if (!this.selectedProduct || this.isDestroyed) {
      return [];
    }

    if (!this.selectedProduct.bigPackages || this.selectedProduct.bigPackages.length === 0) {
      return [];
    }

    try {
      // Filter big packages to only include those with available small packages
      const availablePackages = this.selectedProduct.bigPackages.filter(bigPackage =>
        bigPackage.smallPackages && bigPackage.smallPackages.some(smallPackage =>
          smallPackage.quantity > 0 || smallPackage.sizeAmount > 0
        )
      );


      const packagesWithStatus = this.packageSelectionService.getAvailableBigPackages(
        availablePackages, this.allLineItems, this.index
      );

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
           this.selectedProduct.bigPackages.length > 0 &&
           this.selectedProduct.bigPackages.some(pkg =>
           pkg.smallPackages &&
           pkg.smallPackages.length > 0 &&
           pkg.smallPackages.some(smallPkg => smallPkg.quantity > 0)
         );
  }

  onRemove(): void {
    this.removeLineItem.emit(this.index);
  }
}
