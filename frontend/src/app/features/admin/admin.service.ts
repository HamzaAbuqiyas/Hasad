import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { AccountStatus, AdminPrediction, AdminSummary, AdminUser, MessageResponse, UserRole } from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${API_BASE_URL}/Admin`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.apiUrl}/summary`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  updateUserStatus(userId: number, accountStatus: AccountStatus) {
    return this.http.put<{ message: string; userId: number; accountStatus: AccountStatus }>(
      `${this.apiUrl}/users/${userId}/status`,
      { accountStatus }
    );
  }

  updateUserRole(userId: number, role: UserRole) {
    return this.http.put<{ message: string; userId: number; role: UserRole }>(
      `${this.apiUrl}/users/${userId}/role`,
      { role }
    );
  }

  deleteUser(userId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/users/${userId}`);
  }

  getPredictions(): Observable<AdminPrediction[]> {
    return this.http.get<AdminPrediction[]>(`${this.apiUrl}/predictions`);
  }

  deletePrediction(predictionId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/predictions/${predictionId}`);
  }
}
