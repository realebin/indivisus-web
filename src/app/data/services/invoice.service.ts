import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { ErrorOutputWrapper } from '@models/_base.model';
import {
  InvoiceInquiryModelResponse,
  InvoiceDetailModelResponse,
  InvoiceByCustomerModelResponse,
  InvoiceBySiteModelResponse,
  InvoiceByDateRangeModelResponse,
  ProductListForInvoiceModelResponse,
  InvoiceCreateModelRequest,
  InvoiceUpdateModelRequest,
  MultipleInvoicePdfModelRequest,
  transformToInvoiceInquiryModelResponse,
  transformToInvoiceDetailModelResponse,
  transformToInvoiceByCustomerModelResponse,
  transformToInvoiceBySiteModelResponse,
  transformToInvoiceByDateRangeModelResponse,
  transformToProductListForInvoiceModelResponse,
  transformToInvoiceCreateHttpRequest,
  transformToInvoiceUpdateHttpRequest,
  transformToMultipleInvoicePdfHttpRequest,
} from '@models/invoice.model';
import {
  InvoiceInquiryHttpResponse,
  InvoiceDetailHttpResponse,
  InvoiceByCustomerHttpResponse,
  InvoiceBySiteHttpResponse,
  InvoiceByDateRangeHttpResponse,
  ProductListForInvoiceHttpResponse,
} from '@schemas/invoice.schema';
import { InvoiceHttpService } from '@http_services/invoice.http-service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private invoiceHttpService: InvoiceHttpService) {}

  getAllInvoices(): Observable<InvoiceInquiryModelResponse> {
    return this.invoiceHttpService.getAllInvoices().pipe(
      map((response) => {
        return transformToInvoiceInquiryModelResponse(response.output_schema);
      }),
      catchError((error: ErrorOutputWrapper<InvoiceInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToInvoiceInquiryModelResponse(error?.data)
            : null,
        });
      })
    );
  }

  getInvoiceById(
    invoiceNumber: string
  ): Observable<InvoiceDetailModelResponse> {
    return this.invoiceHttpService.getInvoiceById(invoiceNumber).pipe(
      map((response) => {
        return transformToInvoiceDetailModelResponse(response.output_schema);
      }),
      catchError((error: ErrorOutputWrapper<InvoiceDetailHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToInvoiceDetailModelResponse(error?.data)
            : null,
        });
      })
    );
  }

  getInvoicesByCustomerId(
    customerId: string
  ): Observable<InvoiceByCustomerModelResponse> {
    return this.invoiceHttpService.getInvoicesByCustomerId(customerId).pipe(
      map((response) => {
        return transformToInvoiceByCustomerModelResponse(
          response.output_schema
        );
      }),
      catchError((error: ErrorOutputWrapper<InvoiceByCustomerHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToInvoiceByCustomerModelResponse(error?.data)
            : null,
        });
      })
    );
  }

  getInvoicesBySiteId(siteId: string): Observable<InvoiceBySiteModelResponse> {
    return this.invoiceHttpService.getInvoicesBySiteId(siteId).pipe(
      map((response) => {
        return transformToInvoiceBySiteModelResponse(response.output_schema);
      }),
      catchError((error: ErrorOutputWrapper<InvoiceBySiteHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToInvoiceBySiteModelResponse(error?.data)
            : null,
        });
      })
    );
  }

  getInvoicesByDateRange(
    startDate: string,
    endDate: string
  ): Observable<InvoiceByDateRangeModelResponse> {
    return this.invoiceHttpService
      .getInvoicesByDateRange(startDate, endDate)
      .pipe(
        map((response) => {
          return transformToInvoiceByDateRangeModelResponse(
            response.output_schema
          );
        }),
        catchError(
          (error: ErrorOutputWrapper<InvoiceByDateRangeHttpResponse>) => {
            return throwError({
              ...error,
              data: error?.data
                ? transformToInvoiceByDateRangeModelResponse(error?.data)
                : null,
            });
          }
        )
      );
  }

  getProductListForInvoice(
    siteId: string
  ): Observable<ProductListForInvoiceModelResponse> {
    return this.invoiceHttpService.getProductListForInvoice(siteId).pipe(
      map((response) => {
        return transformToProductListForInvoiceModelResponse(
          response.output_schema
        );
      }),
      catchError(
        (error: ErrorOutputWrapper<ProductListForInvoiceHttpResponse>) => {
          return throwError({
            ...error,
            data: error?.data
              ? transformToProductListForInvoiceModelResponse(error?.data)
              : null,
          });
        }
      )
    );
  }

  createInvoice(data: InvoiceCreateModelRequest): Observable<string> {
    const request = transformToInvoiceCreateHttpRequest(data);
    return this.invoiceHttpService.createInvoice(request).pipe(
      map((response) => {
        const language = 'indonesian';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return errorMessage;
      })
    );
  }

  updateInvoice(data: InvoiceUpdateModelRequest): Observable<string> {
    const request = transformToInvoiceUpdateHttpRequest(data);
    return this.invoiceHttpService.updateInvoice(request).pipe(
      map((response) => {
        const language = 'indonesian';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return errorMessage;
      })
    );
  }

  deleteInvoice(invoiceNumber: string): Observable<string> {
    return this.invoiceHttpService.deleteInvoice(invoiceNumber).pipe(
      map((response) => {
        const language = 'indonesian';
        const errorMessage = response.error_schema.error_message;

        if (typeof errorMessage === 'object' && errorMessage !== null) {
          return errorMessage[language];
        }
        return errorMessage;
      })
    );
  }

  generateInvoicePdf(invoiceNumber: string): Observable<Blob> {
    return this.invoiceHttpService.generateInvoicePdf(invoiceNumber);
  }

  generatePackListInvoicePdf(invoiceNumber: string): Observable<Blob> {
    return this.invoiceHttpService.generatePackListInvoicePdf(invoiceNumber);
  }

  generateMultipleInvoicePdfs(
    data: MultipleInvoicePdfModelRequest
  ): Observable<{ [key: string]: string }> {
    const request = transformToMultipleInvoicePdfHttpRequest(data);
    return this.invoiceHttpService.generateMultipleInvoicePdfs(request).pipe(
      map((response) => response.output_schema),
      catchError((error) => {
        return throwError({
          ...error,
          data: null,
        });
      })
    );
  }
}
