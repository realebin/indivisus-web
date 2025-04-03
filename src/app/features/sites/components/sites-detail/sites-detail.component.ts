import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteDetail, SiteStockHeader } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { finalize } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { Action } from 'src/app/shared-components/action-buttons/action-buttons.component';

@Component({
  selector: 'app-sites-detail',
  templateUrl: './sites-detail.component.html',
  styleUrls: ['./sites-detail.component.scss'],
})
export class SitesDetailComponent implements OnInit {
  isLoading = true;
  siteDetail?: SiteDetail;
  errorMessage = '';
  currentSiteId?: string;
  stockHeaders: SiteStockHeader[] = [];

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
      headerName: 'Type',
      field: 'type',
      cellClass: 'vertical-center',
      width: 120
    },
    {
      headerName: 'Remaining Stock',
      field: 'remainingStock',
      cellClass: 'vertical-center text-center',
      width: 120
    },
    {
      headerName: 'Created',
      field: 'createdAt',
      cellClass: 'vertical-center',
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
      width: 130
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

 // Data for the grid
 rowData: any[] = [];

 constructor(
   private route: ActivatedRoute,
   private siteService: SiteService,
   private router: Router,
   private modalService: BsModalService
 ) {}

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
   this.siteService.getSiteDetail(siteId)
     .pipe(finalize(() => this.isLoading = false))
     .subscribe({
       next: (response) => {
         this.siteDetail = response.site;
         this.processDataForGrid();
       },
       error: (error) => {
         console.error('Error loading site details:', error);
         this.errorMessage = error.message || 'Failed to load site details';
       }
     });
 }

 processDataForGrid(): void {
   if (!this.siteDetail?.items) {
     this.rowData = [];
     return;
   }

   const processed: any[] = [];

   this.siteDetail.items.forEach(item => {
     if (!item.stocks) return;

     item.stocks.forEach(stock => {
       processed.push({
         productId: stock.productId,
         productName: stock.productName,
         type: item.description,
         sizes: stock.sizes || [],
         remainingStock: stock.remainingBigPackages,
         bigPackages: stock.bigPackages || [],
         createdAt: this.siteDetail?.createdAt
       });
     });
   });

   this.rowData = processed;
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

 handleAction(event: {type: string, item: any, id?: string}): void {
   switch (event.type) {
     case 'edit':
       // Open edit site modal
       console.log('Edit site:', this.siteDetail);
       break;
     case 'custom':
       // Back to sites action
       this.router.navigate(['/site']);
       break;
     default:
       break;
   }
 }

 goBack(): void {
   this.router.navigate(['/site']);
 }
}
