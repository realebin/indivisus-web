
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { SiteCreateRequest, SiteUpdateRequest, SiteWithOverview } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs';
import { SortOption } from 'src/app/shared-components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-sites-index',
  templateUrl: './sites-index.component.html',
  styleUrls: ['./sites-index.component.scss'],
})
export class SitesIndexComponent implements OnInit {
  @ViewChild('createSiteModal') createSiteModal!: TemplateRef<any>;

  isLoading = false;
  isSubmitting = false;
  sites: SiteWithOverview[] = [];
  filteredSites: SiteWithOverview[] = [];
  modalRef?: BsModalRef;
  errorMessage = '';
  formErrorMessage = '';

  // Form related properties
  isSiteFormValid = false;
  isEditMode = false;
  selectedSite?: SiteWithOverview;

  // Filter panel properties
  searchFilter = new FormControl('');
  sortField = 'siteName';
  sortDirection: 'asc' | 'desc' = 'asc';

  siteRequest: SiteCreateRequest = {
    siteName: '',
    address: '',
    picUserId: '',
    phone: '' // Added phone field according to UI requirements
  };

  constructor(
    private siteService: SiteService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSites();

    // Subscribe to search filter changes
    this.searchFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadSites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.siteService.getSitesWithOverview()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.sites = response.sites;
          this.filteredSites = [...this.sites];
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load sites';
        }
      });
  }

  openCreateSiteModal(): void {
    // Instead of showing the modal, navigate to the create page
    this.router.navigate(['/site/create']);
  }

  openEditSiteModal(site: SiteWithOverview): void {
    // Instead of showing the modal, navigate to the edit page
    this.router.navigate(['/site/edit', site.siteId]);
  }

  onSiteFormDataChange(data: SiteCreateRequest): void {
    this.siteRequest = data;
  }

  onSiteFormValidityChange(isValid: boolean): void {
    this.isSiteFormValid = isValid;
  }

  submitSiteForm(): void {
    if (this.isEditMode) {
      this.updateSite();
    } else {
      this.createSite();
    }
  }

  createSite(): void {
    if (!this.isSiteFormValid) {
      return;
    }

    this.isSubmitting = true;
    this.formErrorMessage = '';

    this.siteService.createSite(this.siteRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.modalRef?.hide();
          this.loadSites();
          this.resetSiteForm();
        },
        error: (error) => {
          this.formErrorMessage = error.message || 'Failed to create site';
        }
      });
  }

  updateSite(): void {
    if (!this.isSiteFormValid || !this.selectedSite) {
      return;
    }

    this.isSubmitting = true;
    this.formErrorMessage = '';

    const updateRequest: SiteUpdateRequest = {
      siteId: this.selectedSite.siteId,
      ...this.siteRequest
    };

    this.siteService.updateSite(updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.modalRef?.hide();
          this.loadSites();
          this.resetSiteForm();
        },
        error: (error) => {
          this.formErrorMessage = error.message || 'Failed to update site';
        }
      });
  }

  deleteSite(site: SiteWithOverview): void {
    if (confirm(`Are you sure you want to delete site "${site.siteName}"?`)) {
      this.isLoading = true;
      this.siteService.deleteSite(site.siteId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.loadSites();
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to delete site';
          }
        });
    }
  }

  resetSiteForm(): void {
    this.siteRequest = {
      siteName: '',
      address: '',
      picUserId: '',
      phone: ''
    };
  }

  // Navigation to detail
  navigateToDetail(siteId: string): void {
    this.router.navigate(['/site', siteId]);
  }

  // Apply filters
  applyFilters(): void {
    let filtered = [...this.sites];

    // Apply search filter
    if (this.searchFilter.value) {
      const searchTerm = this.searchFilter.value.toLowerCase();
      filtered = filtered.filter(site =>
        site.siteName.toLowerCase().includes(searchTerm) ||
        (site.address && site.address.toLowerCase().includes(searchTerm)) ||
        site.picFullName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => {
        const aValue = a[this.sortField as keyof SiteWithOverview];
        const bValue = b[this.sortField as keyof SiteWithOverview];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return this.sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle date comparison
        if (this.sortField === 'createdAt' || this.sortField === 'changedOn') {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }

        return 0;
      });
    }

    this.filteredSites = filtered;
  }

  // Helper method to get object keys for typeOverviews
  getTypeKeys(typeOverviews: any): string[] {
    if (!typeOverviews) return [];
    return Object.keys(typeOverviews);
  }
}
