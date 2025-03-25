import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@schemas/_base.schema';
import { EnvironmentService } from '@services/environment.service';
import { BigPackage, SmallPackage, StockCreateRequest, StockHeader, StockUpdateRequest } from '@schemas/stock.schema';

@Injectable({
  providedIn: 'root',
})
export class StockManagementHttpService {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService
  ) {}

  private get baseUrl(): string {
    return `${this.env.apiEndpoint}/stock-management`;
  }

  // Stock Header Endpoints
  getAllStocks(): Observable<ApiResponse<StockHeader[]>> {
    return this.httpClient.get<ApiResponse<StockHeader[]>>(
      `${this.baseUrl}/stock/list-all`
    );
  }

  getStockById(stockId: string): Observable<ApiResponse<StockHeader>> {
    return this.httpClient.get<ApiResponse<StockHeader>>(
      `${this.baseUrl}/stock/${stockId}`
    );
  }

  getStockByProductId(productId: string): Observable<ApiResponse<StockHeader>> {
    return this.httpClient.get<ApiResponse<StockHeader>>(
      `${this.baseUrl}/stock/product/${productId}`
    );
  }

  getStocksBySiteId(siteId: string): Observable<ApiResponse<StockHeader[]>> {
    return this.httpClient.get<ApiResponse<StockHeader[]>>(
      `${this.baseUrl}/stock/site/${siteId}`
    );
  }

  getStocksByType(type: string): Observable<ApiResponse<StockHeader[]>> {
    return this.httpClient.get<ApiResponse<StockHeader[]>>(
      `${this.baseUrl}/stock/type/${type}`
    );
  }

  createStock(request: StockCreateRequest): Observable<ApiResponse<StockHeader>> {
    return this.httpClient.post<ApiResponse<StockHeader>>(
      `${this.baseUrl}/stock/create`,
      request
    );
  }

  updateStock(request: StockUpdateRequest): Observable<ApiResponse<StockHeader>> {
    return this.httpClient.put<ApiResponse<StockHeader>>(
      `${this.baseUrl}/stock/update`,
      request
    );
  }

  deleteStock(stockId: string): Observable<ApiResponse<{
    stock_id: string;
    product_id: string;
    product_name: string;
    type: string;
    remaining_stock: number;
  }>> {
    return this.httpClient.delete<ApiResponse<{
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      remaining_stock: number;
    }>>(
      `${this.baseUrl}/stock/delete/${stockId}`
    );
  }

  // Big Package Endpoints
  createBigPackage(stockId: string, request: {
    package_number: string;
    size_description: string;
    small_packages: {
      size_amount: number;
      size_description: string;
      created_by: string;
    }[];
    created_by: string;
  }): Observable<ApiResponse<BigPackage>> {
    return this.httpClient.post<ApiResponse<BigPackage>>(
      `${this.baseUrl}/stock/${stockId}/big-package/create`,
      request
    );
  }

  updateBigPackage(request: {
    package_number: string;
    size_description: string;
    is_open: boolean;
    changed_by: string;
  }): Observable<ApiResponse<BigPackage>> {
    return this.httpClient.put<ApiResponse<BigPackage>>(
      `${this.baseUrl}/stock/big-package/update`,
      request
    );
  }

  deleteBigPackage(packageNumber: string): Observable<ApiResponse<{
    package_number: string;
    total_quantity: number;
    stock_id: string;
  }>> {
    return this.httpClient.delete<ApiResponse<{
      package_number: string;
      total_quantity: number;
      stock_id: string;
    }>>(
      `${this.baseUrl}/stock/big-package/${packageNumber}`
    );
  }

  markBigPackageAsOpen(packageNumber: string, changedBy: string): Observable<ApiResponse<{
    package_number: string;
    is_open: boolean;
    changed_on: string;
    changed_by: string;
  }>> {
    return this.httpClient.post<ApiResponse<{
      package_number: string;
      is_open: boolean;
      changed_on: string;
      changed_by: string;
    }>>(
      `${this.baseUrl}/stock/big-package/${packageNumber}/mark-as-open`,
      { changed_by: changedBy }
    );
  }

  // Small Package Endpoints
  createSmallPackage(packageNumber: string, request: {
    size_amount: number;
    size_description: string;
    created_by: string;
  }): Observable<ApiResponse<SmallPackage>> {
    return this.httpClient.post<ApiResponse<SmallPackage>>(
      `${this.baseUrl}/stock/big-package/${packageNumber}/small-package/create`,
      request
    );
  }

  updateSmallPackage(request: {
    package_id: string;
    size_amount: number;
    size_description: string;
    is_open: boolean;
    changed_by: string;
  }): Observable<ApiResponse<SmallPackage>> {
    return this.httpClient.put<ApiResponse<SmallPackage>>(
      `${this.baseUrl}/stock/small-package/update`,
      request
    );
  }

  deleteSmallPackage(packageId: string): Observable<ApiResponse<{
    package_id: string;
    big_package_number: string;
  }>> {
    return this.httpClient.delete<ApiResponse<{
      package_id: string;
      big_package_number: string;
    }>>(
      `${this.baseUrl}/stock/small-package/${packageId}`
    );
  }

  markSmallPackageAsOpen(packageId: string, changedBy: string): Observable<ApiResponse<{
    package_id: string;
    is_open: boolean;
    changed_on: string;
    changed_by: string;
  }>> {
    return this.httpClient.post<ApiResponse<{
      package_id: string;
      is_open: boolean;
      changed_on: string;
      changed_by: string;
    }>>(
      `${this.baseUrl}/stock/small-package/${packageId}/mark-as-open`,
      { changed_by: changedBy }
    );
  }
}
