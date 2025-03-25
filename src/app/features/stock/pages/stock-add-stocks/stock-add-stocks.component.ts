import { Component } from '@angular/core';

interface Package {
  packageNumber: string;
  entries: { quantity: number; unit: string }[];
}
@Component({
  selector: 'app-stock-add-stocks',
  templateUrl: './stock-add-stocks.component.html',
  styleUrl: './stock-add-stocks.component.scss'
})
export class StockAddStocksComponent {
  productName: string = '';
  type: string = '';
  size: string = '';
  site: string = '';
  price: string = '';
  packages: Package[] = [];
  newPackage: { packageNumber: string; quantity: number; unit: string } = { packageNumber: '', quantity: 0, unit: '' };
  breadcrumbs = [
    { label: 'Stock', url: '/stock' }, // Replace '/stock' with the actual URL
    { label: 'Add Stock' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  addPackage(): void {
    if (this.newPackage.packageNumber && this.newPackage.quantity && this.newPackage.unit) {
      const existingPackage = this.packages.find(p => p.packageNumber === this.newPackage.packageNumber);

      if (existingPackage) {
        existingPackage.entries.push({ quantity: this.newPackage.quantity, unit: this.newPackage.unit });
      } else {
        this.packages.push({
          packageNumber: this.newPackage.packageNumber,
          entries: [{ quantity: this.newPackage.quantity, unit: this.newPackage.unit }]
        });
      }

      this.newPackage = { packageNumber: '', quantity: 0, unit: '' }; // Reset new package form
    }
  }

  editPackage(index: number): void {
    // Implement edit logic here
    console.log('Edit package at index:', index);
  }

  deletePackage(index: number): void {
    this.packages.splice(index, 1);
  }

  createStock(): void {
    // Implement stock creation logic here
    console.log('Create stock:', {
      productName: this.productName,
      type: this.type,
      size: this.size,
      site: this.site,
      price: this.price,
      packages: this.packages
    });
  }

  cancel(): void {
    // Implement cancel logic here
    console.log('Cancel');
  }
}
