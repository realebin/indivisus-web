import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '@services/environment.service';
import { ApiResponse } from '@schemas/_base.schema';
import {
  SiteAllListOverviewHttpResponse,
  SiteCreateHttpRequest,
  SiteUpdateHttpRequest,
  SiteDetailInquiryHttpResponse,
  SiteInquiryHttpResponse,
  SiteStockHeadersResponse
} from '@schemas/site.schema';

@Injectable({
  providedIn: 'root',
})
export class SiteHttpService {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService
  ) {}

  private get baseUrl(): string {
    return `${this.env.apiEndpoint}/site-management`;
  }

  // GET all sites
  getAllSites(): Observable<ApiResponse<SiteAllListOverviewHttpResponse>> {
    return this.httpClient.get<ApiResponse<SiteAllListOverviewHttpResponse>>(
      `${this.baseUrl}/site/list-all`
    );
  }

  // GET all sites with stock overview
  getSitesWithOverview(): Observable<ApiResponse<SiteInquiryHttpResponse>> {
    return this.httpClient.get<ApiResponse<SiteInquiryHttpResponse>>(
      `${this.baseUrl}/site/list-all-with-stock`
    );
  }

  // GET site detail by ID
  getSiteDetail(siteId: string): Observable<ApiResponse<SiteDetailInquiryHttpResponse>> {
    return this.httpClient.get<ApiResponse<SiteDetailInquiryHttpResponse>>(
      `${this.baseUrl}/site/${siteId}`
    );
  }

  // GET stock headers by site
  getStockHeadersBySite(siteId: string, productType?: string): Observable<ApiResponse<SiteStockHeadersResponse>> {
    let url = `${this.baseUrl}/site/${siteId}/stocks`;
    if (productType) {
      url += `?type=${productType}`;
    }
    return this.httpClient.get<ApiResponse<SiteStockHeadersResponse>>(url);
  }

  // POST create new site
  createSite(request: SiteCreateHttpRequest): Observable<ApiResponse<{ site_id: string }>> {
    return this.httpClient.post<ApiResponse<{ site_id: string }>>(
      `${this.baseUrl}/site/create`,
      request
    );
  }

  // PUT update existing site
  updateSite(request: SiteUpdateHttpRequest): Observable<ApiResponse<{ site_id: string }>> {
    return this.httpClient.put<ApiResponse<{ site_id: string }>>(
      `${this.baseUrl}/site/update`,
      request
    );
  }

  // DELETE site
  deleteSite(siteId: string): Observable<ApiResponse<{ site_id: string }>> {
    return this.httpClient.delete<ApiResponse<{ site_id: string }>>(
      `${this.baseUrl}/site/delete/${siteId}`
    );
  }

  // GET sites for filtering/dropdown use
  getSiteForFilter(): Observable<ApiResponse<SiteAllListOverviewHttpResponse>> {
    return this.httpClient.get<ApiResponse<SiteAllListOverviewHttpResponse>>(
      `${this.baseUrl}/site/list-all`
    );
  }
}
