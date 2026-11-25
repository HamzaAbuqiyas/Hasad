import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { MessageResponse } from '../../shared/models/api.models';

/** Forgot password → code by email → new password. */
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/Auth`;

  requestCode(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, { email: email.trim().toLowerCase() });
  }

  verifyCode(email: string, code: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/verify-reset-code`, {
      email: email.trim().toLowerCase(),
      code: code.trim()
    });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, {
      email: email.trim().toLowerCase(),
      code: code.trim(),
      newPassword
    });
  }
}
