import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'; // Import ViewChild
import { StockFilterPrepareModelResponse, StockItems } from '@models/stock.model';
import { Subscription } from 'rxjs';
import { StockService } from '@services/stock.service';
import { Router } from '@angular/router';
import { StockFilterComponent } from '@features/stock/components';

@Component({
  selector: 'app-stock-index',
  templateUrl: './stock-index.component.html',
  styleUrls: ['./stock-index.component.scss'],
})
export class StockIndexComponent implements OnInit, OnDestroy {
  @ViewChild(StockFilterComponent) stockFilterComponent: StockFilterComponent; // Add ViewChild

  activeTab: string = '';
  isLoading: boolean = false;
  stocks: StockItems[] = [];
  filterPrepare: StockFilterPrepareModelResponse;
  inquiryStock$: Subscription;
  inquiryFilter$: Subscription;
  filteredStocks: StockItems[] = [];
  tabs: { tabName: string }[] = [];
  currentTabStocks: StockItems[] = [];

  constructor(private stockService: StockService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this.inquiryStock$?.unsubscribe();
    this.inquiryFilter$?.unsubscribe();
  }

  ngOnInit() {
    this.inquiryStocks();
    this.prepareStockFilter();
  }

  inquiryStocks(): void {
    this.isLoading = true;
    this.inquiryStock$ = this.stockService.inquiryStocks().subscribe({
      next: (response) => {
        this.stocks = response.items ?? [];
        this.tabs = this.stocks.map((item) => ({ tabName: item.description ?? '' }));
        if (this.tabs.length > 0) {
          this.activeTab = this.tabs[0].tabName;
          this.filterStocksByTab();
        }
      },
      error: (error) => {
        console.error('Error loading stocks:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  prepareStockFilter(): void {
    this.isLoading = true;
    this.inquiryFilter$ = this.stockService.prepareStockFilter().subscribe({
      next: (response) => {
        this.filterPrepare = response;
      },
      error: (error) => {
        console.error('Error loading filter:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onFilterChange(filterCriteria: any) {
    let filtered = this.currentTabStocks.find(item => item.description === this.activeTab)?.stocks || [];
    if (filterCriteria.name) {
      filtered = filtered.filter(stock => stock.productName === filterCriteria.name);
    }
    if (filterCriteria.site) {
      filtered = filtered.filter(stock => stock.bigPackages?.some(pkg => pkg.locationName === filterCriteria.site));
    }
    if (filterCriteria.searchText) {
      const searchTextLower = filterCriteria.searchText.toLowerCase();
      filtered = filtered.filter(stock => stock.productName?.toLowerCase().includes(searchTextLower));
    }
    const currentTabStock = this.currentTabStocks.find(item => item.description === this.activeTab);
    if (currentTabStock) {
      this.filteredStocks = [{ ...currentTabStock, stocks: filtered }];
    }
  }

  updateFilteredStocks(filtered: StockItems[]) {
    this.filteredStocks = filtered;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.filterStocksByTab();
    this.clearFilters();
    this.cdr.detectChanges();
  }

  filterStocksByTab() {
    this.currentTabStocks = this.stocks.filter((item) => item.description === this.activeTab);
    this.filteredStocks = [...this.currentTabStocks];

    // ! Notes : Manually trigger change detection because the data on html cannot keep up duh.
    this.cdr.detectChanges();
}

  clearFilters() {
    if (this.stockFilterComponent) {
      this.stockFilterComponent.clearFilters();
    }
  }
}
