import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { StockHeaderModel } from '@models/stock.model';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { SortOption } from 'src/app/shared-components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-stock-index',
  templateUrl: './stock-index.component.html',
  styleUrls: ['./stock-index.component.scss'],
})
export class StockIndexComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage: string;
  stocks: StockHeaderModel[] = [];
  filteredStocks: StockHeaderModel[] = [];
  modalRef?: BsModalRef;

  // Navigation to detail/create pages
  navigateToDetail(stockId: string): void {
    this.router.navigate(['/stock/detail', stockId]);
  }

  openCreateStockModal(): void {
    this.router.navigate(['/stock/add-stocks']);
  }

  // Delete functionality
  deleteStock(stockId: string): void {
    if (confirm('Are you sure you want to delete this stock?')) {
      this.isLoading = true;
      this.stockService.deleteStock(stockId).subscribe({
        next: () => {
          this.loadStocks();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error deleting stock';
          this.isLoading = false;
        },
      });
    }
  }

  // Filter panel properties
  showFilterPanel = false;
  searchFilter = new FormControl('');
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Sort options for the filter panel
  sortOptions: SortOption[] = [
    { field: 'productName', label: 'Product Name' },
    { field: 'type', label: 'Type' },
    { field: 'remainingStock', label: 'Remaining Stock' },
    { field: 'price', label: 'Price' },
    { field: 'siteName', label: 'Site' },
  ];

  private subscriptions: Subscription[] = [];

  @ViewChild('createStockModal') createStockModal: TemplateRef<any>;
  // @ViewChild(StockFilterComponent) stockFilterComponent: StockFilterComponent;

  constructor(
    private stockService: StockManagementService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStocks();

    // Subscribe to search filter changes
    const searchSub = this.searchFilter.valueChanges.subscribe((value) => {
      this.applyFilters();
    });
    this.subscriptions.push(searchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  // Filter functions
  applyFilters(): void {
    let filtered = [...this.stocks];

    // Apply search filter
    if (this.searchFilter.value) {
      const searchTerm = this.searchFilter.value.toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.productName.toLowerCase().includes(searchTerm) ||
          stock.type.toLowerCase().includes(searchTerm) ||
          stock.stockId.toLowerCase().includes(searchTerm) ||
          stock.productId.toLowerCase().includes(searchTerm) ||
          stock.siteName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => {
        const aValue = a[this.sortField as keyof StockHeaderModel];
        const bValue = b[this.sortField as keyof StockHeaderModel];

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return this.sortDirection === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        // Handle string values
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        return this.sortDirection === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }

    this.filteredStocks = filtered;
  }

  onSortChange(event: { field: string }): void {
    if (this.sortField === event.field) {
      // Toggle direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and default to ascending
      this.sortField = event.field;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  resetFilters(): void {
    this.searchFilter.setValue('');
    this.sortField = '';
    this.sortDirection = 'asc';
    this.filteredStocks = [...this.stocks];
  }

  loadStocks(): void {
    this.isLoading = true;
    this.stockService.getAllStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.filteredStocks = [...stocks];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading stocks';
        this.isLoading = false;
      },
    });
  }
}
