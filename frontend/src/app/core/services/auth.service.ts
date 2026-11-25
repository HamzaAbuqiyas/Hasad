import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../shared/models/api.models';
import { SessionService } from './session.service';

/** Sign up, log in, log out. Talks to /api/SignUp and /api/Auth. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  register(user: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/SignUp`, user);
  }

  /** Logs in and saves the session in one step. */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/Auth/login`, credentials)
      .pipe(tap(res => this.session.start(res)));
  }

  logout(): void {
    this.session.end();
    this.router.navigate(['/login']);
  }
}
