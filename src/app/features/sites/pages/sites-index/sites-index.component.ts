import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { SiteCreateRequest, SiteUpdateRequest, SiteWithOverview } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs';
import { SortOption } from 'src/app/shared-components/filter-panel/filter-panel.component';
import { ColumnConfig } from 'src/app/shared-components/expandable-card/expandable-card.component';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-sites-index',
  templateUrl: './sites-index.component.html',
  styleUrls: ['./sites-index.component.scss'],
})
export class SitesIndexComponent implements OnInit {
  @ViewChild('createSiteModal') createSiteModal!: TemplateRef<any>;

  isLoading = false;
  sites: SiteWithOverview[] = [];
  filteredSites: SiteWithOverview[] = [];
  modalRef?: BsModalRef;
  errorMessage = '';

  // Form related properties
  isSiteFormValid = false;
  isEditMode = false;
  selectedSite?: SiteWithOverview;

  // Filter panel properties
  showFilterPanel = false;
  searchFilter = new FormControl('');
  sortField = 'siteName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // CardConfigs for mobile view
  cardConfigs: { [key: string]: ColumnConfig[] } = {
    'SITE': [
      { field: 'siteName', label: 'Site Name', isHeader: true, icon: 'bi-geo-alt' },
      { field: 'address', label: 'Address' },
      { field: 'picFullName', label: 'PIC', isHeader: true },
      { field: 'createdAt', label: 'Created Date' }
    ]
  };

  // Column definitions for grid view
  columnDefs: ColDef[] = [
    {
      headerName: 'Site Name',
      field: 'siteName',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      headerName: 'Address',
      field: 'address',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      headerName: 'PIC',
      field: 'picFullName',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      headerName: 'Created Date',
      field: 'createdAt',
      sortable: true,
      filter: true,
      resizable: true,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      headerName: 'Actions',
      cellRenderer: 'actionsRenderer',
      sortable: false,
      filter: false,
      resizable: false,
      width: 120
    }
  ];

  // Sort options for filter panel
  sortOptions: SortOption[] = [
    { field: 'siteName', label: 'Site Name' },
    { field: 'address', label: 'Address' },
    { field: 'picFullName', label: 'PIC' },
    { field: 'createdAt', label: 'Created Date' }
  ];

  siteRequest: SiteCreateRequest = {
    siteName: '',
    address: '',
    picUserId: ''
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
    this.isEditMode = false;
    this.selectedSite = undefined;
    this.resetSiteForm();
    this.modalRef = this.modalService.show(this.createSiteModal, { class: 'modal-lg' });
  }

  openEditSiteModal(site: SiteWithOverview): void {
    this.isEditMode = true;
    this.selectedSite = site;
    this.siteRequest = {
      siteName: site.siteName,
      address: site.address,
      picUserId: site.picUserId
    };
    this.modalRef = this.modalService.show(this.createSiteModal, { class: 'modal-lg' });
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

    this.isLoading = true;
    this.errorMessage = '';

    this.siteService.createSite(this.siteRequest)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.modalRef?.hide();
          this.loadSites();
          this.resetSiteForm();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to create site';
        }
      });
  }

  updateSite(): void {
    if (!this.isSiteFormValid || !this.selectedSite) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const updateRequest: SiteUpdateRequest = {
      siteId: this.selectedSite.siteId,
      ...this.siteRequest
    };

    this.siteService.updateSite(updateRequest)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.modalRef?.hide();
          this.loadSites();
          this.resetSiteForm();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update site';
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
      picUserId: ''
    };
    this.errorMessage = '';
  }

  // Navigation to detail
  navigateToDetail(siteId: string): void {
    this.router.navigate(['/site', siteId]);
  }

  // Filter panel methods
  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  applyFilters(): void {
    let filtered = [...this.sites];

    // Apply search filter
    if (this.searchFilter.value) {
      const searchTerm = this.searchFilter.value.toLowerCase();
      filtered = filtered.filter(site =>
        site.siteName.toLowerCase().includes(searchTerm) ||
        site.address.toLowerCase().includes(searchTerm) ||
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
    this.sortField = 'siteName';
    this.sortDirection = 'asc';
    this.filteredSites = [...this.sites];
  }

  // Handle action button clicks from the responsive-data-table
  handleSiteAction(event: {type: string, item: any}): void {
    const site = event.item;

    switch (event.type) {
      case 'view':
        this.navigateToDetail(site.siteId);
        break;
      case 'edit':
        this.openEditSiteModal(site);
        break;
      case 'delete':
        this.deleteSite(site);
        break;
      default:
        console.log('Unhandled action type:', event.type);
        break;
    }
  }
}
