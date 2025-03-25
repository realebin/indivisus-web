import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EnvironmentService } from '@services/environment.service';
import { ApiResponse } from '@schemas/_base.schema';
import {
  SiteAllListOverviewHttpResponse,
  SiteCreateEditHttpRequest,
  SiteDeleteHttpRequest,
  SiteDetailInquiryHttpResponse,
  SiteInquiryHttpResponse,
} from '@schemas/site.schema';

@Injectable({
  providedIn: 'root',
})
export class SiteHttpService {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService
  ) {}

  inquirySites(): Observable<ApiResponse<SiteInquiryHttpResponse>> {
    return of({
      error_schema: {
        error_code: 'STS-1-000',
        http_code: 200,
        error_message: {
          indonesian: 'Sukses',
          english: 'Successful',
        },
      },
      output_schema: {
        epoch: 234324,
        sites: [
          {
            id: 398424,
            address: 'Jl. Contoh No. 12',
            city: 'Bandung',
            name: 'Pabrik Jalan Contoh',
            pic: 'John Doe',
            phone: '021875454',
            stocks: [
              {
                description: 'Tali',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 123.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
            ],
            packages: [
              {
                description: 'Tali',
                amount: 12,
              },
            ],
          },
          {
            id: 3453432,
            address: 'Jl. Apa Ayo No. 12',
            city: 'Bandung',
            name: 'Pabrik Jalan Apa Ayo',
            pic: 'John Doe',
            phone: '021875454',
            stocks: [
              {
                description: 'Tali',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 123.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
              {
                description: 'Kain',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 122.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
            ],
            packages: [
              {
                description: 'Tali',
                amount: 12,
              },
              {
                description: 'Kain',
                amount: 12,
              },
            ],
          },
          {
            id: 345342,
            address: 'Jl. Apa Ayo No. 12',
            city: 'Bandung',
            name: 'Pabrik Jalan Apa Ayo',
            pic: 'John Doe',
            phone: '021875454',
            stocks: [
              {
                description: 'Tali',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 123.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
              {
                description: 'Kain',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 122.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
            ],
            packages: [
              {
                description: 'Tali',
                amount: 12,
              },
              {
                description: 'Kain',
                amount: 12,
              },
            ],
          },
          {
            id: 3452222,
            address: 'Jl. Apa Ayo No. 12',
            city: 'Bandung',
            name: 'Pabrik Jalan Apa Ayo',
            pic: 'John Doe',
            phone: '021875454',
            stocks: [
              {
                description: 'Tali',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 123.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
              {
                description: 'Kain',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 122.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
            ],
            packages: [
              {
                description: 'Tali',
                amount: 12,
              },
              {
                description: 'Kain',
                amount: 12,
              },
            ],
          },
          {
            id: 3453234,
            address: 'Jl. Apa Ayo No. 12',
            city: 'Bandung',
            name: 'Pabrik Jalan Apa Ayo',
            pic: 'John Doe',
            phone: '021875454',
            stocks: [
              {
                description: 'Tali',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 123.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
              {
                description: 'Kain',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 122.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
            ],
            packages: [
              {
                description: 'Tali',
                amount: 12,
              },
              {
                description: 'Kain',
                amount: 12,
              },
            ],
          },
          {
            id: 345345,
            address: 'Jl. Apa Ayo No. 12',
            city: 'Bandung',
            name: 'Pabrik Jalan Apa Ayo',
            pic: 'John Doe',
            phone: '021875454',
            stocks: [
              {
                description: 'Tali',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 123.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
              {
                description: 'Kain',
                sizes: [
                  {
                    size_description: 'Yard',
                    size_amount: 122.4,
                  },
                  {
                    size_description: 'Meter',
                    size_amount: 12,
                  },
                ],
              },
            ],
            packages: [
              {
                description: 'Tali',
                amount: 12,
              },
              {
                description: 'Kain',
                amount: 12,
              },
            ],
          },
        ],
      },
    });

    return this.httpClient.get<ApiResponse<SiteInquiryHttpResponse>>(
      `${this.env.apiEndpoint}/site-management/site/inquiry`
    );
  }

  createEditSite(
    request: SiteCreateEditHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    return of({
      error_schema: {
        error_code: 'STS-1-000',
        http_code: 200,
        error_message: {
          indonesian: 'Berhasil membuat site.',
          english: 'Success on making the site.',
        },
      },
      output_schema: { epoch: 1677145193628 },
    }).pipe(delay(500));

    return this.httpClient.post<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/site-management/site/create`,
      request
    );
  }

  deleteSite(
    request: SiteDeleteHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    return of({
      error_schema: {
        error_code: 'STS-1-000',
        http_code: 200,
        error_message: {
          indonesian: 'Berhasil menghapus site.',
          english: 'Delete site success.',
        },
      },
      output_schema: { epoch: 1677145193628 },
    }).pipe(delay(500));

    return this.httpClient.post<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/site-management/site/delete`,
      request
    );
  }

  getSiteDetail(
    siteId: number
  ): Observable<ApiResponse<SiteDetailInquiryHttpResponse>> {
    return of({
      error_schema: {
        error_code: 'STS-1-000',
        http_code: 200,
        error_message: {
          indonesian: 'Berhasil mengambil detail site.',
          english: 'Successfully retrieved site details.',
        },
      },
      output_schema: {
        epoch: 1677145193628,
        site_name: 'Bandung',
        id_site: 123,
        items: [
          {
            description: 'Tali',
            stocks: [
              {
                id_product: '11111',
                product_name: 'Tali Seri A Warna B',
                remaining_big_packages: 2,
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
                big_packages: [
                  {
                    id_big_packages: 'BIG001',
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
                    smaller_packages: [
                      {
                        id_smaller_packages: 'SM11',
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
                        id_smaller_packages: 'SM12',
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
                        id_smaller_packages: 'SM13',
                        quantity: 1,
                        size_description: 'Yard',
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
                    smaller_packages: [
                      {
                        id_smaller_packages: 'SM111',
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
                        id_smaller_packages: 'SM12',
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
                        id_smaller_packages: 'SM13',
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
                    smaller_packages: [
                      {
                        id_smaller_packages: 'SM21',
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
                product_name: 'Tali Seri A Warna B',
                remaining_big_packages: 10,
                sizes: [
                  {
                    size_description: 'Meter',
                    size_amount: 100,
                  },
                ],
                big_packages: [
                  {
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
                    smaller_packages: [
                      {
                        id_smaller_packages: 'SM31',
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
                product_name: 'Tali Seri B Warna A',
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
                    smaller_packages: [
                      {
                        id_smaller_packages: 'S41',
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
    return this.httpClient.get<ApiResponse<SiteDetailInquiryHttpResponse>>(
      `${this.env.apiEndpoint}/site-management/site/${siteId}`
    );
  }

  getSiteForFilter(): Observable<ApiResponse<SiteAllListOverviewHttpResponse>> {
    return this.httpClient.get<ApiResponse<SiteAllListOverviewHttpResponse>>(
      `${this.env.apiEndpoint}/site-management/site/list-all`
    );
  }
}
