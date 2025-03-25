import { AuthService } from '@services/auth.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { LoadingService } from '@services/loading.service';

interface ErrorSchema {
  error_code: string;
  http_code: number;
  error_message: {
    indonesian: string;
    english: string;
  };
}

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(
    private loadingService: LoadingService,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');
    let modifiedRequest = request;

    if (token) {
      const cleanToken = token.startsWith('"') ? JSON.parse(token) : token;

      modifiedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
    }

    return next.handle(modifiedRequest).pipe(
      timeout(60000), // Add 60 seconds timeout
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const newChToken = event.headers.get('x-ch-1');
          if (newChToken) {
            localStorage.setItem('authToken', newChToken);
          }
        }
      }),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        // Handle timeout error
        if (error instanceof TimeoutError) {
          const customError = {
            status: 408, // Request Timeout status
            message: 'Request timed out. Please try again later.',
            errorCode: 'REQUEST_TIMEOUT',
          };
          return throwError(() => customError);
        }

        // Original error handling for HttpErrorResponse
        const httpError = error as HttpErrorResponse;
        const newChToken = httpError.headers?.get('x-ch-1');

        if (newChToken) {
          localStorage.setItem('authToken', newChToken);
        }

        let errorMessage = this.tranformErrorMessage(httpError);

        if (httpError.error?.error_schema) {
          const errorSchema = httpError.error.error_schema as ErrorSchema;

          if (errorSchema.error_message) {
            errorMessage = errorSchema.error_message.indonesian || errorMessage;
          }
        }

        const customError = {
          status: httpError.status,
          message: errorMessage,
          errorCode: httpError.error?.error_schema?.error_code,
        };

        return throwError(() => customError);
      })
    );
  }

  private tranformErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Please check your information and try again.';
      case 401:
        return 'Your session has expired. Please login again.';
      case 403:
        this.authService.logout();
        alert('You have been logged out. Please login again to continue.');
        return 'You have been logged out. Please login again to continue.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timed out. Please try again later.';
      case 500:
        return 'Something went wrong on our server. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
