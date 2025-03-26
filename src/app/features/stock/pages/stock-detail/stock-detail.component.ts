import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockHeaderModel } from '@models/stock.model';
import { StockManagementService } from '@services/stock.service';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss']
})
export class StockDetailComponent implements OnInit {
  stockId: string;
  stock: StockHeaderModel;
  isLoading = true;
  errorMessage: string;
  modalRef?: BsModalRef;

  breadcrumbs = [
    { label: 'Stock', url: '/stock' },
    { label: 'Stock Detail' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockManagementService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.stockId = params.get('id') || '';
      if (this.stockId) {
        this.loadStockDetail();
      } else {
        this.errorMessage = 'Stock ID not provided';
        this.isLoading = false;
      }
    });
  }

loadStockDetail(): void {
  this.isLoading = true;
  this.stockService.getStockById(this.stockId).subscribe({
    next: (stock) => {
      this.stock = stock;
      if (stock && stock.productName) {
        this.breadcrumbs[1].label = stock.productName;
      }
      this.isLoading = false;
    },
    error: (error) => {
      this.errorMessage = error.message || 'Error loading stock details';
      this.isLoading = false;
    }
  });
}

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Big package actions
  openCreateBigPackageModal(template: any): void {
    this.modalRef = this.modalService.show(template);
  }

  markBigPackageAsOpen(packageNumber: string): void {
    const username = localStorage.getItem('username');
    if (!username) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isLoading = true;
    this.stockService.markBigPackageAsOpen(packageNumber, username).subscribe({
      next: () => {
        this.loadStockDetail(); // Reload the data
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error marking big package as open';
        this.isLoading = false;
      }
    });
  }

  deleteBigPackage(packageNumber: string): void {
    if (confirm('Are you sure you want to delete this big package?')) {
      this.isLoading = true;
      this.stockService.deleteBigPackage(packageNumber).subscribe({
        next: () => {
          this.loadStockDetail(); // Reload the data
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error deleting big package';
          this.isLoading = false;
        }
      });
    }
  }

  // Small package actions
  openCreateSmallPackageModal(packageNumber: string, template: any): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-dialog-centered' });
    // Store the package number for later use
    this.modalRef.content = { packageNumber };
  }

  markSmallPackageAsOpen(packageId: string): void {
    const username = localStorage.getItem('username');
    if (!username) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isLoading = true;
    this.stockService.markSmallPackageAsOpen(packageId, username).subscribe({
      next: () => {
        this.loadStockDetail(); // Reload the data
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error marking small package as open';
        this.isLoading = false;
      }
    });
  }

  deleteSmallPackage(packageId: string): void {
    if (confirm('Are you sure you want to delete this small package?')) {
      this.isLoading = true;
      this.stockService.deleteSmallPackage(packageId).subscribe({
        next: () => {
          this.loadStockDetail(); // Reload the data
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error deleting small package';
          this.isLoading = false;
        }
      });
    }
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/stock']);
  }

  editStock(): void {
    this.router.navigate(['/stock/edit', this.stockId]);
  }

  deleteStock(): void {
    if (confirm('Are you sure you want to delete this stock? This will also delete all packages.')) {
      this.isLoading = true;
      this.stockService.deleteStock(this.stockId).subscribe({
        next: () => {
          this.router.navigate(['/stock']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error deleting stock';
          this.isLoading = false;
        }
      });
    }
  }
}
