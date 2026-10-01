import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE } from '../http/api';
import { AuthService } from './auth.service';

//adds the logged in user's credentials to every api request
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_BASE)) {
    return next(request);
  }

  const authorization = inject(AuthService).authorizationHeader();
  const headers: Record<string, string> = {
    //tells spring security to answer 401 without triggering the browser's own login popup
    'X-Requested-With': 'XMLHttpRequest'
  };
  if (authorization && !request.headers.has('Authorization')) {
    headers['Authorization'] = authorization;
  }

  return next(request.clone({ setHeaders: headers }));
};
