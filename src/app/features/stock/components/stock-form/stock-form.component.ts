/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteAllListResponse } from '@models/site.model';
import { StockHeaderModel } from '@models/stock.model';
import { SiteService } from '@services/site.service';
import { StockManagementService } from '@services/stock.service';


@Component({
  selector: 'app-stock-form',
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.scss']
})
export class StockFormComponent implements OnInit {
  stockForm: FormGroup;
  isEditMode = false;
  stockId: string | null;
  isLoading = false;
  errorMessage: string;

  sites: { value: string, label: string }[] = [];
  stockTypes = [
    { value: 'FABRIC', label: 'Fabric' },
    { value: 'ROPE', label: 'Rope' },
    { value: 'OTHER', label: 'Other' }
  ];

  breadcrumbs = [
    { label: 'Stock', url: '/stock' },
    { label: 'Add Stock' }
  ];


  constructor(
    private fb: FormBuilder,
    private stockService: StockManagementService,
    private siteService: SiteService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadSites();

    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      this.stockId = params.get('id');
      if (this.stockId) {
        this.isEditMode = true;
        this.breadcrumbs[1].label = 'Edit Stock';
        this.loadStockData();
      }
    });

    // Only affect main stock size description
    this.stockForm.get('type')?.valueChanges.subscribe(type => {
      const mainSizeDescriptionControl = this.stockForm.get('sizeDescription');
      let sizeDescValue = '';

      if (type === 'FABRIC') {
        sizeDescValue = 'Yard/Meter';
        mainSizeDescriptionControl?.setValue(sizeDescValue);
        mainSizeDescriptionControl?.disable();
      } else if (type === 'ROPE') {
        sizeDescValue = 'Kg';
        mainSizeDescriptionControl?.setValue(sizeDescValue);
        mainSizeDescriptionControl?.disable();
      } else {
        mainSizeDescriptionControl?.enable();
        if (mainSizeDescriptionControl?.value === 'Yard/Meter' || mainSizeDescriptionControl?.value === 'Kg') {
          mainSizeDescriptionControl?.setValue('');
        }
        return; // Don't update children for 'OTHER' type
      }

      // Update all big packages size descriptions
      this.bigPackagesArray.controls.forEach(bigPackage => {
        bigPackage.get('sizeDescription')?.setValue(sizeDescValue);

        // Update all small packages within this big package
        const smallPackages = bigPackage.get('smallPackages') as FormArray;
        smallPackages.controls.forEach(smallPackage => {
          smallPackage.get('sizeDescription')?.setValue(sizeDescValue);
        });
      });
    });
  }

  initForm(): void {
    this.stockForm = this.fb.group({
      productId: ['', [Validators.required]],
      productName: ['', [Validators.required]],
      type: ['', [Validators.required]],
      specs: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      sizeDescription: [{ value: '', disabled: false }, Validators.required], // Main stock size description
      siteId: ['', [Validators.required]],
      bigPackages: this.fb.array([
        this.createBigPackageGroup()
      ]),
      createdBy: [localStorage.getItem('username')]
    });
  }

  createBigPackageGroup(): FormGroup {
    const currentType = this.stockForm?.get('type')?.value;
    let sizeDesc = '';

    if (currentType === 'FABRIC') {
      sizeDesc = 'Yard/Meter';
    } else if (currentType === 'ROPE') {
      sizeDesc = 'Kg';
    }

    return this.fb.group({
      packageNumber: [''],
      sizeDescription: [sizeDesc, [Validators.required]],
      smallPackages: this.fb.array([
        this.createSmallPackageGroup(sizeDesc)
      ]),
      createdBy: [localStorage.getItem('username') || 'admin']
    });
  }

  createSmallPackageGroup(initialSizeDesc: string = ''): FormGroup {
    return this.fb.group({
      sizeAmount: [null, [Validators.required, Validators.min(0.1)]],
      sizeDescription: [initialSizeDesc, [Validators.required]],
      multiplier: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      createdBy: [localStorage.getItem('username') || 'admin']
    });
  }

  get bigPackagesArray(): FormArray {
    return this.stockForm.get('bigPackages') as FormArray;
  }

  getSmallPackagesArray(bigPackageIndex: number): FormArray {
    return this.bigPackagesArray.at(bigPackageIndex).get('smallPackages') as FormArray;
  }

  addBigPackage(): void {
    this.bigPackagesArray.push(this.createBigPackageGroup());
  }

  removeBigPackage(index: number): void {
    if (this.bigPackagesArray.length > 1) {
      this.bigPackagesArray.removeAt(index);
    }
  }

  addSmallPackage(bigPackageIndex: number): void {
    const smallPackages = this.getSmallPackagesArray(bigPackageIndex);
    const currentType = this.stockForm.get('type')?.value;
    let sizeDesc = '';

    if (currentType === 'FABRIC') {
      sizeDesc = 'Yard/Meter';
    } else if (currentType === 'ROPE') {
      sizeDesc = 'Kg';
    }

    smallPackages.push(this.createSmallPackageGroup(sizeDesc));
  }

  removeSmallPackage(bigPackageIndex: number, smallPackageIndex: number): void {
    const smallPackages = this.getSmallPackagesArray(bigPackageIndex);
    if (smallPackages.length > 1) {
      smallPackages.removeAt(smallPackageIndex);
    }
  }

  loadSites(): void {
    this.isLoading = true;
    this.siteService.getSiteForFilter().subscribe({
      next: (response: SiteAllListResponse) => {
        this.sites = response.data.map(site => ({
          value: site.siteId,
          label: site.siteName
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading sites';
        this.isLoading = false;
      }
    });
  }

  loadStockData(): void {
    if (!this.stockId) return;
    this.isLoading = true;
    this.stockService.getStockById(this.stockId).subscribe({
      next: (stock: StockHeaderModel) => {
        // Update form with stock data
        this.stockForm.patchValue({
          productId: stock.productId,
          productName: stock.productName,
          type: stock.type,
          specs: stock.specs,
          price: stock.price,
          sizeDescription: stock.sizeDescription,
          siteId: stock.siteId
        });

        // If in edit mode, disable productId field as it shouldn't be changed
        this.stockForm.get('productId')?.disable();

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading stock data';
        this.isLoading = false;
      }
    });
  }

  // Process small packages with multiplier
  processSmallPackagesWithMultiplier(bigPackages: any[]): any[] {
    return bigPackages.map(bigPackage => {
      // Process small packages in this big package
      const expandedSmallPackages: any[] = [];

      bigPackage.smallPackages.forEach((smallPackage: any) => {
        const { multiplier, ...packageData } = smallPackage;
        const count = parseInt(multiplier) || 1;

        // Create 'count' copies of this package
        for (let i = 0; i < count; i++) {
          expandedSmallPackages.push({...packageData});
        }
      });

      // Return the big package with expanded small packages
      return {
        ...bigPackage,
        smallPackages: expandedSmallPackages
      };
    });
  }

  onSubmit(): void {
    const sizeDescriptionControl = this.stockForm.get('sizeDescription');
    if (sizeDescriptionControl?.disabled) {
      sizeDescriptionControl.enable();
    }
    if (this.stockForm.invalid) {
      // Mark all fields as touched to trigger validation
      this.markFormGroupTouched(this.stockForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.stockForm.getRawValue(); // Get values including disabled fields

    if (this.isEditMode && this.stockId) {
      // Update existing stock
      this.stockService.updateStock({
        stockId: this.stockId,
        productName: formValue.productName,
        type: formValue.type,
        specs: formValue.specs,
        price: formValue.price,
        sizeDescription: formValue.sizeDescription,
        siteId: formValue.siteId,
        changedBy: formValue.createdBy
      }).subscribe({
        next: () => {
          this.router.navigate(['/stock/detail', this.stockId]);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error updating stock';
          this.isLoading = false;
        }
      });
    } else {
      // Process big packages with multiplier
      const processedBigPackages = this.processSmallPackagesWithMultiplier(formValue.bigPackages);

      // Create new stock with processed big packages
      this.stockService.createStock({
        productId: formValue.productId,
        productName: formValue.productName,
        type: formValue.type,
        specs: formValue.specs,
        price: formValue.price,
        sizeDescription: formValue.sizeDescription,
        siteId: formValue.siteId,
        bigPackages: processedBigPackages,
        createdBy: formValue.createdBy
      }).subscribe({
        next: (stock) => {
          this.router.navigate(['/stock/detail', stock.stockId]);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error creating stock';
          this.isLoading = false;
        }
      });
    }
  }

  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        if (control) {
          control.markAsTouched();
        }
      }
    });
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/stock/detail', this.stockId]);
    } else {
      this.router.navigate(['/stock']);
    }
  }
}
