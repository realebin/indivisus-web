import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { ErrorOutputWrapper } from '@models/_base.model';
import { StockManagementHttpService } from '@http_services/stock.http-services';
import {
  BigPackageModel,
  SmallPackageModel,
  StockHeaderModel,
  transformToBigPackageModel,
  transformToSmallPackageModel,
  transformToStockCreateRequest,
  transformToStockHeaderModel,
  transformToStockUpdateRequest,
} from '@models/stock.model';
import { BigPackage, SmallPackage, StockHeader } from '@schemas/stock.schema';

@Injectable({
  providedIn: 'root',
})
export class StockManagementService {
  constructor(private stockManagementHttpService: StockManagementHttpService) {}

  // Stock Header Methods
  // In stock.service.ts
  getAllStocks(): Observable<StockHeaderModel[]> {
    return this.stockManagementHttpService.getAllStocks().pipe(
      map(response => {
        if (response.output_schema && response.output_schema.data) {
          return response.output_schema.data.map(transformToStockHeaderModel);
        } else {
          console.error('Unexpected response format:', response);
          return [];
        }
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getStockById(stockId: string): Observable<StockHeaderModel> {
    return this.stockManagementHttpService.getStockById(stockId).pipe(
      map(response => {
        if (response.output_schema && response.output_schema.data) {
          return transformToStockHeaderModel(response.output_schema.data);
        } else {
          console.error('Unexpected response format:', response);
          throw new Error('Invalid response format');
        }
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getStockByProductId(productId: string): Observable<StockHeaderModel> {
    return this.stockManagementHttpService.getStockByProductId(productId).pipe(
      map((response) => transformToStockHeaderModel(response.output_schema)),
      catchError((error: ErrorOutputWrapper<StockHeader>) => {
        return throwError(() => error);
      })
    );
  }

  getStocksBySiteId(siteId: string): Observable<StockHeaderModel[]> {
    return this.stockManagementHttpService.getStocksBySiteId(siteId).pipe(
      map((response) => {
        if (Array.isArray(response.output_schema)) {
          return response.output_schema.map(transformToStockHeaderModel);
        } else {
          console.error('Expected an array but got:', response.output_schema);
          return [];
        }
      }),
      catchError((error: ErrorOutputWrapper<StockHeader[]>) => {
        return throwError(() => error);
      })
    );
  }

  getStocksByType(type: string): Observable<StockHeaderModel[]> {
    return this.stockManagementHttpService.getStocksByType(type).pipe(
      map((response) => {
        if (Array.isArray(response.output_schema)) {
          return response.output_schema.map(transformToStockHeaderModel);
        } else {
          console.error('Expected an array but got:', response.output_schema);
          return [];
        }
      }),
      catchError((error: ErrorOutputWrapper<StockHeader[]>) => {
        return throwError(() => error);
      })
    );
  }

  createStock(stockData: {
    productId: string;
    productName: string;
    type: string;
    specs: string;
    price: number;
    sizeDescription: string;
    siteId: string;
    bigPackages: {
      packageNumber: string;
      sizeDescription: string;
      smallPackages: {
        sizeAmount: number;
        sizeDescription: string;
        createdBy: string;
      }[];
      createdBy: string;
    }[];
    createdBy: string;
  }): Observable<StockHeaderModel> {
    const request = transformToStockCreateRequest(stockData);
    return this.stockManagementHttpService.createStock(request).pipe(
      map(response => {
        if (response.output_schema && response.output_schema.data) {
          return transformToStockHeaderModel(response.output_schema.data);
        } else {
          console.error('Unexpected response format:', response);
          throw new Error('Invalid response format');
        }
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  updateStock(stockData: {
    stockId: string;
    productName: string;
    type: string;
    specs: string;
    price: number;
    sizeDescription: string;
    siteId: string;
    changedBy: string;
  }): Observable<StockHeaderModel> {
    const request = transformToStockUpdateRequest(stockData);
    return this.stockManagementHttpService.updateStock(request).pipe(
      map((response) => transformToStockHeaderModel(response.output_schema)),
      catchError((error: ErrorOutputWrapper<StockHeader>) => {
        return throwError(() => error);
      })
    );
  }

  deleteStock(stockId: string): Observable<any> {
    return this.stockManagementHttpService.deleteStock(stockId).pipe(
      map((response) => response.output_schema),
      catchError((error: ErrorOutputWrapper<any>) => {
        return throwError(() => error);
      })
    );
  }

  // Big Package Methods
  createBigPackage(
    stockId: string,
    bigPackageData: {
      packageNumber: string;
      sizeDescription: string;
      smallPackages: {
        sizeAmount: number;
        sizeDescription: string;
        createdBy: string;
      }[];
      createdBy: string;
    }
  ): Observable<BigPackageModel> {
    return this.stockManagementHttpService
      .createBigPackage(stockId, {
        package_number: bigPackageData.packageNumber,
        size_description: bigPackageData.sizeDescription,
        small_packages: bigPackageData.smallPackages.map((sp) => ({
          size_amount: sp.sizeAmount,
          size_description: sp.sizeDescription,
          created_by: sp.createdBy,
        })),
        created_by: bigPackageData.createdBy,
      })
      .pipe(
        map((response) => transformToBigPackageModel(response.output_schema)),
        catchError((error: ErrorOutputWrapper<BigPackage>) => {
          return throwError(() => error);
        })
      );
  }

  updateBigPackage(bigPackageData: {
    packageNumber: string;
    sizeDescription: string;
    isOpen: boolean;
    changedBy: string;
  }): Observable<BigPackageModel> {
    return this.stockManagementHttpService
      .updateBigPackage({
        package_number: bigPackageData.packageNumber,
        size_description: bigPackageData.sizeDescription,
        is_open: bigPackageData.isOpen,
        changed_by: bigPackageData.changedBy,
      })
      .pipe(
        map((response) => transformToBigPackageModel(response.output_schema)),
        catchError((error: ErrorOutputWrapper<BigPackage>) => {
          return throwError(() => error);
        })
      );
  }

  deleteBigPackage(packageNumber: string): Observable<any> {
    return this.stockManagementHttpService.deleteBigPackage(packageNumber).pipe(
      map((response) => response.output_schema),
      catchError((error: ErrorOutputWrapper<any>) => {
        return throwError(() => error);
      })
    );
  }

  markBigPackageAsOpen(
    packageNumber: string,
    changedBy: string
  ): Observable<any> {
    return this.stockManagementHttpService
      .markBigPackageAsOpen(packageNumber, changedBy)
      .pipe(
        map((response) => response.output_schema),
        catchError((error: ErrorOutputWrapper<any>) => {
          return throwError(() => error);
        })
      );
  }

  // Small Package Methods
  createSmallPackage(
    packageNumber: string,
    smallPackageData: {
      sizeAmount: number;
      sizeDescription: string;
      createdBy: string;
    }
  ): Observable<SmallPackageModel> {
    return this.stockManagementHttpService
      .createSmallPackage(packageNumber, {
        size_amount: smallPackageData.sizeAmount,
        size_description: smallPackageData.sizeDescription,
        created_by: smallPackageData.createdBy,
      })
      .pipe(
        map((response) => transformToSmallPackageModel(response.output_schema)),
        catchError((error: ErrorOutputWrapper<SmallPackage>) => {
          return throwError(() => error);
        })
      );
  }

  updateSmallPackage(smallPackageData: {
    packageId: string;
    sizeAmount: number;
    sizeDescription: string;
    isOpen: boolean;
    changedBy: string;
  }): Observable<SmallPackageModel> {
    return this.stockManagementHttpService
      .updateSmallPackage({
        package_id: smallPackageData.packageId,
        size_amount: smallPackageData.sizeAmount,
        size_description: smallPackageData.sizeDescription,
        is_open: smallPackageData.isOpen,
        changed_by: smallPackageData.changedBy,
      })
      .pipe(
        map((response) => transformToSmallPackageModel(response.output_schema)),
        catchError((error: ErrorOutputWrapper<SmallPackage>) => {
          return throwError(() => error);
        })
      );
  }

  deleteSmallPackage(packageId: string): Observable<any> {
    return this.stockManagementHttpService.deleteSmallPackage(packageId).pipe(
      map((response) => response.output_schema),
      catchError((error: ErrorOutputWrapper<any>) => {
        return throwError(() => error);
      })
    );
  }

  markSmallPackageAsOpen(
    packageId: string,
    changedBy: string
  ): Observable<any> {
    return this.stockManagementHttpService
      .markSmallPackageAsOpen(packageId, changedBy)
      .pipe(
        map((response) => response.output_schema),
        catchError((error: ErrorOutputWrapper<any>) => {
          return throwError(() => error);
        })
      );
  }
}
