import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteDetail, SiteSpecificProduct, SiteStockHeader } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { finalize } from 'rxjs';
import { ColDef } from 'ag-grid-community';


@Component({
  selector: 'app-sites-detail',
  templateUrl: './sites-detail.component.html',
  styleUrls: ['./sites-detail.component.scss'],
})
export class SitesDetailComponent implements OnInit {
  isLoading = true;
  isLoadingStocks = false;
  siteDetail?: SiteDetail;
  errorMessage = '';
  stockErrorMessage = '';
  specificStockErrorMessage = '';
  currentSiteId?: string;
  stockHeaders: SiteStockHeader[] = [];
  specificStockItems: SiteSpecificProduct[] = [];
  rowData: any[] = [];
  currentTab = 'Kain'; // Default to Kain tab

  // AG Grid properties
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  colDefs: ColDef[] = [
    {
      headerName: 'Product ID',
      field: 'productId',
      width: 120,
      cellClass: 'vertical-center'
    },
    {
      headerName: 'Product Name',
      field: 'productName',
      cellClass: 'vertical-center',
      autoHeight: true,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const productId = params.data.productId;
        return `<a href="javascript:void(0)" data-product-id="${productId}" class="product-link text-primary">${params.value}</a>`;
      },
      flex: 2
    },
    {
      headerName: 'Remaining Packages',
      field: 'remainingTotalPackages',
      cellClass: 'vertical-center text-center',
      width: 180
    },
    {
      headerName: 'Remaining Stock',
      field: 'remainingTotalStock',
      cellClass: 'vertical-center text-center',
      width: 160,
      valueFormatter: (params: any) => {
        if (params.value === null || params.value === undefined) return '';
        return `${params.value} ${params.data.sizeDescription || ''}`;
      }
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        const container = document.createElement('div');
        container.className = 'd-flex justify-content-center';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-outline-primary me-2';
        viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
        viewBtn.title = 'View Details';
        viewBtn.setAttribute('data-product-id', params.data.productId);
        viewBtn.setAttribute('data-action', 'view');

        container.appendChild(viewBtn);

        return container;
      },
      width: 100,
      suppressSizeToFit: true,
      cellClass: 'vertical-center',
      sortable: false,
      filter: false
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const siteId = params.get('id');
      if (siteId) {
        this.currentSiteId = siteId;
        this.loadSiteDetail(siteId);
      } else {
        this.errorMessage = 'No site ID provided';
        this.isLoading = false;
      }
    });
  }

  loadSiteDetail(siteId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.siteService.getSiteDetail(siteId)
      .pipe(finalize(() => {
        this.isLoading = false;
        // Load stock headers separately
        this.loadStockHeaders(siteId, this.currentTab);
      }))
      .subscribe({
        next: (response) => {
          this.siteDetail = response.site;
        },
        error: (error) => {
          console.error('Error loading site details:', error);
          this.errorMessage = error.message || 'Failed to load site details';
        }
      });
  }

  loadStockHeaders(siteId: string, productType?: string): void {
    this.isLoadingStocks = true;
    this.specificStockErrorMessage = '';
    this.rowData = [];

    if (productType) {
      this.siteService.getSpecificStockBySite(siteId, productType)
        .pipe(finalize(() => this.isLoadingStocks = false))
        .subscribe({
          next: (response) => {
            this.specificStockItems = response.data || [];
            this.rowData = this.specificStockItems;
          },
          error: (error) => {
            console.error('Error loading stock headers:', error);
            this.specificStockErrorMessage = 'Failed to load stock information';
          }
        });
    }
    else {
      this.siteService.getStockHeadersBySite(siteId)
        .pipe(finalize(() => this.isLoadingStocks = false))
        .subscribe({
          next: (response) => {
            this.stockHeaders = response.stockItems || [];
            this.rowData = this.stockHeaders;
          },
          error: (error) => {
            console.error('Error loading stock headers:', error);
            this.stockErrorMessage = 'Failed to load stock information';
          }
        });
    }
  }

  switchTab(tabName: string): void {
    this.currentTab = tabName;
    if (this.currentSiteId) {
      this.loadStockHeaders(this.currentSiteId, tabName);
    }
  }

  onGridCellClicked(event: any): void {
    if (event.column.getColId() === 'productName' && event.value) {
      this.navigateToProductDetail(event.data.productId);
    } else if (event.colDef.cellRenderer && event.event.target.getAttribute('data-action') === 'view') {
      const productId = event.event.target.getAttribute('data-product-id');
      if (productId) {
        this.navigateToProductDetail(productId);
      }
    }
  }

  navigateToProductDetail(productId: string): void {
    if (this.currentSiteId) {
      this.router.navigate(['/site', this.currentSiteId, 'product', productId]);
    }
  }

  handleAction(event: { type: string, item: any, id?: string }): void {
    switch (event.type) {
      case 'edit':
        // Navigate to edit site page
        this.router.navigate(['/site/edit', this.currentSiteId]);
        break;
      case 'custom':
        // Back to sites action
        this.goBack();
        break;
      default:
        break;
    }
  }

  goBack(): void {
    this.router.navigate(['/site']);
  }
  navigateToEdit(): void {
    this.router.navigate(['/site/edit', this.currentSiteId]);
  }
}
