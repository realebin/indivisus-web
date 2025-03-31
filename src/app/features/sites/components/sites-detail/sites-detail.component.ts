import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { SiteDetailInquiryModelResponse } from '@models/site.model';
import { SiteService } from '@services/site.service';
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-sites-detail',
  templateUrl: './sites-detail.component.html',
  styleUrls: ['./sites-detail.component.scss'],
})
export class SitesDetailComponent implements OnInit {
  siteDetail: SiteDetailInquiryModelResponse | null = null;
  isLoading = true;

  defaultColDef: ColDef = {
    filter: true,
  };

  colDefs: ColDef[] = [
    { headerName: 'Product ID', field: 'idProduct', cellClass: 'vertical-center' },
    {
      headerName: 'Product Name',
      field: 'productName',
      cellClass: 'vertical-center',
      autoHeight: true,
      cellRenderer: (params: any) => {
        const productId = params.data.idProduct;
        const productName = params.value;
        const siteId = this.route.snapshot.paramMap.get('id');
        const productDetailUrl = `/site/${siteId}/detail/${productId}`;

        return `<a data-product-id="${productId}" class="product-link text-primary text-decoration-none">${productName}</a>`;
      },
    },
    { headerName: 'Type', field: 'description', cellClass: 'vertical-center' },
    {
      headerName: 'Size',
      field: 'sizes',
      autoHeight: true,
      cellClass: 'vertical-center',
      cellRenderer: (params: any) => {
        if (!params.value || !Array.isArray(params.value)) return '';
        const container = document.createElement('div');
        container.className = 'sizes-container';
        params.value.forEach((size: string) => {
          const sizeDiv = document.createElement('div');
          sizeDiv.className = 'size-item';
          sizeDiv.textContent = size;
          container.appendChild(sizeDiv);
        });
        return container;
      },
    },
    {
      headerName: 'Remaining Stock (Package)',
      field: 'remainingBigPackages',
      cellClass: 'vertical-center',
    },
    {
      headerName: 'Action',
      cellRenderer: (params: any) => {
        return '<a href="#" class="text-primary text-decoration-none">Edit</a>';
      },
      cellClass: 'vertical-center',
    },
  ];

  @HostListener('click', ['$event.target'])
  onClick(target: HTMLElement) {
    if (target.classList.contains('product-link')) {
      const productId = target.getAttribute('data-product-id');
      const siteId = this.route.snapshot.paramMap.get('id');
      if (productId && siteId) {
        const productDetailUrl = `/site/${siteId}/detail/${productId}`;

        console.log('Clicked product:', productId);
        console.log('Site ID:', siteId);
        console.log('Navigating to:', productDetailUrl);

        this.router.navigateByUrl(productDetailUrl);
      } else {
        console.log('Product ID or Site ID not found.');
      }
    }
  }

  navigateToProduct(url: string) {
    this.router.navigateByUrl(url);
  }

  rowData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const siteId = Number(params.get('id'));
      if (siteId) {
        this.loadSiteDetail(siteId);
      }
    });
  }

  loadSiteDetail(siteId: number): void {
    this.siteService.getSiteDetail(siteId).subscribe({
      next: (response) => {
        this.siteDetail = response;
        this.processDataForGrid();
      },
      error: (error) => {
        console.error('Error loading site details:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  processDataForGrid(): void {
    if (this.siteDetail?.items) {
      this.rowData = [];
      this.siteDetail.items.forEach((item) => {
        item.stocks?.forEach((stock) => {
          stock.bigPackages?.forEach((bigPackage) => {
            this.rowData.push({
              idProduct: stock.idProduct,
              productName: stock.productName,
              description: item.description,
              sizes:
                bigPackage.sizes?.map(
                  (size) => `${size.sizeDescription} ${size.sizeAmount}`
                ) || [],
              remainingBigPackages: stock.remainingBigPackages,
              bigPackage: bigPackage,
            });
          });
        });
      });
    }
  }
}
