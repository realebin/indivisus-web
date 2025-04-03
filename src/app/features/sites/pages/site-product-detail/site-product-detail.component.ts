import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteDetail } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-site-product-detail',
  templateUrl: './site-product-detail.component.html',
  styleUrls: ['./site-product-detail.component.scss']
})
export class SiteProductDetailComponent implements OnInit {
  isLoading = true;
  siteId?: string;
  productId?: string;
  siteDetail?: SiteDetail;
  productDetail?: any;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.siteId = params.get('id') || undefined;
      this.productId = params.get('productId') || undefined;

      if (this.siteId && this.productId) {
        this.loadSiteAndProductDetail();
      } else {
        this.errorMessage = 'Site ID or Product ID is missing';
        this.isLoading = false;
      }
    });
  }

  loadSiteAndProductDetail(): void {
    if (!this.siteId) return;

    this.isLoading = true;
    this.siteService.getSiteDetail(this.siteId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.siteDetail = response.site;
          this.findProductInSite();
        },
        error: (error) => {
          console.error('Error loading site details:', error);
          this.errorMessage = error.message || 'Failed to load site details';
        }
      });
  }

  findProductInSite(): void {
    if (!this.productId) {
      this.errorMessage = 'Product ID is missing';
      return;
    }

    this.isLoading = true;
    this.siteService.getStockHeadersBySite(this.siteId!)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          const foundProduct = response.stockItems.find(
            item => item.productId === this.productId
          );

          if (foundProduct) {
            this.productDetail = foundProduct;
          } else {
            this.errorMessage = 'Product not found in this site';
          }
        },
        error: (error) => {
          console.error('Error loading stock items:', error);
          this.errorMessage = error.message || 'Failed to load product details';
        }
      });
  }

  goBackToSite(): void {
    if (this.siteId) {
      this.router.navigate(['/site', this.siteId]);
    } else {
      this.router.navigate(['/site']);
    }
  }

  getPrimarySize(sizes: any[]): string {
    if (!sizes || sizes.length === 0) return 'N/A';
    return `${sizes[0].sizeAmount} ${sizes[0].sizeDescription}`;
  }

  getTotalPackages(productDetail: any): number {
    if (!productDetail?.bigPackagesCount) return 0;
    return productDetail.bigPackagesCount;
  }

  getSizeSummary(productDetail: any): string {
    if (!productDetail) return 'No size information';
    return `${productDetail.remainingTotalStock} ${productDetail.sizeDescription}`;
  }
}
