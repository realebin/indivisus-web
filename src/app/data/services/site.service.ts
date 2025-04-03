import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SiteHttpService } from '@http_services/site.http-service';
import {
  SiteAllListOverviewModelResponse,
  SiteAllListResponse,
  SiteCreateRequest,
  SiteDetailResponse,
  SiteInquiryResponse,
  SiteStockHeadersResponseModel,
  SiteUpdateRequest,
  transformSiteAllListOverviewModelResponse,
  transformToSiteAllListResponse,
  transformToSiteCreateHttpRequest,
  transformToSiteDetailResponse,
  transformToSiteInquiryResponse,
  transformToSiteStockHeadersResponse,
  transformToSiteUpdateHttpRequest
} from '@models/site.model';
import { SiteAllListOverviewHttpResponse } from '@schemas/site.schema';
import { ErrorOutputWrapper } from '@models/_base.model';

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
      catchError((error) => {
        console.error('Error fetching all sites:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get sites with overview information
   */
  getSitesWithOverview(): Observable<SiteInquiryResponse> {
    return this.siteHttpService.getSitesWithOverview().pipe(
      map((response) => transformToSiteInquiryResponse(response.output_schema)),
      catchError((error) => {
        console.error('Error fetching sites with overview:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get site detail by ID
   */
  getSiteDetail(siteId: string): Observable<SiteDetailResponse> {
    return this.siteHttpService.getSiteDetail(siteId).pipe(
      map((response) => transformToSiteDetailResponse(response.output_schema)),
      catchError((error) => {
        console.error(`Error fetching site detail for ID ${siteId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get stock headers by site
   */
  getStockHeadersBySite(siteId: string, productType?: string): Observable<SiteStockHeadersResponseModel> {
    return this.siteHttpService.getStockHeadersBySite(siteId, productType).pipe(
      map((response) => transformToSiteStockHeadersResponse(response.output_schema)),
      catchError((error) => {
        console.error(`Error fetching stock headers for site ID ${siteId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new site
   */
  createSite(request: SiteCreateRequest): Observable<string> {
    return this.siteHttpService.createSite(transformToSiteCreateHttpRequest(request)).pipe(
      map((response) => {
        // Return the success message
        const language = 'english';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return 'Site created successfully';
      }),
      catchError((error) => {
        console.error('Error creating site:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update existing site
   */
  updateSite(request: SiteUpdateRequest): Observable<string> {
    return this.siteHttpService.updateSite(transformToSiteUpdateHttpRequest(request)).pipe(
      map((response) => {
        // Return the success message
        const language = 'english';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return 'Site updated successfully';
      }),
      catchError((error) => {
        console.error('Error updating site:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete site
   */
  deleteSite(siteId: string): Observable<string> {
    return this.siteHttpService.deleteSite(siteId).pipe(
      map((response) => {
        // Return the success message
        const language = 'english';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return 'Site deleted successfully';
      }),
      catchError((error) => {
        console.error(`Error deleting site ID ${siteId}:`, error);
        return throwError(() => error);
      })
    );
  }

  getSiteForFilter(): Observable<SiteAllListOverviewModelResponse> {
    return this.siteHttpService.getSiteForFilter().pipe(
      map((response) => {
        return transformSiteAllListOverviewModelResponse(
          response.output_schema
        );
      }),
      catchError(
        (error: ErrorOutputWrapper<SiteAllListOverviewHttpResponse>) => {
          return throwError({
            ...error,
            data: error?.data ? error?.data : null,
          });
        }
      )
    );
  }
}
