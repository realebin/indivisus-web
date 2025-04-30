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
  bigPackages?: any[] = [];
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private router: Router
  ) { }

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
      .pipe(finalize(() => {
        // After loading site details, load the product details
        // We proceed to load product details regardless of site detail success or failure
        this.loadProductDetail();
      }))
      .subscribe({
        next: (response) => {
          this.siteDetail = response.site;
        },
        error: (error) => {
          console.error('Error loading site details:', error);
          this.errorMessage = error.message || 'Failed to load site details';

          // As a fallback, try to get basic site info from sites list
          this.siteService.getAllSites().subscribe({
            next: (allSitesResponse) => {
              const site = allSitesResponse.data.find(s => s.siteId === this.siteId);
              if (site) {
                this.siteDetail = site;
                this.errorMessage = ''; // Clear error message if we found the site
              }
            },
            error: () => {
              // Keep original error if fallback fails
            }
          });
        }
      });
  }

  loadProductDetail(): void {
    if (!this.productId || !this.siteId) {
      this.errorMessage = 'Product ID or Site ID is missing';
      this.isLoading = false;
      return;
    }

    // First get the stock headers to find the product details
    this.siteService.getStockHeadersBySite(this.siteId)
      .subscribe({
        next: (response) => {
          const foundProduct = response.stockItems.find(
            item => item.productId === this.productId
          );

          if (foundProduct) {
            this.productDetail = foundProduct;
            // Now load the package details for this product
            this.loadPackageDetails();
          } else {
            this.errorMessage = 'Product not found in this site';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading stock items:', error);
          this.errorMessage = error.message || 'Failed to load product details';
          this.isLoading = false;
        }
      });
  }

  loadPackageDetails(): void {
    // This would be a separate API call to get package details
    // For now, we'll simulate it with mock data
    setTimeout(() => {
      // Simulated package data - replace with actual API call when available
      this.bigPackages = [
        {
          idBigPackages: 'BP001',
          smallerPackages: [
            { sizeDescription: 'Small', sizeAmount: 25 },
            { sizeDescription: 'Medium', sizeAmount: 35 },
            { sizeDescription: 'Large', sizeAmount: 15 }
          ]
        },
        {
          idBigPackages: 'BP002',
          smallerPackages: [
            { sizeDescription: 'Small', sizeAmount: 30 },
            { sizeDescription: 'Medium', sizeAmount: 20 }
          ]
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  getTotalInPackage(pkg: any): number {
    if (!pkg.smallerPackages || pkg.smallerPackages.length === 0) return 0;

    return pkg.smallerPackages.reduce((total: number, smallPkg: any) => {
      return total + (smallPkg.sizeAmount || 0);
    }, 0);
  }

  goBackToSite(): void {
    if (this.siteId) {
      this.router.navigate(['/site', this.siteId]);
    } else {
      this.router.navigate(['/site']);
    }
  }
}
