import { catchError, map, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { SiteHttpService } from '@http_services/site.http-service';
import {
  SiteAllListOverviewModelResponse,
  SiteCreateEditModelRequest,
  SiteDeleteModelRequest,
  SiteDetailInquiryModelResponse,
  SiteInquiryModelResponse,
  transformSiteAllListOverviewModelResponse,
  transformToSiteCreateEditHttpRequest,
  transformToSiteDeleteHttpRequest,
  transformToSiteDetailInquiryModelResponse,
  transformToSiteInquiryModelResponse,
} from '@models/site.model';
import { ErrorOutputWrapper } from '@models/_base.model';
import {
  SiteAllListOverviewHttpResponse,
  SiteDetailInquiryHttpResponse,
  SiteInquiryHttpResponse,
} from '@schemas/site.schema';

@Injectable({
  providedIn: 'root',
})
export class SiteService {
  constructor(private siteHttpService: SiteHttpService) {}

  inquirySites(): Observable<SiteInquiryModelResponse> {
    return this.siteHttpService.inquirySites().pipe(
      map((response) => {
        return transformToSiteInquiryModelResponse(response.output_schema);
      }),
      catchError((error: ErrorOutputWrapper<SiteInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToSiteInquiryModelResponse(error?.data)
            : null,
        });
      })
    );
  }

  createEditSite(data: SiteCreateEditModelRequest): Observable<string> {
    return this.siteHttpService
      .createEditSite(transformToSiteCreateEditHttpRequest(data))
      .pipe(
        map((response) => {
          const language = 'indonesian';
          const errorMessage = response.error_schema.error_message;
          // const language =
          // this.translocoService.getActiveLang() === LanguageEnum.EN ? 'english' : 'indonesian';
          // return response.error_schema.error_message[language];

          // Check if errorMessage is an object with language properties
          if (typeof errorMessage === 'object' && errorMessage !== null) {
            return errorMessage[language];
          }
          // If it's a string, return it directly
          return errorMessage;
        })
      );
  }

  deleteSite(data: SiteDeleteModelRequest): Observable<string> {
    return this.siteHttpService
      .deleteSite(transformToSiteDeleteHttpRequest(data))
      .pipe(
        map((response) => {
          const language = 'indonesian';
          const errorMessage = response.error_schema.error_message;
          // const language =
          // this.translocoService.getActiveLang() === LanguageEnum.EN ? 'english' : 'indonesian';
          // return response.error_schema.error_message[language];

          // Check if errorMessage is an object with language properties
          if (typeof errorMessage === 'object' && errorMessage !== null) {
            return errorMessage[language];
          }
          // If it's a string, return it directly
          return errorMessage;
        })
      );
  }

  getSiteDetail(siteId: number): Observable<SiteDetailInquiryModelResponse> {
    return this.siteHttpService.getSiteDetail(siteId).pipe(
      map((response) => {
        return transformToSiteDetailInquiryModelResponse(
          response.output_schema
        );
      }),
      catchError((error: ErrorOutputWrapper<SiteDetailInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToSiteDetailInquiryModelResponse(error?.data)
            : null,
        });
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
