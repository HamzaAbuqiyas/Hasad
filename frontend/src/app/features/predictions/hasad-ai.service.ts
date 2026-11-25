import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { HasadAiAnswer, HasadAiExplanation, HasadAiPayload, HasadAiQuestion } from '../../shared/models/api.models';

/** "Hasad AI": explains a prediction in simple words (/api/HasadAi). */
@Injectable({ providedIn: 'root' })
export class HasadAiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/HasadAi`;

  explain(payload: HasadAiPayload): Observable<HasadAiExplanation> {
    return this.http.post<HasadAiExplanation>(`${this.apiUrl}/explain`, payload);
  }

  ask(payload: HasadAiQuestion): Observable<HasadAiAnswer> {
    return this.http.post<HasadAiAnswer>(`${this.apiUrl}/ask`, payload);
  }
}
