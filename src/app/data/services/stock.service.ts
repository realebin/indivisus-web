import { Injectable } from '@angular/core';
import { StockHttpServices } from '@http_services/stock.http-services';
import { ErrorOutputWrapper } from '@models/_base.model';
import { StockFilterPrepareModelResponse, StockInquiryModelResponse, transformToStockInquiryModelResponse } from '@models/stock.model';
import { catchError, map, Observable, throwError } from 'rxjs';
import { StockInquiryHttpResponse } from '@schemas/stock.schema';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private stockHttpService: StockHttpServices) { }


  inquiryStocks(): Observable<StockInquiryModelResponse> {
    return this.stockHttpService.inquiryStocks().pipe(
      map((response) => {
        return transformToStockInquiryModelResponse(response.output_schema);
      }),
      catchError((error: ErrorOutputWrapper<StockInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToStockInquiryModelResponse(error?.data)
            : null,
        });
      })
    );
  }
  prepareStockFilter(): Observable<StockFilterPrepareModelResponse> {
    return this.stockHttpService.prepareStockFilter().pipe(
      map((response) => {
        return response.output_schema;
      }),
      catchError((error: ErrorOutputWrapper<StockInquiryHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? error?.data
            : null,
        });
      })
    );
  }
}
