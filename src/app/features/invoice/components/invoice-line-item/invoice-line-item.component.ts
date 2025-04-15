// src/app/features/invoice/components/invoice-line-item/invoice-line-item.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductForInvoice } from '@models/invoice.model';
import { MultiSelectOption } from 'src/app/shared-components/multi-select-dropdown/multi-select-dropdown.component';
import { LineItemData } from '@models/line-item-extensions';

@Component({
  selector: 'app-invoice-line-item',
  templateUrl: './invoice-line-item.component.html',
  styleUrls: ['./invoice-line-item.component.scss']
})
export class InvoiceLineItemComponent implements OnInit {
  @Input() products: ProductForInvoice[] = [];
  @Input() lineItem: LineItemData | null = null;
  @Input() index: number = 0;

  @Output() lineItemChange = new EventEmitter<LineItemData>();
  @Output() removeLineItem = new EventEmitter<number>();

  form: FormGroup;
  selectedProduct: ProductForInvoice | null = null;
  selectedBigPackage: any = null;
  smallPackageOptions: MultiSelectOption[] = [];
  totalSelectedAmount: number = 0;

  // Track selected packages
  selectedSmallPackages: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      stockId: ['', Validators.required],
      productId: ['', Validators.required],
      bigPackageNumber: ['', Validators.required],
      smallPackageId: ['', Validators.required], // Keep original field for compatibility
      unitAmount: [0, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Initialize form if we're editing
    if (this.lineItem) {
      // Initialize selected packages array
      this.selectedSmallPackages = this.lineItem._selectedSmallPackages ||
                                  (this.lineItem.smallPackageId ? [this.lineItem.smallPackageId] : []);

      // Fill the form
      this.form.patchValue({
        stockId: this.lineItem.stockId,
        productId: this.lineItem.productId,
        bigPackageNumber: this.lineItem.bigPackageNumber,
        smallPackageId: this.lineItem.smallPackageId,
        unitAmount: this.lineItem.unitAmount,
        unitPrice: this.lineItem.unitPrice
      });

      // Set selected items
      this.onProductSelected();
      this.onBigPackageSelected();
    }

    // Listen for form changes
    this.form.valueChanges.subscribe(val => {
      // Create line item data with extended properties
      const lineItemData: LineItemData = {
        ...val,
        // Calculated fields
        totalPrice: this.calculateTotal(),
        productName: this.selectedProduct?.productName || '',
        type: this.selectedProduct?.type || '',
        sizeDescription: this.getSelectedSizeDescription(),
        // Multi-select extensions
        _selectedSmallPackages: this.selectedSmallPackages,
        _bigPackageInfo: this.selectedBigPackage
      };

      // Emit data
      this.lineItemChange.emit(lineItemData);
    });
  }

  get formControls() {
    return this.form.controls;
  }

  onProductSelected(): void {
    const productId = this.form.get('productId')?.value;
    this.selectedProduct = this.products.find(p => p.productId === productId) || null;

    if (this.selectedProduct) {
      // Update stockId
      this.form.get('stockId')?.setValue(this.selectedProduct.stockId);

      // Reset big package selection
      this.form.get('bigPackageNumber')?.setValue('');
      this.form.get('smallPackageId')?.setValue('');
      this.selectedBigPackage = null;
      this.smallPackageOptions = [];
      this.selectedSmallPackages = [];
      this.totalSelectedAmount = 0;

      // Set unit price from product
      this.form.get('unitPrice')?.setValue(this.selectedProduct.price);
    }
  }

  onBigPackageSelected(): void {
    const packageNumber = this.form.get('bigPackageNumber')?.value;

    if (this.selectedProduct && packageNumber) {
      this.selectedBigPackage = this.selectedProduct.bigPackages.find(
        bp => bp.packageNumber === packageNumber
      ) || null;

      if (this.selectedBigPackage) {
        // Reset small package selection in form
        this.form.get('smallPackageId')?.setValue('');

        // Create options for multi-select dropdown
        this.smallPackageOptions = this.getSmallPackageOptions();

        // If this is the same big package as before, try to restore selections
        if (this.lineItem &&
            this.lineItem.bigPackageNumber === packageNumber &&
            this.lineItem._selectedSmallPackages &&
            this.lineItem._selectedSmallPackages.length > 0) {

          // Restore previous selections
          this.smallPackageOptions.forEach(option => {
            option.selected = this.lineItem?._selectedSmallPackages?.includes(option.id) || false;
          });

          this.selectedSmallPackages = [...(this.lineItem._selectedSmallPackages || [])];

          // Set the first selected package as smallPackageId for compatibility
          if (this.selectedSmallPackages.length > 0) {
            this.form.get('smallPackageId')?.setValue(this.selectedSmallPackages[0]);
          }

          // Update amount
          this.updateTotalAmount();
        } else {
          // Reset selections
          this.selectedSmallPackages = [];
        }
      }
    }
  }

  getSmallPackageOptions(): MultiSelectOption[] {
    if (!this.selectedBigPackage) return [];

    return this.selectedBigPackage.smallPackages
      .filter((sp: any) => sp.isOpen)
      .map((sp: any) => ({
        id: sp.packageId,
        label: `${sp.packageId} - ${sp.sizeAmount} ${sp.sizeDescription}`,
        selected: this.selectedSmallPackages.includes(sp.packageId),
        disabled: false,
        data: sp
      }));
  }

  onSmallPackagesSelected(selectedOptions: MultiSelectOption[]): void {
    // Update the array of selected package IDs
    this.selectedSmallPackages = selectedOptions.map(option => option.id);

    // For compatibility with the original model, set at least the first one
    if (this.selectedSmallPackages.length > 0) {
      this.form.get('smallPackageId')?.setValue(this.selectedSmallPackages[0]);
    } else {
      this.form.get('smallPackageId')?.setValue('');
    }

    // Update the total unit amount
    this.updateTotalAmount();
  }

  updateTotalAmount(): void {
    if (!this.selectedBigPackage) return;

    // Calculate total amount based on all selected packages
    let totalAmount = 0;

    if (this.selectedSmallPackages.length > 0) {
      // Find all selected small packages
      const selectedPackages = this.selectedBigPackage.smallPackages
        .filter((sp: any) => sp.isOpen && this.selectedSmallPackages.includes(sp.packageId));

      // Sum up their size amounts
      totalAmount = selectedPackages.reduce((sum: number, sp: any) => sum + sp.sizeAmount, 0);
    }

    // Update total and form
    this.totalSelectedAmount = totalAmount;
    this.form.get('unitAmount')?.setValue(totalAmount);
  }

  calculateTotal(): number {
    const unitAmount = this.form.get('unitAmount')?.value || 0;
    const unitPrice = this.form.get('unitPrice')?.value || 0;
    return unitAmount * unitPrice;
  }

  onRemove(): void {
    this.removeLineItem.emit(this.index);
  }

  getSelectedSizeDescription(): string {
    if (!this.selectedBigPackage || this.selectedSmallPackages.length === 0) return '';

    // Find first selected package to get its description
    const firstSelectedPackage = this.selectedBigPackage.smallPackages
      .find((sp: any) => this.selectedSmallPackages.includes(sp.packageId));

    return firstSelectedPackage ? firstSelectedPackage.sizeDescription : '';
  }
}
