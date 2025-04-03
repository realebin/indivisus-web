import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SiteHttpService } from '@http_services/site.http-service';
import { ApiResponse } from '@schemas/_base.schema';
import {
  SiteAllListResponse,
  SiteCreateRequest,
  SiteDetailResponse,
  SiteInquiryResponse,
  SiteStockHeadersResponseModel,
  SiteUpdateRequest,
  transformToSiteAllListResponse,
  transformToSiteCreateHttpRequest,
  transformToSiteDetailResponse,
  transformToSiteInquiryResponse,
  transformToSiteStockHeadersResponse,
  transformToSiteUpdateHttpRequest,
  SiteWithOverview
} from '@models/site.model';
import { ErrorOutputWrapper } from '@models/_base.model';
import { SiteAllListOverviewHttpResponse, SiteDetailInquiryHttpResponse, SiteInquiryHttpResponse, SiteStockHeadersResponse } from '@schemas/site.schema';

@Injectable({
  providedIn: 'root',
})
export class SiteService {
  constructor(private siteHttpService: SiteHttpService) {}

  /**
   * Get all sites (basic list)
   */
  getAllSites(): Observable<SiteAllListResponse> {
    return this.siteHttpService.getAllSites().pipe(
      map((response) => transformToSiteAllListResponse(response.output_schema)),
      catchError((error: ErrorOutputWrapper<SiteAllListOverviewHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data ? transformToSiteAllListResponse(error?.data) : null,
        });
      })
    );
  }

  /**
   * Get sites with overview information
   */
  getSitesWithOverview(): Observable<SiteInquiryResponse> {
    return this.siteHttpService.getSitesWithOverview().pipe(
      map((response) => transformToSiteInquiryResponse(response.output_schema)),
      catchError((error: ErrorOutputWrapper<SiteInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data ? transformToSiteInquiryResponse(error?.data) : null,
        });
      })
    );
  }

  /**
   * Get site detail by ID
   */
  getSiteDetail(siteId: string): Observable<SiteDetailResponse> {
    return this.siteHttpService.getSiteDetail(siteId).pipe(
      map((response) => transformToSiteDetailResponse(response.output_schema)),
      catchError((error: ErrorOutputWrapper<SiteDetailInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data ? transformToSiteDetailResponse(error?.data) : null,
        });
      })
    );
  }

  /**
   * Get stock headers by site
   */
  getStockHeadersBySite(siteId: string, productType?: string): Observable<SiteStockHeadersResponseModel> {
    return this.siteHttpService.getStockHeadersBySite(siteId, productType).pipe(
      map((response) => transformToSiteStockHeadersResponse(response.output_schema)),
      catchError((error: ErrorOutputWrapper<SiteStockHeadersResponse>) => {
        return throwError({
          ...error,
          data: error?.data ? transformToSiteStockHeadersResponse(error?.data) : null,
        });
      })
    );
  }

  /**
   * Create new site
   */
  createSite(request: SiteCreateRequest): Observable<ApiResponse<{ site_id: string }>> {
    return this.siteHttpService.createSite(transformToSiteCreateHttpRequest(request));
  }

  /**
   * Update existing site
   */
  updateSite(request: SiteUpdateRequest): Observable<ApiResponse<{ site_id: string }>> {
    return this.siteHttpService.updateSite(transformToSiteUpdateHttpRequest(request));
  }

  /**
   * Delete site
   */
  deleteSite(siteId: string): Observable<ApiResponse<{ site_id: string }>> {
    return this.siteHttpService.deleteSite(siteId);
  }

  /**
   * Get sites for filtering
   */
  getSiteForFilter(): Observable<SiteAllListResponse> {
    return this.siteHttpService.getSiteForFilter().pipe(
      map((response) => transformToSiteAllListResponse(response.output_schema)),
      catchError((error: ErrorOutputWrapper<SiteAllListOverviewHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data ? transformToSiteAllListResponse(error?.data) : null,
        });
      })
    );
  }
}
