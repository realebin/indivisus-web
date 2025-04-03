import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SiteCreateRequest, SiteInquiryResponse, SiteWithOverview } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sites-index',
  templateUrl: './sites-index.component.html',
  styleUrls: ['./sites-index.component.scss'],
})
export class SitesIndexComponent implements OnInit {
  @ViewChild('createSiteModal') createSiteModal!: TemplateRef<any>;

  isLoading = false;
  sites: SiteWithOverview[] = [];
  siteResponse?: SiteInquiryResponse;

  modalRef?: BsModalRef;
  isSiteFormValid = false;
  errorMessage = '';

  isEditMode = false;
  selectedSite?: SiteWithOverview;

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
  }

  loadSites(): void {
    this.isLoading = true;
    this.siteService.getSitesWithOverview()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.siteResponse = response;
          this.sites = response.sites;
        },
        error: (error) => {
          console.error('Error loading sites:', error);
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

  createSite(): void {
    if (!this.isSiteFormValid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.siteService.createSite(this.siteRequest)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (message) => {
          this.modalRef?.hide();
          this.loadSites();
          this.resetSiteForm();
          // You could show a success message here
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

    const updateRequest = {
      siteId: this.selectedSite.siteId,
      ...this.siteRequest
    };

    this.siteService.updateSite(updateRequest)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (message) => {
          this.modalRef?.hide();
          this.loadSites();
          this.resetSiteForm();
          // You could show a success message here
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
          next: (message) => {
            this.loadSites();
            // You could show a success message here
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to delete site';
          }
        });
    }
  }

  submitSiteForm(): void {
    if (this.isEditMode) {
      this.updateSite();
    } else {
      this.createSite();
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

  closeModal(): void {
    this.modalRef?.hide();
  }

  handleSiteAction(event: {type: string, item: any}): void {
    const site = event.item;

    switch (event.type) {
      case 'view':
        this.router.navigate(['/site', site.siteId]);
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
