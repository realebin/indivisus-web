import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BigPackageModel } from '@models/stock.model';
import { UserManagementService } from '@services/user-management.service';
import { Supplier } from '@models/user-management.model';

@Component({
  selector: 'app-big-package-create',
  templateUrl: './big-package-create.component.html',
  styleUrls: ['./big-package-create.component.scss'],
})
export class BigPackageCreateComponent implements OnInit {
  @Input() stockId: string;
  @Output() onSaved = new EventEmitter<void>();

  form: FormGroup;
  isLoading = false;
  errorMessage: string;
  suppliers: Supplier[] = [];

  constructor(
    private fb: FormBuilder,
    private stockService: StockManagementService,
    private userManagementService: UserManagementService,
    public modalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    this.userManagementService.inquirySupplier().subscribe({
      next: (response) => {
        this.suppliers = response.suppliers;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.errorMessage = 'Failed to load suppliers';
      },
    });
  }

  onSupplierSelect(event: any): void {
    const value = event.target.value;
    if (value) {
      const [supplierId, supplierName] = value.split('|');
      this.form.patchValue({
        supplier: value,
      });
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      packageNumber: [''],
      sizeDescription: ['', Validators.required],
      supplier: [''], // Single supplier field
      arrivalDate: [''],
      smallPackages: this.fb.array([this.createSmallPackageFormGroup()]),
      createdBy: [
        localStorage.getItem('username') || 'admin',
        Validators.required,
      ],
    });
  }

  createSmallPackageFormGroup(): FormGroup {
    return this.fb.group({
      sizeAmount: [null, [Validators.required, Validators.min(0.1)]],
      sizeDescription: ['', Validators.required],
      createdBy: [
        localStorage.getItem('username') || 'admin',
        Validators.required,
      ],
      multiplier: [
        1,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
    });
  }

  get smallPackagesFormArray(): FormArray {
    return this.form.get('smallPackages') as FormArray;
  }

  addSmallPackage(): void {
    this.smallPackagesFormArray.push(this.createSmallPackageFormGroup());
  }

  removeSmallPackage(index: number): void {
    if (this.smallPackagesFormArray.length > 1) {
      this.smallPackagesFormArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;

    // Extract supplier ID and name from the combined value
    const [supplierId, supplierName] = (formValue.supplier || '|').split('|');

    // Process small packages with multiplier
    const processedSmallPackages = this.processSmallPackagesWithMultiplier(
      formValue.smallPackages
    );

    const requestPayload = {
      packageNumber: formValue.packageNumber,
      sizeDescription: formValue.sizeDescription,
      supplierId: supplierId,
      supplierName: supplierName,
      arrivalDate: formValue.arrivalDate,
      smallPackages: processedSmallPackages.map((sp: any) => ({
        sizeAmount: sp.sizeAmount,
        sizeDescription: sp.sizeDescription,
        createdBy: formValue.createdBy,
      })),
      createdBy: formValue.createdBy,
    };

    this.stockService.createBigPackage(this.stockId, requestPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.onSaved.emit();
        this.modalRef.hide();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to create big package';
        console.error('Error creating big package:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  /**
   * Processes small packages with multiplier and returns expanded array
   */
  private processSmallPackagesWithMultiplier(smallPackages: any[]): any[] {
    if (!smallPackages || !Array.isArray(smallPackages)) {
      console.error('Small packages is not an array:', smallPackages);
      return [];
    }

    const expandedPackages: any[] = [];

    smallPackages.forEach((pkg) => {
      if (!pkg) {
        return;
      }

      const { multiplier, ...packageData } = pkg;
      const count = parseInt(multiplier as string) || 1;

      // Create 'count' copies of this package
      for (let i = 0; i < count; i++) {
        expandedPackages.push({ ...packageData });
      }
    });

    return expandedPackages;
  }

  close(): void {
    // Make sure we're properly closing the modal using BsModalRef
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }
}
