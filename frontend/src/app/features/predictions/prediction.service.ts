import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { Prediction, PredictionRequest } from '../../shared/models/api.models';

/** The ML model can be slow (it sleeps on the free Render plan), so we wait up to 2 minutes. */
const PREDICTION_TIMEOUT_MS = 120_000;

/** /api/Predictions. The API takes the user from the login token, so no userId is sent. */
@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/Predictions`;

  predict(request: PredictionRequest): Observable<Prediction> {
    return this.http.post<Prediction>(`${this.apiUrl}/predict`, request).pipe(timeout(PREDICTION_TIMEOUT_MS));
  }

  getForUser(userId: number): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.apiUrl}/user/${userId}`);
  }

  getLatest(userId: number): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.apiUrl}/latest/${userId}`);
  }
}
