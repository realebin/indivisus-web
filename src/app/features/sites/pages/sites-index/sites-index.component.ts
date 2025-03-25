import { Component, OnInit } from '@angular/core';
import { SiteInquiryModelResponse } from '@models/site.model';
import { SiteService } from '@services/site.service';

@Component({
  selector: 'app-sites-index',
  templateUrl: './sites-index.component.html',
  styleUrl: './sites-index.component.scss',
})
export class SitesIndexComponent implements OnInit {
  constructor(private siteService: SiteService) {}
  isLoading: boolean;
  sites: SiteInquiryModelResponse;

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

  // deleteSite(id: number): void {
  //   if (confirm('Are you sure you want to delete this site?')) {
  //     this.siteService.deleteSite({ id }).subscribe({
  //       next: (response) => {
  //         this.loadSites(); // Reload the list after deletion
  //       },
  //       error: (error) => {
  //         console.error('Error deleting site:', error);
  //       },
  //     });
  //   }
  // }
}
