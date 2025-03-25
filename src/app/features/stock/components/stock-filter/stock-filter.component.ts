import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import {
  StockItems,
  StockFilterPrepareModelResponse,
} from '@models/stock.model';

@Component({
  selector: 'app-stock-filter',
  templateUrl: './stock-filter.component.html',
  styleUrls: ['./stock-filter.component.scss'],
})
export class StockFilterComponent implements OnInit {
  @Input() filterPrepare: StockFilterPrepareModelResponse = {
    epoch: 0,
    sites: [],
  };

  @Input() stocks: StockItems[] = [];
  @Output() filterChange = new EventEmitter<StockItems[]>();

  selectedNames: string[] = [];
  selectedSites: number[] = [];
  searchText: string = '';
  stockSearchText: string = '';
  siteSearchText: string = '';

  filteredStockItems: StockItems[] = [];
  filteredSites: { id: number; name: string }[] = [];

  ngOnInit() {
    // Dump initial data to console
    // console.log('Initial filterPrepare:', JSON.stringify(this.filterPrepare));
    // console.log(
    //   'Initial stocks data structure:',
    //   JSON.stringify(this.stocks.slice(0, 1))
    // );
    this.initializeSites();
    this.filteredStockItems = [...this.stocks];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterPrepare'] && this.filterPrepare?.sites?.length) {
      // console.log('filterPrepare changed:', this.filterPrepare);
      this.initializeSites();
    }
    if (changes['stocks'] && this.stocks?.length) {
      // console.log('stocks changed, new length:', this.stocks.length);
      this.filteredStockItems = [...this.stocks];
    }
  }

  initializeSites() {
    if (this.filterPrepare?.sites?.length) {
      this.filteredSites = this.filterPrepare.sites.map((site) => ({
        id: site.id,
        name: site.name,
      }));
      // console.log('Sites initialized:', this.filteredSites);
    } else {
      // console.warn('filterPrepare.sites is undefined or empty');
      this.filteredSites = [];
    }
  }

  onStockNameChange(name: string, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedNames.push(name);
    } else {
      this.selectedNames = this.selectedNames.filter((n) => n !== name);
    }
    this.alternativeApplyFilter(); // Use alternative method
  }

  removeStockName(name: string) {
    this.selectedNames = this.selectedNames.filter((n) => n !== name);
    this.alternativeApplyFilter(); // Use alternative method
  }

  onSiteChange(siteId: number, event: Event) {
    const target = event.target as HTMLInputElement;
    // console.log(`Site ${siteId} checkbox change:`, target.checked);

    if (target.checked) {
      this.selectedSites.push(siteId);
    } else {
      this.selectedSites = this.selectedSites.filter((id) => id !== siteId);
    }
    // console.log('Current selected sites:', this.selectedSites);
    this.alternativeApplyFilter();
  }

  removeSite(siteId: number) {
    this.selectedSites = this.selectedSites.filter((id) => id !== siteId);
    // console.log('After removal, selected sites:', this.selectedSites);
    this.alternativeApplyFilter();
  }

  applyFilter() {
    const searchLower = this.searchText.toLowerCase();
    const filteredStocks: StockItems[] = this.stocks
      .map((item: StockItems) => {
        const matchingStocks = item.stocks?.filter((stock) => {
          // Product name filtering

          const matchesSearch =
            !this.searchText ||
            (stock.productName?.toLowerCase() || '').includes(searchLower) ||
            (stock.idProduct?.toLowerCase() || '').includes(searchLower) ||
            stock.bigPackages?.some((pkg) =>
              (pkg.locationName || '').toLowerCase().includes(searchLower)
            ) ||
            stock.bigPackages?.some((pkg) =>
              (pkg.sizes?.some((size) => size?.sizeDescription?.toLowerCase().includes(searchLower)))
            ) ||
            stock.bigPackages?.some((pkg) =>
              (pkg.smallerPackages?.some((smaller) => smaller?.sizeDescription?.toLowerCase().includes(searchLower)))
            );
          return matchesSearch;
        });

        return { ...item, stocks: matchingStocks };
      })
      .filter((item) => item.stocks && item.stocks.length > 0);
    this.filterChange.emit(filteredStocks);
  }

  filterStockList() {
    const searchLower = this.stockSearchText.toLowerCase();
    this.filteredStockItems = this.stocks
      .map((item) => {
        const filteredStocks = item.stocks?.filter((stock) =>
          (stock.productName || '').toLowerCase().includes(searchLower)
        );
        return { ...item, stocks: filteredStocks };
      })
      .filter((item) => item.stocks && item.stocks.length > 0);
  }

  filterSiteList() {
    if (!this.filterPrepare?.sites?.length) {
      console.warn('filterPrepare.sites is not available for filtering');
      return;
    }

    const searchLower = this.siteSearchText.toLowerCase();
    this.filteredSites = this.filterPrepare.sites
      .filter((site) => site.name.toLowerCase().includes(searchLower))
      .map((site) => ({ id: site.id, name: site.name }));
  }

  getSiteName(siteId: number): string {
    return (
      this.filterPrepare?.sites?.find((site) => site.id === siteId)?.name ||
      `Site ID ${siteId}`
    );
  }

  alternativeApplyFilter() {
    // console.log('Using alternative filtering approach');

    // Build a mapping of site IDs to product IDs
    const siteIdToProductsMap = this.buildSiteToProductsMap();
    // console.log(
    //   'Site to product mapping built:',
    //   Array.from(siteIdToProductsMap.entries())
    //     .map(
    //       ([siteId, products]) => `Site ${siteId}: ${products.size} products`
    //     )
    //     .join(', ')
    // );

    // Start with all stocks
    let filteredResult = [...this.stocks];

    // Apply filters in sequence
    filteredResult = this.applySiteFilter(filteredResult, siteIdToProductsMap);
    filteredResult = this.applyNameFilter(filteredResult);
    filteredResult = this.applySearchFilter(filteredResult);

    // console.log(
    //   `Filtering found ${filteredResult.length} categories with matching products`
    // );
    this.filterChange.emit(filteredResult);
  }

  /**
   * Builds a mapping between site IDs and the products available at each site
   */
  private buildSiteToProductsMap(): Map<number, Set<string>> {
    const siteIdToProductsMap = new Map<number, Set<string>>();

    this.stocks.forEach((category) => {
      category.stocks?.forEach((stock) => {
        if (!stock.bigPackages || !stock.idProduct) return;

        stock.bigPackages.forEach((bp) => {
          const siteId = this.determineSiteId(bp);
          if (siteId === null) return;

          if (!siteIdToProductsMap.has(siteId)) {
            siteIdToProductsMap.set(siteId, new Set<string>());
          }
          siteIdToProductsMap.get(siteId)?.add(stock.idProduct);
        });
      });
    });

    return siteIdToProductsMap;
  }

  /**
   * Extracts a numeric site ID from a package location
   */
  private determineSiteId(bp: {
    idLocation: string;
    locationName: string;
  }): number | null {
    // Try to use the locationName directly if it's a number
    if (typeof bp.locationName === 'number') {
      return bp.locationName;
    }

    // Try to parse locationName as a number
    if (
      typeof bp.locationName === 'string' &&
      !isNaN(Number(bp.locationName))
    ) {
      return Number(bp.locationName);
    }

    // Try to extract from idLocation
    if (bp.idLocation && !isNaN(Number(bp.idLocation))) {
      return Number(bp.idLocation);
    }

    // Try to match locationName with site names
    if (typeof bp.locationName === 'string' && this.filterPrepare?.sites) {
      const matchingSite = this.filterPrepare.sites.find(
        (site) => site.name.toLowerCase() === bp.locationName.toLowerCase()
      );
      if (matchingSite) {
        return matchingSite.id;
      }
    }

    return null;
  }

  /**
   * Applies site filtering based on selected sites
   */
  private applySiteFilter(
    stocks: StockItems[],
    siteIdToProductsMap: Map<number, Set<string>>
  ): StockItems[] {
    if (this.selectedSites.length === 0) {
      return stocks;
    }

    const relevantProductIds = new Set<string>();

    // Collect all products from the selected sites
    this.selectedSites.forEach((siteId) => {
      const productsAtSite = siteIdToProductsMap.get(siteId);
      if (productsAtSite) {
        productsAtSite.forEach((productId) =>
          relevantProductIds.add(productId)
        );
      }
    });

    // console.log(
    //   `Found ${relevantProductIds.size} products across selected sites`
    // );

    // Filter stocks to only include products at selected sites
    return stocks
      .map((category) => {
        const filteredStocks = category.stocks?.filter(
          (stock) => stock.idProduct && relevantProductIds.has(stock.idProduct)
        );
        return { ...category, stocks: filteredStocks };
      })
      .filter((category) => category.stocks && category.stocks.length > 0);
  }

  /**
   * Applies name filtering based on selected product names
   */
  private applyNameFilter(stocks: StockItems[]): StockItems[] {
    if (this.selectedNames.length === 0) {
      return stocks;
    }

    return stocks
      .map((category) => {
        const filteredStocks = category.stocks?.filter((stock) =>
          this.selectedNames.includes(stock.productName || '')
        );
        return { ...category, stocks: filteredStocks };
      })
      .filter((category) => category.stocks && category.stocks.length > 0);
  }

  /**
   * Applies text search filtering
   */
  private applySearchFilter(stocks: StockItems[]): StockItems[] {
    if (!this.searchText) {
      return stocks;
    }

    const searchLower = this.searchText.toLowerCase();

    return stocks
      .map((category) => {
        const filteredStocks = category.stocks?.filter(
          (stock) =>
            (stock.productName?.toLowerCase() || '').includes(searchLower) ||
            (stock.idProduct?.toLowerCase() || '').includes(searchLower)
        );
        return { ...category, stocks: filteredStocks };
      })
      .filter((category) => category.stocks && category.stocks.length > 0);
  }

  clearFilters() {
    this.selectedNames = [];
    this.selectedSites = [];
    this.searchText = '';
    this.stockSearchText = '';
    this.siteSearchText = '';
    this.filteredStockItems = [...this.stocks];
    this.filteredSites = this.filterPrepare?.sites?.map((site) => ({
      id: site.id,
      name: site.name,
    })) || [];
    this.alternativeApplyFilter();
  }
}
