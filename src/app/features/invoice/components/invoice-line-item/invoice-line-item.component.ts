import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  private initialized = false;
  private isUpdating = false;

  constructor(
    private fb: FormBuilder,
    private packageSelectionService: PackageSelectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      stockId: ['', Validators.required],
      productId: ['', Validators.required],
      bigPackageNumber: ['', Validators.required],
      smallPackageId: ['', Validators.required],
      unitAmount: [0, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.initializeComponent();

    // Set up form change subscriptions with immediate emission
    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100) // Minimal debounce to avoid excessive calls
      )
      .subscribe(() => {
        if (this.initialized && !this.isUpdating) {
          this.emitChanges();
        }
      });

    this.initialized = true;
    console.log('Line item component initialized for index:', this.index);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allLineItems'] && this.initialized) {
      this.validateAndUpdateOptions();
    }

    if (changes['lineItem'] && this.lineItem && !changes['lineItem'].firstChange) {
      this.initializeFromLineItem();
    }

    if (changes['products'] && this.initialized) {
      // Update selected product when products change
      if (this.lineItem?.productId) {
        this.setSelectedProduct(this.lineItem.productId);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    if (this.lineItem) {
      this.initializeFromLineItem();
    }
    this.updateControlStates();
  }

  private initializeFromLineItem(): void {
    if (!this.lineItem) return;

    console.log('Initializing line item', this.index, 'from data:', this.lineItem);
    
    // Stop emissions during initialization
    this.isUpdating = true;

    // Initialize packages
    this.selectedSmallPackages = this.lineItem._selectedSmallPackages ||
      (this.lineItem.smallPackageId ? [this.lineItem.smallPackageId] : []);

    // Set form values
    this.form.patchValue({
      stockId: this.lineItem.stockId,
      productId: this.lineItem.productId,
      bigPackageNumber: this.lineItem.bigPackageNumber,
      smallPackageId: this.lineItem.smallPackageId,
      unitAmount: this.lineItem.unitAmount,
      unitPrice: this.lineItem.unitPrice
    }, { emitEvent: false });

    // Set selected product and packages
    this.setSelectedProduct(this.lineItem.productId);
    this.setSelectedBigPackage(this.lineItem.bigPackageNumber);

    // Re-enable emissions
    this.isUpdating = false;
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private setSelectedProduct(productId: string): void {
    this.selectedProduct = this.products.find(p => p.productId === productId) || null;
    console.log('Line item', this.index, '- Selected product:', this.selectedProduct?.productName);
    this.updateControlStates();
  }

  private setSelectedBigPackage(packageNumber: string): void {
    if (this.selectedProduct && packageNumber) {
      this.selectedBigPackage = this.selectedProduct.bigPackages.find(
        bp => bp.packageNumber === packageNumber
      ) || null;

      console.log('Line item', this.index, '- Selected big package:', this.selectedBigPackage?.packageNumber);

      if (this.selectedBigPackage) {
        this.updateSmallPackageOptions();
        if (this.lineItem?._selectedSmallPackages) {
          this.restoreSmallPackageSelections();
        }
      }
    } else {
      this.selectedBigPackage = null;
    }
  }

  private updateControlStates(): void {
    // Handle big package dropdown state
    const bigPackageControl = this.form.get('bigPackageNumber');
    if (this.selectedProduct) {
      if (bigPackageControl?.disabled) {
        bigPackageControl.enable({ emitEvent: false });
      }
    } else {
      if (bigPackageControl?.enabled) {
        bigPackageControl.disable({ emitEvent: false });
      }
    }
  }

  get formControls() {
    return this.form.controls;
  }

  // Event handlers
  onProductSelected(): void {
    console.log('Product selected for line item', this.index);
    const productId = this.form.get('productId')?.value;
    this.setSelectedProduct(productId);

    if (this.selectedProduct) {
      // Set dependent values
      this.form.patchValue({
        stockId: this.selectedProduct.stockId,
        unitPrice: this.selectedProduct.price,
        bigPackageNumber: '',
        smallPackageId: '',
        unitAmount: 0
      }, { emitEvent: false });

      // Reset package selections
      this.selectedBigPackage = null;
      this.selectedSmallPackages = [];
      this.smallPackageOptions = [];
      this.totalSelectedAmount = 0;
    }

    this.validateAndUpdateOptions();
    this.emitChanges();
  }

  onBigPackageSelected(): void {
    console.log('Big package selected for line item', this.index);
    const packageNumber = this.form.get('bigPackageNumber')?.value;
    this.setSelectedBigPackage(packageNumber);

    if (this.selectedBigPackage) {
      // Reset small package selections
      this.form.patchValue({
        smallPackageId: '',
        unitAmount: 0
      }, { emitEvent: false });
      this.selectedSmallPackages = [];
      this.totalSelectedAmount = 0;
    } else {
      this.smallPackageOptions = [];
    }

    this.validateAndUpdateOptions();
    this.emitChanges();
  }

  onSmallPackagesSelected(selectedOptions: MultiSelectOption[]): void {
    console.log('Small packages selected for line item', this.index, ':', selectedOptions);
    
    // Filter out disabled options
    const validSelections = selectedOptions.filter(option => !option.disabled);
    this.selectedSmallPackages = validSelections.map(option => option.id);

    // Set the first package as smallPackageId for form compatibility
    const firstPackageId = this.selectedSmallPackages.length > 0 ? this.selectedSmallPackages[0] : '';
    this.form.patchValue({ smallPackageId: firstPackageId }, { emitEvent: false });

    // Update total amount
    this.updateTotalAmount();
    this.validateAndUpdateOptions();
    this.emitChanges();
  }

  // Helper methods
  private validateAndUpdateOptions(): void {
    this.validateSelections();
    this.updateSmallPackageOptions();
  }

  private validateSelections(): void {
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
    if (!this.selectedBigPackage) {
      this.smallPackageOptions = [];
      return;
    }

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
  }

  private restoreSmallPackageSelections(): void {
    if (!this.lineItem?._selectedSmallPackages) return;

    this.selectedSmallPackages = [...this.lineItem._selectedSmallPackages];

    // Update options selection state
    this.smallPackageOptions.forEach(option => {
      option.selected = this.selectedSmallPackages.includes(option.id);
    });

    this.updateTotalAmount();
  }

  private updateTotalAmount(): void {
    if (!this.selectedBigPackage || this.selectedSmallPackages.length === 0) {
      this.totalSelectedAmount = 0;
      this.form.patchValue({ unitAmount: 0 }, { emitEvent: false });
      return;
    }

    // Calculate total from selected packages
    const selectedPackages = this.selectedBigPackage.smallPackages
      .filter((sp: any) => this.selectedSmallPackages.includes(sp.packageId));

    this.totalSelectedAmount = selectedPackages.reduce((sum: number, sp: any) => sum + sp.sizeAmount, 0);
    this.form.patchValue({ unitAmount: this.totalSelectedAmount }, { emitEvent: false });
  }

  private emitChanges(): void {
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
  }

  // Getters and utility methods
  getAvailableBigPackages(): any[] {
    if (!this.selectedProduct) {
      console.log('Line item', this.index, '- No selected product');
      return [];
    }

    // Filter big packages to only include those with available small packages
    const availablePackages = this.selectedProduct.bigPackages.filter(bigPackage => 
      bigPackage.smallPackages.some(smallPackage => 
        smallPackage.quantity > 0 || smallPackage.sizeAmount > 0
      )
    );

    console.log('Line item', this.index, '- Available big packages:', availablePackages);

    const packagesWithStatus = this.packageSelectionService.getAvailableBigPackages(
      availablePackages, this.allLineItems, this.index
    );

    console.log('Line item', this.index, '- Big packages with status:', packagesWithStatus);
    return packagesWithStatus;
  }

  calculateTotal(): number {
    const unitAmount = this.form.get('unitAmount')?.value || 0;
    const unitPrice = this.form.get('unitPrice')?.value || 0;
    return unitAmount * unitPrice;
  }

  getSelectedSizeDescription(): string {
    if (!this.selectedBigPackage || this.selectedSmallPackages.length === 0) return '';

    const firstSelected = this.selectedBigPackage.smallPackages
      .find((sp: any) => this.selectedSmallPackages.includes(sp.packageId));

    return firstSelected?.sizeDescription || '';
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

  onRemove(): void {
    console.log('Removing line item', this.index);
    this.removeLineItem.emit(this.index);
  }
}