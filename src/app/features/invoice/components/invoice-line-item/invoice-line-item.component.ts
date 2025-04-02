import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductForInvoice } from '@models/invoice.model';

export interface LineItemData {
  stockId: string;
  productId: string;
  bigPackageNumber: string;
  smallPackageId: string;
  unitAmount: number;
  unitPrice: number;
  productName?: string;
  type?: string;
  sizeDescription?: string;
  totalPrice?: number;
}

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
  selectedSmallPackage: any = null;

  constructor(private fb: FormBuilder) {
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
    // Initialize form if we're editing
    if (this.lineItem) {
      this.form.patchValue(this.lineItem);

      // Set selected items
      this.onProductSelected();
      this.onBigPackageSelected();
    }

    // Listen for form changes
    this.form.valueChanges.subscribe(val => {
      const lineItemData: LineItemData = {
        ...val,
        totalPrice: this.calculateTotal(),
        productName: this.selectedProduct?.productName || '',
        type: this.selectedProduct?.type || '',
        sizeDescription: this.selectedSmallPackage?.sizeDescription || ''
      };
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
      this.selectedSmallPackage = null;

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

      // Reset small package selection
      this.form.get('smallPackageId')?.setValue('');
      this.selectedSmallPackage = null;
    }
  }

  onSmallPackageSelected(): void {
    const packageId = this.form.get('smallPackageId')?.value;

    if (this.selectedBigPackage && packageId) {
      interface SmallPackage {
        packageId: string;
        sizeAmount: number;
        sizeDescription: string;
        isOpen: boolean;
      }

      interface BigPackage {
        packageNumber: string;
        smallPackages: SmallPackage[];
      }

      // Prefill the unit amount with the available size amount
      if (this.selectedSmallPackage) {
        this.form.get('unitAmount')?.setValue(this.selectedSmallPackage.sizeAmount);
      }
    }
  }

  calculateTotal(): number {
    const unitAmount = this.form.get('unitAmount')?.value || 0;
    const unitPrice = this.form.get('unitPrice')?.value || 0;
    return unitAmount * unitPrice;
  }

  onRemove(): void {
    this.removeLineItem.emit(this.index);
  }

  // Helper getter to check if small packages are open
  get availableSmallPackages() {
    return this.selectedBigPackage?.smallPackages.filter((sp: any) => sp.isOpen) || [];
  }
}
