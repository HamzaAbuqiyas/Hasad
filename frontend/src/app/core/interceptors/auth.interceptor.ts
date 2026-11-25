import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { SessionService } from '../services/session.service';

/**
 * Runs for every HTTP request:
 * 1. adds "Authorization: Bearer <token>" — only for OUR API (the token never goes to other sites);
 * 2. if the API answers 401 (token expired / invalid), ends the session and goes to the login page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  const isOurApi = req.url.startsWith(API_BASE_URL);
  const token = session.token;

  const request = isOurApi && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginCall = req.url.endsWith('/Auth/login');
      if (isOurApi && error.status === 401 && !isLoginCall) {
        session.end();
        router.navigate(['/login'], { queryParams: { expired: true } });
      }
      return throwError(() => error);
    })
  );
};
