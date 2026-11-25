import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { WeatherData } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  getAmman(): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${API_BASE_URL}/Weather/amman`);
  }
}
