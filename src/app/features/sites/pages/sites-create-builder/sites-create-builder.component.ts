import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteCreateRequest, SiteUpdateRequest } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sites-create-builder',
  templateUrl: './sites-create-builder.component.html',
  styleUrl: './sites-create-builder.component.scss'
})
export class SitesCreateBuilderComponent implements OnInit {
  siteId?: string;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  isSiteFormValid = false;
  errorMessage = '';

  siteRequest: SiteCreateRequest = {
    siteName: '',
    address: '',
    picUserId: '',
    phone: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const siteId = params.get('id');
      if (siteId) {
        this.siteId = siteId;
        this.isEditMode = true;
        this.loadSiteDetails(siteId);
      }
    });
  }

  loadSiteDetails(siteId: string): void {
    this.isLoading = true;
    this.siteService.getSiteDetail(siteId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          const site = response.site;
          this.siteRequest = {
            siteName: site.siteName,
            address: site.address,
            picUserId: site.picUserId,
            phone: site.phone
          };
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load site details';
        }
      });
  }

  onSiteFormDataChange(data: SiteCreateRequest): void {
    this.siteRequest = data;
  }

  onSiteFormValidityChange(isValid: boolean): void {
    this.isSiteFormValid = isValid;
  }

  submitSiteForm(): void {
    if (!this.isSiteFormValid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditMode && this.siteId) {
      const updateRequest: SiteUpdateRequest = {
        siteId: this.siteId,
        ...this.siteRequest
      };

      this.siteService.updateSite(updateRequest)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => {
            this.router.navigate(['/site']);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to update site';
          }
        });
    } else {
      this.siteService.createSite(this.siteRequest)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => {
            this.router.navigate(['/site']);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to create site';
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/site']);
  }
}
