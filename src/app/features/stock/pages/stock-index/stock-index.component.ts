import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { StockHeaderModel } from '@models/stock.model';
import { StockManagementService } from '@services/stock.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stock-index',
  templateUrl: './stock-index.component.html',
  styleUrls: ['./stock-index.component.scss']
})
export class StockIndexComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage: string = '';
  stocks: StockHeaderModel[] = [];
  filteredStocks: StockHeaderModel[] = [];

  // Filter panel properties
  showFilterPanel = false;
  searchFilter = new FormControl('');
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortOptions = [
    { label: 'Name', value: 'name', field: 'name' },
    { label: 'Created Date', value: 'createdAt', field: 'createdAt' }
  ];
  modalRef?: BsModalRef;

  breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Stock Management' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private stockService: StockManagementService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStocks();

    // Subscribe to search filter changes
    const searchSub = this.searchFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    this.subscriptions.push(searchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
      }
    });
  }

  navigateToDetail(stock: StockHeaderModel): void {
    this.router.navigate(['/stock/detail', stock.stockId]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/stock/add']);
  }

  editStock(stock: StockHeaderModel): void {
    this.router.navigate(['/stock/edit', stock.stockId]);
  }

  deleteStock(stock: StockHeaderModel): void {
    if (confirm(`Are you sure you want to delete ${stock.productName}?`)) {
      this.isLoading = true;
      this.stockService.deleteStock(stock.stockId).subscribe({
        next: () => {
          this.loadStocks();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error deleting stock';
          this.isLoading = false;
        }
      });
    }
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
}
