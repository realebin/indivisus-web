/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SiteCreateEditModelRequest, SiteInquiryModelResponse } from '@models/site.model';
import { SiteService } from '@services/site.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sites-index',
  templateUrl: './sites-index.component.html',
  styleUrls: ['./sites-index.component.scss'],
})
export class SitesIndexComponent implements OnInit {
  @ViewChild('createSiteModal') createSiteModal!: TemplateRef<any>;

  isLoading: boolean = false;
  sites: SiteInquiryModelResponse;
  modalRef?: BsModalRef;
  isSiteFormValid: boolean = false;
  errorMessage: string = '';
  siteRequest: SiteCreateEditModelRequest = {
    siteName: '',
    address: '',
    picUserId: ''
  };

  constructor(
    private siteService: SiteService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.isLoading = true;
    this.siteService.inquirySites().subscribe({
      next: (response) => {
        this.sites = response;
      },
      error: (error) => {
        console.error('Error loading sites:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  openCreateSiteModal(): void {
    this.siteRequest = {
      siteName: '',
      address: '',
      picUserId: ''
    };
    this.errorMessage = '';
    this.modalRef = this.modalService.show(this.createSiteModal);
  }

  onSiteFormDataChange(data: SiteCreateEditModelRequest): void {
    this.siteRequest = data;
  }

  onSiteFormValidityChange(isValid: boolean): void {
    this.isSiteFormValid = isValid;
  }

  createSite(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.siteService.createEditSite(this.siteRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.modalRef?.hide();
        this.loadSites(); // Reload sites after creation
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'An error occurred while creating the site';
      }
    });
  }

  closeModal(): void {
    this.modalRef?.hide();
  }

  // Add this method to handle site deletion if needed
  deleteSite(id: number): void {
    if (confirm('Are you sure you want to delete this site?')) {
      this.siteService.deleteSite({ id }).subscribe({
        next: () => {
          this.loadSites(); // Reload the list after deletion
        },
        error: (error) => {
          console.error('Error deleting site:', error);
        },
      });
    }
  }
}
