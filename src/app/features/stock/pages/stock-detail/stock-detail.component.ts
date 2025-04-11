import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockHeaderModel } from '@models/stock.model';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BigPackageCreateComponent } from '../../components/big-package-create/big-package-create.component';
import { SmallPackageCreateComponent } from '../../components/small-package-create/small-package-create.component';
import { Subscription } from '@node_modules/rxjs/dist/types';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss'],
})
export class StockDetailComponent implements OnInit, OnDestroy {
  stockId: string;
  stock: StockHeaderModel;
  isLoading = true;
  errorMessage: string;
  modalRef?: BsModalRef;
  getStockById$: Subscription;
  markBigPackageAsOpen$: Subscription;
  deleteBigPackage$: Subscription;
  deleteSmallPackage$: Subscription;
  editStock$: Subscription;
  deleteStock$: Subscription;

  breadcrumbs = [{ label: 'Stock', url: '/stock' }, { label: 'Stock Detail' }];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockManagementService,
    private modalService: BsModalService
  ) {}

  ngOnDestroy(): void {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.getStockById$?.unsubscribe();
    this.markBigPackageAsOpen$?.unsubscribe();
    this.deleteBigPackage$?.unsubscribe();
    this.deleteSmallPackage$?.unsubscribe();
    this.editStock$?.unsubscribe();
    this.deleteStock$?.unsubscribe();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
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
    this.getStockById$ = this.stockService
      .getStockById(this.stockId)
      .subscribe({
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
        },
      });
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Big package actions
  openCreateBigPackageModal(): void {
    // Use the modal service to create a modal with the BigPackageCreateComponent
    const initialState = {
      stockId: this.stockId,
    };

    this.modalRef = this.modalService.show(BigPackageCreateComponent, {
      initialState,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      keyboard: false,
    });

    // Subscribe to the onSaved event to reload data when the modal is saved
    if (this.modalRef.content) {
      this.modalRef.content.onSaved.subscribe(() => {
        this.loadStockDetail();
      });
    }
  }

  markBigPackageAsOpen(packageNumber: string): void {
    const username = localStorage.getItem('username');
    if (!username) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isLoading = true;
    this.markBigPackageAsOpen$ = this.stockService
      .markBigPackageAsOpen(packageNumber, username)
      .subscribe({
        next: () => {
          this.loadStockDetail(); // Reload the data
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Error marking big package as open';
          this.isLoading = false;
        },
      });
  }

  deleteBigPackage(packageNumber: string): void {
    if (confirm('Are you sure you want to delete this big package?')) {
      this.isLoading = true;
      this.deleteBigPackage$ = this.stockService
        .deleteBigPackage(packageNumber)
        .subscribe({
          next: () => {
            this.loadStockDetail(); // Reload the data
          },
          error: (error) => {
            this.errorMessage = error.message || 'Error deleting big package';
            this.isLoading = false;
          },
        });
    }
  }

  // Small package actions
  openCreateSmallPackageModal(packageNumber: string): void {
    // Use the modal service to create a modal with the SmallPackageCreateComponent
    const initialState = {
      packageNumber: packageNumber,
    };

    this.modalRef = this.modalService.show(SmallPackageCreateComponent, {
      initialState,
      class: 'modal-dialog-centered',
      backdrop: 'static',
      keyboard: false,
    });

    // Subscribe to the onSaved event to reload data when the modal is saved
    if (this.modalRef.content) {
      this.modalRef.content.onSaved.subscribe(() => {
        this.loadStockDetail();
      });
    }
  }

  markSmallPackageAsOpen(packageId: string): void {
    const username = localStorage.getItem('username');
    if (!username) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isLoading = true;
    this.markBigPackageAsOpen$ = this.stockService
      .markSmallPackageAsOpen(packageId, username)
      .subscribe({
        next: () => {
          this.loadStockDetail(); // Reload the data
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Error marking small package as open';
          this.isLoading = false;
        },
      });
  }

  deleteSmallPackage(packageId: string): void {
    if (confirm('Are you sure you want to delete this small package?')) {
      this.isLoading = true;
      this.deleteBigPackage$ = this.stockService
        .deleteSmallPackage(packageId)
        .subscribe({
          next: () => {
            this.loadStockDetail(); // Reload the data
          },
          error: (error) => {
            this.errorMessage = error.message || 'Error deleting small package';
            this.isLoading = false;
          },
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
    if (
      confirm(
        'Are you sure you want to delete this stock? This will also delete all packages.'
      )
    ) {
      this.isLoading = true;
      this.deleteStock$ = this.stockService
        .deleteStock(this.stockId)
        .subscribe({
          next: () => {
            this.router.navigate(['/stock']);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Error deleting stock';
            this.isLoading = false;
          },
        });
    }
  }
}
