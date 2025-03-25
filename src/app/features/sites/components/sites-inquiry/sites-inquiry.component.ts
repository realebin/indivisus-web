import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SiteInquiryModelResponse } from '@models/site.model';

@Component({
  selector: 'app-sites-inquiry',
  templateUrl: './sites-inquiry.component.html',
  styleUrl: './sites-inquiry.component.scss'
})
export class SitesInquiryComponent {
  @Input() sites: SiteInquiryModelResponse;
  constructor(private router: Router) {}
  // Getter to access just the sites array for pagination
  get sitesList() {
    return this.sites?.sites || [];
  }

  navigateToDetail(siteId: string): void {
    this.router.navigate(['/site', siteId]);
  }
}
