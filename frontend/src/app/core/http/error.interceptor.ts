import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { API_BASE, ProblemDetail } from './api';
import { NotificationService } from './notification.service';

const LOGIN_URL = `${API_BASE}/auth/me`;

//shows every failed api request to the user, so components only need to handle success
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const notification = inject(NotificationService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      //a failed login is shown on the login form itself
      if (request.url === LOGIN_URL && error.status === 401) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        notification.error('Your session has ended, please log in again');
      } else {
        notification.error(messageOf(error));
      }
      return throwError(() => error);
    })
  );
};

function messageOf(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server, check that the backend is running';
  }
  if (error.status === 403) {
    return 'You do not have permission to do this';
  }

  const problem = error.error as ProblemDetail | null;
  if (problem?.errors) {
    return Object.entries(problem.errors)
      .map(([field, message]) => `${field} ${message}`)
      .join(', ');
  }
  return problem?.detail ?? `Request failed (${error.status})`;
}
