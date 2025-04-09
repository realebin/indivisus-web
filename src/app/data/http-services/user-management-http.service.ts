import { delay, Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EnvironmentService } from '@services/environment.service';
import {
  UpdatePasswordUserHttpRequest,
  UserManagementCreateAppUserHttpRequest,
  UserManagementCreateCustomerHttpRequest,
  UserManagementCreateSupplierHttpRequest,
  UserManagementDeleteHttpRequest,
  UserManagementInquiryAppUserHttpResponse,
  UserManagementInquiryCustomerHttpResponse,
  UserManagementInquirySupplierHttpResponse,
} from '@schemas/user-management.schema';
import { ApiResponse } from '@schemas/_base.schema';
import { UserManagementDictionaryEnum } from '@cores/enums/custom-variable.enum';
// import { HttpServiceHelper } from './http-service-helper';
// enum HeaderKeyEnum {
//   NewTokenHeader = 'X-Ch-1',
//   SendToken = 'Bearer-Token'

// }
@Injectable({
  providedIn: 'root',
})
export class UserManagementHttpService {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService // private httpServiceHelper: HttpServiceHelper
  ) {}

  // token = localStorage.getItem('authToken');
  // header = new HttpHeaders({
  //   Authorization: `Bearer ${this.token || ''}`,
  // });

  inquiryAppUser(): Observable<
    ApiResponse<UserManagementInquiryAppUserHttpResponse>
  > {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Sukses',
    //       english: 'Successful',
    //     },
    //   },
    //   output_schema: {
    //     epoch: 234324,
    //     app_users: [
    //       {
    //         id: 1,
    //         role: 'Admin',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         username: 'johndoe',
    //         password: 'secure123',
    //         full_name: 'John Doe',
    //         site: 'SLO'
    //       },
    //       {
    //         id: 2,
    //         role: 'Admin',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         username: 'johndoe',
    //         password: 'secure123',
    //         full_name: 'John Doe',
    //         site: 'SLO'
    //       },
    //       {
    //         id: 3,
    //         role: 'Admin',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         username: 'johndoe',
    //         password: 'secure123',
    //         full_name: 'John Doe',
    //         site: 'BDG'
    //       },
    //       {
    //         id: 4,
    //         role: 'Admin',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         username: 'johndoe',
    //         password: 'secure123',
    //         full_name: 'John Doe',
    //         site: 'SLO'
    //       },
    //       {
    //         id: 5,
    //         role: 'Admin',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         username: 'johndoe',
    //         password: 'secure123',
    //         full_name: 'John Doe',
    //         site: 'SLO'
    //       },
    //     ],
    //   },
    // })

    return this.httpClient.get<
      ApiResponse<UserManagementInquiryAppUserHttpResponse>
    >(`${this.env.apiEndpoint}/user-management/app-user/list-all`, {
      // headers: this.header,
    });
  }

  inquiryCustomer(): Observable<
    ApiResponse<UserManagementInquiryCustomerHttpResponse>
  > {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Sukses',
    //       english: 'Successful',
    //     },
    //   },
    //   output_schema: {
    //     epoch: 234324,
    //     customers: [
    //       {
    //         id: 1,
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         full_name: 'John Doe',
    //         address: 'Jl. Adadeh No. 2',
    //         phone_number: '3453489543',
    //         city: 'Bandung',
    //         postal_code: '40127',
    //         notes: 'Customer Tali',
    //       },
    //     ],
    //   },
    // });

    return this.httpClient.get<
      ApiResponse<UserManagementInquiryCustomerHttpResponse>
    >(`${this.env.apiEndpoint}/user-management/customer/list-all`, {
      // headers: this.header,
    });
  }

  inquirySupplier(): Observable<
    ApiResponse<UserManagementInquirySupplierHttpResponse>
  > {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Sukses',
    //       english: 'Successful',
    //     },
    //   },
    //   output_schema: {
    //     epoch: 234324,
    //     suppliers: [
    //       {
    //         id: 1,
    //         name: 'PT Indah Indahan',
    //         address: 'Jl. Adadeh No. 2',
    //         phone_number: '3453489543',
    //         city: 'Bandung',
    //         country: 'Indonesia',
    //         postal_code: '40123',
    //         description: 'Supplier Tali',
    //       },
    //     ],
    //   },
    // });

    return this.httpClient.get<
      ApiResponse<UserManagementInquirySupplierHttpResponse>
    >(`${this.env.apiEndpoint}/user-management/supplier/list-all`, {
      // headers: this.header,
    });
  }

  createAppUser(
    request: UserManagementCreateAppUserHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil membuat user.',
    //       english: 'Success on making the user.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.post<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/app-user/create`,
      request,
      {
        // headers: this.header,
      }
    );
  }

  editAppUser(
    request: UserManagementCreateAppUserHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil membuat user.',
    //       english: 'Success on making the user.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.put<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/app-user/update`,
      request,
      {
        // headers: this.header,
      }
    );
  }

  // ? krn endpointnya sama dan harus di reuse terus
  // ? terusan untuk beda kepentingan,
  // ? jadi buat http service terpisan
  updateAppUserPassword(
    request: UpdatePasswordUserHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil update password.',
    //       english: 'Success on updating the pasword.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.post<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/app-user/update`,
      request,
    );
  }

  createSupplier(
    request: UserManagementCreateSupplierHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil membuat user.',
    //       english: 'Success on making the user.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.post<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/supplier/create`,
      request,
      {
        // headers: this.header,
      }
    );
  }

  editSupplier(
    request: UserManagementCreateSupplierHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil membuat user.',
    //       english: 'Success on making the user.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.put<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/supplier/update`,
      request,
      {
        // headers: this.header,
      }
    );
  }

  createCustomer(
    request: UserManagementCreateCustomerHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil membuat user.',
    //       english: 'Success on making the user.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.post<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/customer/create`,
      request,
      {
        // headers: this.header,
      }
    );
  }

  editCustomer(
    request: UserManagementCreateCustomerHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil membuat user.',
    //       english: 'Success on making the user.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    return this.httpClient.put<ApiResponse<{ epoch: number }>>(
      `${this.env.apiEndpoint}/user-management/customer/update`,
      request,
      {
        // headers: this.header,
      }
    );
  }

  deleteUser(
    request: UserManagementDeleteHttpRequest
  ): Observable<ApiResponse<{ epoch: number }>> {
    // return of({
    //   error_schema: {
    //     error_code: 'UMA-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Berhasil menghapus user.',
    //       english: 'Delete user success.',
    //     },
    //   },
    //   output_schema: { epoch: 1677145193628 },
    // }).pipe(delay(500));

    if (request.type === UserManagementDictionaryEnum.AppUser) {
      return this.httpClient.delete<ApiResponse<{ epoch: number }>>(
        `${this.env.apiEndpoint}/user-management/app-user/delete/${request.id}`
      );
    } else if (request.type === UserManagementDictionaryEnum.Customer) {
      return this.httpClient.delete<ApiResponse<{ epoch: number }>>(
        `${this.env.apiEndpoint}/user-management/customer/delete/${request.id}`
      );
    } else {
      return this.httpClient.delete<ApiResponse<{ epoch: number }>>(
        `${this.env.apiEndpoint}/user-management/supplier/delete/${request.id}`
      );
    }
  }
}
