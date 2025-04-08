import { catchError, map, Observable, throwError } from 'rxjs';

import { Injectable } from '@angular/core';
import {
  AuthLoginModelRequest,
  AuthLoginModelResponse,
  transformToAuthLoginHttpRequest,
  transformToAuthLoginModelResponse,
} from '@models/auth.model';
import { ErrorOutputWrapper } from '@models/_base.model';
import { AuthLoginHttpResponse } from '@schemas/auth-schema';
import { AuthHttpService } from '@http_services/auth-http.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private authHttpService: AuthHttpService,
    private router: Router
  ) { }

  login(data: AuthLoginModelRequest): Observable<AuthLoginModelResponse> {
    const request = transformToAuthLoginHttpRequest(data);
    return this.authHttpService.login(request).pipe(
      map((response) => {
        if (response?.output_schema?.data?.token) {
          localStorage.setItem(
            'authToken',
            response?.output_schema?.data?.token
          );
          localStorage.setItem(
            'username',
            response?.output_schema?.data?.username
          );
          localStorage.setItem(
            'name',
            response?.output_schema?.data?.full_name
          );
          localStorage.setItem(
            'role',
            response?.output_schema?.data?.role
          );
        }
        return transformToAuthLoginModelResponse(response.output_schema);
      }),
      catchError((error: ErrorOutputWrapper<AuthLoginHttpResponse>) => {
        return throwError({
          ...error,
          data: error?.data
            ? transformToAuthLoginModelResponse(error?.data)
            : null,
        });
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('name');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
