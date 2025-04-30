import { catchError, map, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserManagementHttpService } from '@http_services/user-management-http.service';
import { ErrorOutputWrapper } from '@models/_base.model';
import {
  transformToUserManagementCreateAppUserHttpRequest,
  transformToUserManagementCreateCustomerHttpRequest,
  transformToUserManagementCreateSupplierHttpRequest,
  transformToUserManagementDeleteHttpRequest,
  transformToUserManagementInquiryAppUserModelResponse,
  transformToUserManagementInquiryCustomerModelResponse,
  transformToUserManagementInquirySupplierModelResponse,
  UserManagementCreateAppUserModelRequest,
  UserManagementCreateCustomerModelRequest,
  UserManagementCreateSupplierModelRequest,
  UserManagementDeleteModelRequest,
  UserManagementInquiryAppUserModelResponse,
  UserManagementInquiryCustomerModelResponse,
  UserManagementInquirySupplierModelResponse,
} from '@models/user-management.model';
import {
  UserManagementInquiryAppUserHttpResponse,
  UserManagementInquiryCustomerHttpResponse,
  UserManagementInquirySupplierHttpResponse,
} from '@schemas/user-management.schema';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor(private userManagementHttpService: UserManagementHttpService) { }

  inquiryAppUser(): Observable<UserManagementInquiryAppUserModelResponse> {
    return this.userManagementHttpService.inquiryAppUser().pipe(
      map((response) => {
        return transformToUserManagementInquiryAppUserModelResponse(
          response.output_schema
        );
      }),
      catchError(
        (
          error: ErrorOutputWrapper<UserManagementInquiryAppUserHttpResponse>
        ) => {
          return throwError({
            ...error,
            data: error?.data
              ? transformToUserManagementInquiryAppUserModelResponse(
                error?.data
              )
              : null,
          });
        }
      )
    );
  }

  inquiryCustomer(): Observable<UserManagementInquiryCustomerModelResponse> {
    return this.userManagementHttpService.inquiryCustomer().pipe(
      map((response) => {
        return transformToUserManagementInquiryCustomerModelResponse(
          response.output_schema
        );
      }),
      catchError(
        (
          error: ErrorOutputWrapper<UserManagementInquiryCustomerHttpResponse>
        ) => {
          return throwError({
            ...error,
            data: error?.data
              ? transformToUserManagementInquiryCustomerModelResponse(
                error?.data
              )
              : null,
          });
        }
      )
    );
  }

  inquirySupplier(): Observable<UserManagementInquirySupplierModelResponse> {
    return this.userManagementHttpService.inquirySupplier().pipe(
      map((response) => {
        return transformToUserManagementInquirySupplierModelResponse(
          response.output_schema
        );
      }),
      catchError(
        (
          error: ErrorOutputWrapper<UserManagementInquirySupplierHttpResponse>
        ) => {
          return throwError({
            ...error,
            data: error?.data
              ? transformToUserManagementInquirySupplierModelResponse(
                error?.data
              )
              : null,
          });
        }
      )
    );
  }

  createAppUser(
    data: UserManagementCreateAppUserModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .createAppUser(
        transformToUserManagementCreateAppUserHttpRequest(data)
      )
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

  createCustomer(
    data: UserManagementCreateCustomerModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .createCustomer(
        transformToUserManagementCreateCustomerHttpRequest(data)
      )
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

  createSupplier(
    data: UserManagementCreateSupplierModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .createSupplier(
        transformToUserManagementCreateSupplierHttpRequest(data)
      )
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

  editAppUser(
    data: UserManagementCreateAppUserModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .editAppUser(
        transformToUserManagementCreateAppUserHttpRequest(data)
      )
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

  editCustomer(
    data: UserManagementCreateCustomerModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .editCustomer(
        transformToUserManagementCreateCustomerHttpRequest(data)
      )
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

  editSupplier(
    data: UserManagementCreateSupplierModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .editSupplier(
        transformToUserManagementCreateSupplierHttpRequest(data)
      )
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

  deleteUser(
    data: UserManagementDeleteModelRequest
  ): Observable<string> {
    return this.userManagementHttpService
      .deleteUser(
        transformToUserManagementDeleteHttpRequest(data)
      )
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
}
