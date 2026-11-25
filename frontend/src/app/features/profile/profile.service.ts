import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { SessionService } from '../../core/services/session.service';
import { UpdateProfileRequest, UpdateProfileResponse, UserProfile } from '../../shared/models/api.models';

/** The farmer's profile: /api/Auth/profile/{id}. */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  get(userId: number): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${API_BASE_URL}/Auth/profile/${userId}`)
      .pipe(tap(p => this.session.setProfileCompleted(p.isProfileCompleted)));
  }

  update(userId: number, data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http
      .put<UpdateProfileResponse>(`${API_BASE_URL}/Auth/profile/${userId}`, data)
      .pipe(tap(res => this.session.setProfileCompleted(res.user.isProfileCompleted)));
  }
}
