import { Injectable, signal } from '@angular/core';

import { Prediction } from '../../shared/models/api.models';

const STORAGE_KEY = 'latestPredictionResult';

/**
 * The prediction the user just made, shared between the home page and the charts page.
 * Kept in sessionStorage too, so a page refresh does not lose it.
 */
@Injectable({ providedIn: 'root' })
export class PredictionStateService {
  readonly latest = signal<Prediction | null>(this.read());

  set(prediction: Prediction): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prediction));
    this.latest.set(prediction);
  }

  private read(): Prediction | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Prediction) : null;
    } catch {
      return null;
    }
  }
}
