import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { ApiResponse } from '@schemas/_base.schema';
import { StockFilterPrepareHttpResponse, StockInquiryHttpResponse } from '@schemas/stock.schema';
import { EnvironmentService } from '@services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class StockHttpServices {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService
  ) {}


  prepareStockFilter(): Observable<ApiResponse<StockFilterPrepareHttpResponse>> {
    return of({
      error_schema: {
        error_code: 'STO-1-000',
        http_code: 200,
        error_message: {
          indonesian: 'Berhasil mengambil detail site.',
          english: 'Successfully retrieved site details.',
        },
      },
      output_schema: {
        epoch: 1677145193628,
        sites: [
          {
            id: 1,
            address: 'Jl. Jalan',
            city: 'Jakarta',
            name: 'Gudang A',
          },
          {
            id: 2,
            address: 'Jl. Jalan',
            city: 'Jakarta',
            name: 'Gudang B',
          },
          {
            id: 3,
            address: 'Jl. Jalan',
            city: 'Jakarta',
            name: 'Gudang C',
          },
        ],
        items: [
          {
            id: 1,
            item_name: 'Tali',
            products: [
              {
                id: 1,
                name: 'Tali Seri A Warna B',
              },
              {
                id: 2,
                name: 'Tali Seri B Warna A',
              },
            ],
          },
          {
            id: 2,
            item_name: 'Kain',
            products: [
              {
                id: 1,
                name: 'Kain Seri A Warna B',
              },
              {
                id: 2,
                name: 'Kain Seri B Warna A',
              },
            ],
          },
        ],
      },
    }).pipe(delay(500));

    return this.httpClient.get<ApiResponse<StockFilterPrepareHttpResponse>>(
      `${this.env.apiEndpoint}/stock/filter-prepare`
    );
  }

  inquiryStocks(): Observable<ApiResponse<StockInquiryHttpResponse>> {
    return of({
      error_schema: {
        error_code: 'STO-1-000',
        http_code: 200,
        error_message: {
          indonesian: 'Berhasil mengambil detail site.',
          english: 'Successfully retrieved site details.',
        },
      },
      output_schema: {
        epoch: 1677145193628,
        items: [
          {
            description: 'Tali',
            total_big_packages: 3,
            total_small_packages: 5,
            total_sizes: [
              {
                size_description: 'Yard',
                size_amount: 1000,
              },
              {
                size_description: 'Meter',
                size_amount: 1000,
              },
            ],
            stocks: [
              {
                id_product: '11111',
                product_name: 'Tali Seri A Warna B',
                remaining_big_packages: 2,
                sizes: [
                  {
                    size_description: 'Kg',
                    size_amount: 100,
                  },
                ],
                big_packages: [
                  {
                    id_location: 'LOC1',
                    location_name: 'Gudang A',
                    id_big_packages: 'BIG001',
                    sizes: [
                      {
                        size_description: 'Kg',
                        size_amount: 10,
                      },
                    ],
                    small_packages: [
                      {
                        id_small_packages: 'SM11',
                        quantity: 3,
                        size_description: 'Yard',
                        size_amount: 20,
                        // the_smallest_packages: [
                        //   {
                        //     id_the_smallest_packages: 'SS11',
                        //     size_description: 'Meter',
                        //     size_amount: 10,
                        //   },
                        //   {
                        //     id_the_smallest_packages: 'SS12',
                        //     size_description: 'Meter',
                        //     size_amount: 12345345,
                        //   },
                        //   {
                        //     id_the_smallest_packages: 'SS12',
                        //     size_description: 'Meter',
                        //     size_amount: 12345345,
                        //   },
                        // ],
                      },
                      {
                        id_small_packages: 'SM12',
                        quantity: 1,
                        size_description: 'Kg',
                        size_amount: 10,
                        // the_smallest_packages: [
                        //   {
                        //     id_the_smallest_packages: 'SS12',
                        //     size_description: 'Meter',
                        //     size_amount: 10,
                        //   },
                        // ],
                      },
                      {
                        id_small_packages: 'SM13',
                        quantity: 1,
                        size_description: 'Kg',
                        size_amount: 20,
                        // the_smallest_packages: [
                        //   {
                        //     id_the_smallest_packages: 'SS13',
                        //     size_description: 'Meter',
                        //     size_amount: 10,
                        //   },
                        // ],
                      },
                    ],
                  },
                  {
                    id_location: 'LOC1',
                    location_name: 'Gudang A',
                    id_big_packages: 'BIG011',
                    sizes: [
                      {
                        size_description: 'Yard',
                        size_amount: 50,
                      },
                      {
                        size_description: 'Meter',
                        size_amount: 50,
                      },
                    ],
                    small_packages: [
                      {
                        id_small_packages: 'SM111',
                        quantity: 3,
                        size_description: 'Yard',
                        size_amount: 10,
                        // the_smallest_packages: [
                        //   {
                        //     id_the_smallest_packages: 'SS111',
                        //     size_description: 'Meter',
                        //     size_amount: 10,
                        //   },
                        //   {
                        //     id_the_smallest_packages: 'SS112',
                        //     size_description: 'Meter',
                        //     size_amount: 12345345,
                        //   },
                        //   {
                        //     id_the_smallest_packages: 'SS112',
                        //     size_description: 'Meter',
                        //     size_amount: 12345345,
                        //   },
                        // ],
                      },
                      {
                        id_small_packages: 'SM12',
                        quantity: 1,
                        size_description: 'Yard',
                        size_amount: 10,
                        // the_smallest_packages: [
                        //   {
                        //     id_the_smallest_packages: 'SS12',
                        //     size_description: 'Meter',
                        //     size_amount: 10,
                        //   },
                        // ],
                      },
                      {
                        id_small_packages: 'SM13',
                        quantity: 1,
                        size_description: 'Yard',
                        size_amount: 30,
                        // the_smallest_packages: [
                        //   {
                        //     id_the_smallest_packages: 'SS13',
                        //     size_description: 'Meter',
                        //     size_amount: 10,
                        //   },
                        // ],
                      },
                    ],
                  },
                ],
              },
              {
                id_product: '2222',
                product_name: 'Tali Seri B Warna A',
                remaining_big_packages: 1,
                sizes: [
                  {
                    size_description: 'Small',
                    size_amount: 100,
                  },
                ],
                big_packages: [
                  {
                    id_big_packages: 'B21',
                    id_location: 'LOC1',
                    location_name: 'Gudang A',
                    sizes: [
                      {
                        size_description: 'Yard',
                        size_amount: 100,
                      },
                      {
                        size_description: 'Meter',
                        size_amount: 100,
                      },
                    ],
                    small_packages: [
                      {
                        id_small_packages: 'SM21',
                        quantity: 5,
                        size_description: 'Medium',
                        size_amount: 50,
                        the_smallest_packages: [
                          {
                            id_the_smallest_packages: 'SS21',
                            size_description: 'Tiny',
                            size_amount: 10,
                          },
                          {
                            id_the_smallest_packages: 'SS22',
                            size_description: 'Tiny',
                            size_amount: 10,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            description: 'Kain',
            stocks: [
              {
                id_product: '3333',
                product_name: 'Kain Seri A Warna B',
                remaining_big_packages: 10,
                sizes: [
                  {
                    size_description: 'Meter',
                    size_amount: 100,
                  },
                ],
                big_packages: [
                  {
                    id_location: 'LOC2',
                    location_name: 'Gudang B',
                    id_big_packages: 'B31',
                    sizes: [
                      {
                        size_description: 'Yard',
                        size_amount: 100,
                      },
                      {
                        size_description: 'Meter',
                        size_amount: 100,
                      },
                    ],
                    small_packages: [
                      {
                        id_small_packages: 'SM31',
                        quantity: 5,
                        size_description: 'Meter',
                        size_amount: 50,
                        the_smallest_packages: [
                          {
                            id_the_smallest_packages: 'SS31',
                            size_description: 'Meter',
                            size_amount: 10,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id_product: '44',
                product_name: 'Kain Seri B Warna A',
                remaining_big_packages: 1,
                sizes: [
                  {
                    size_description: 'Meter',
                    size_amount: 100,
                  },
                ],
                big_packages: [
                  {
                    id_big_packages: 'B41',
                    id_location: 'LOC3',
                    location_name: 'Gudang C',
                    sizes: [
                      {
                        size_description: 'Yard',
                        size_amount: 100,
                      },
                      {
                        size_description: 'Meter',
                        size_amount: 100,
                      },
                    ],
                    small_packages: [
                      {
                        id_small_packages: 'S41',
                        quantity: 5,
                        size_description: 'Meter',
                        size_amount: 50,
                        the_smallest_packages: [
                          {
                            id_the_smallest_packages: 'SS41',
                            size_description: 'Meter',
                            size_amount: 10,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    }).pipe(delay(500));

    return this.httpClient.get<ApiResponse<StockInquiryHttpResponse>>(
      `${this.env.apiEndpoint}/stock/inquiry`
    );
  }
}
