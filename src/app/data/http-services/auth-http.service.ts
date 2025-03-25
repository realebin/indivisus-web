import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import {
  AuthLoginHttpRequest,
  AuthLoginHttpResponse,
} from '@schemas/auth-schema';
import { ApiResponse } from '@schemas/_base.schema';
import { EnvironmentService } from '@services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  constructor(
    private httpClient: HttpClient,
    private env: EnvironmentService
  ) {}

  login(
    request: AuthLoginHttpRequest
  ): Observable<ApiResponse<AuthLoginHttpResponse>> {
    // return of({
    //   error_schema: {
    //     error_code: 'ATH-1-000',
    //     http_code: 200,
    //     error_message: {
    //       indonesian: 'Sukses',
    //       english: 'Successful',
    //     },
    //   },
    //   output_schema: {
    //     epoch: 1703062974560,
    //     full_name: 'Nama Orang',
    //     role: 'admin',
    //   },
    // }).pipe(delay(1000));

    // return throwError({
    //   status: 500,
    //   code: 'ATH-2-500',
    //   message: 'error'

    // })

    return this.httpClient.post<ApiResponse<AuthLoginHttpResponse>>(
      `${this.env.apiEndpoint}/auth/login`,
      request
    );
  }
}
