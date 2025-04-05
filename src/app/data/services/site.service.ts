import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SiteHttpService } from '@http_services/site.http-service';
import {
  SiteAllListResponse,
  SiteCreateRequest,
  SiteDetailResponse,
  SiteInquiryResponse,
  SiteStockHeadersResponseModel,
  SiteStockHeadersWithSpecificProductModelResponse,
  SiteUpdateRequest,
  transformToSiteAllListResponse,
  transformToSiteCreateHttpRequest,
  transformToSiteInquiryResponse,
  transformToSiteStockHeadersResponse,
  transformToSiteStockHeadersWithSpecificProductModelResponse,
  transformToSiteUpdateHttpRequest
} from '@models/site.model';
import { ErrorOutputWrapper } from '@models/_base.model';
import { SiteAllListOverviewHttpResponse, SiteInquiryHttpResponse, SiteStockHeadersHttpResponse, SiteStockHeadersWithSpecificProductHttpResponse } from '@schemas/site.schema';

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
   * We need to get this from the list-all endpoint since there's no specific site detail endpoint
   */
  getSiteDetail(siteId: string): Observable<SiteDetailResponse> {
    // First try from sites with overview as it has more data
    return this.getSitesWithOverview().pipe(
      map((response) => {
        const site = response.sites.find(s => s.siteId === siteId);
        if (!site) {
          throw new Error('Site not found');
        }

        return { site };
      }),
      catchError((error) => {
        // Fallback to getAllSites if getSitesWithOverview fails
        if (error.message === 'Site not found') {
          return this.getAllSites().pipe(
            map((response) => {
              const site = response.data.find(s => s.siteId === siteId);
              if (!site) {
                throw new Error('Site not found');
              }
              return { site };
            })
          );
        }
        return throwError(error);
      })
    );
  }

  /**
   * Get stock headers by site
   */
  getStockHeadersBySite(siteId: string): Observable<SiteStockHeadersResponseModel> {
    return this.siteHttpService.getStockHeadersBySite(siteId).pipe(
      map((response) => transformToSiteStockHeadersResponse(response.output_schema)),
      catchError((error: ErrorOutputWrapper<SiteStockHeadersHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data ? transformToSiteStockHeadersResponse(error?.data) : null,
        });
      })
    );
  }

    /**
   * Get stock specificly by site
   */
    getSpecificStockBySite(siteId: string, productType?: string): Observable<SiteStockHeadersWithSpecificProductModelResponse> {
      return this.siteHttpService.getSpecificStockBySite(siteId, productType).pipe(
        map((response) => transformToSiteStockHeadersWithSpecificProductModelResponse(response.output_schema)),
        catchError((error: ErrorOutputWrapper<SiteStockHeadersWithSpecificProductHttpResponse>) => {
          return throwError({
            ...error,
            data: error?.data ? transformToSiteStockHeadersWithSpecificProductModelResponse(error?.data) : null,
          });
        })
      );
    }

  /**
   * Create new site
   */
  createSite(request: SiteCreateRequest): Observable<string> {
    return this.siteHttpService.createSite(transformToSiteCreateHttpRequest(request)).pipe(
      map((response) => {
        // Extract the success message from the response
        const language = 'indonesian';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return errorMessage || 'Site created successfully';
      }),
      catchError((error) => {
        return throwError(() => error.message || 'Error creating site');
      })
    );
  }

  /**
   * Update existing site
   */
  updateSite(request: SiteUpdateRequest): Observable<string> {
    return this.siteHttpService.updateSite(transformToSiteUpdateHttpRequest(request)).pipe(
      map((response) => {
        // Extract the success message from the response
        const language = 'indonesian';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return errorMessage || 'Site updated successfully';
      }),
      catchError((error) => {
        return throwError(() => error.message || 'Error updating site');
      })
    );
  }

  /**
   * Delete site
   */
  deleteSite(siteId: string): Observable<string> {
    return this.siteHttpService.deleteSite(siteId).pipe(
      map((response) => {
        // Extract the success message from the response
        const language = 'indonesian';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return errorMessage || 'Site deleted successfully';
      }),
      catchError((error) => {
        return throwError(() => error.message || 'Error deleting site');
      })
    );
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
