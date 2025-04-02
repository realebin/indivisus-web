import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnvironmentService } from '@services/environment.service';
import { ApiResponse } from '@schemas/_base.schema';
import {
  InvoiceInquiryHttpResponse,
  InvoiceDetailHttpResponse,
  InvoiceByCustomerHttpResponse,
  InvoiceBySiteHttpResponse,
  InvoiceByDateRangeHttpResponse,
  ProductListForInvoiceHttpResponse,
  InvoiceCreateHttpRequest,
  InvoiceUpdateHttpRequest,
  MultipleInvoicePdfRequest
} from '@schemas/invoice.schema';

@Injectable({
  providedIn: 'root',
})
export class InvoiceHttpService {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService
  ) {}

  private get baseUrl(): string {
    return `${this.env.apiEndpoint}/invoice-management`;
  }

  getAllInvoices(): Observable<ApiResponse<InvoiceInquiryHttpResponse>> {
    return this.httpClient.get<ApiResponse<InvoiceInquiryHttpResponse>>(
      `${this.baseUrl}/invoice/list-all`
    );
  }

  getInvoiceById(invoiceNumber: string): Observable<ApiResponse<InvoiceDetailHttpResponse>> {
    return this.httpClient.get<ApiResponse<InvoiceDetailHttpResponse>>(
      `${this.baseUrl}/invoice/${invoiceNumber}`
    );
  }

  getInvoicesByCustomerId(customerId: string): Observable<ApiResponse<InvoiceByCustomerHttpResponse>> {
    return this.httpClient.get<ApiResponse<InvoiceByCustomerHttpResponse>>(
      `${this.baseUrl}/invoice/customer/${customerId}`
    );
  }

  getInvoicesBySiteId(siteId: string): Observable<ApiResponse<InvoiceBySiteHttpResponse>> {
    return this.httpClient.get<ApiResponse<InvoiceBySiteHttpResponse>>(
      `${this.baseUrl}/invoice/site/${siteId}`
    );
  }

  getInvoicesByDateRange(startDate: string, endDate: string): Observable<ApiResponse<InvoiceByDateRangeHttpResponse>> {
    return this.httpClient.get<ApiResponse<InvoiceByDateRangeHttpResponse>>(
      `${this.baseUrl}/invoice/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getProductListForInvoice(siteId: string): Observable<ApiResponse<ProductListForInvoiceHttpResponse>> {
    return this.httpClient.get<ApiResponse<ProductListForInvoiceHttpResponse>>(
      `${this.baseUrl}/product-list/${siteId}`
    );
  }

  createInvoice(request: InvoiceCreateHttpRequest): Observable<ApiResponse<{ invoice_number: string }>> {
    return this.httpClient.post<ApiResponse<{ invoice_number: string }>>(
      `${this.baseUrl}/invoice/create`,
      request
    );
  }

  updateInvoice(request: InvoiceUpdateHttpRequest): Observable<ApiResponse<{ invoice_number: string }>> {
    return this.httpClient.put<ApiResponse<{ invoice_number: string }>>(
      `${this.baseUrl}/invoice/update`,
      request
    );
  }

  deleteInvoice(invoiceNumber: string): Observable<ApiResponse<{ invoice_number: string }>> {
    return this.httpClient.delete<ApiResponse<{ invoice_number: string }>>(
      `${this.baseUrl}/invoice/delete/${invoiceNumber}`
    );
  }

  generateInvoicePdf(invoiceNumber: string): Observable<Blob> {
    return this.httpClient.get(
      `${this.baseUrl}/invoice/single-pdf/${invoiceNumber}`,
      { responseType: 'blob' }
    );
  }

  generateMultipleInvoicePdfs(request: MultipleInvoicePdfRequest): Observable<ApiResponse<{ [key: string]: string }>> {
    return this.httpClient.post<ApiResponse<{ [key: string]: string }>>(
      `${this.baseUrl}/invoice/multi-pdf`,
      request
    );
  }
}
