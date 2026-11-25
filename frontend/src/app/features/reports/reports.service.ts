import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Prediction } from '../../shared/models/api.models';
import { mostCommon, newestFirst, qualityLevel, trendDirection } from '../../shared/utils/format';
import { PredictionService } from '../predictions/prediction.service';

export interface CropSummary {
  crop: string;
  totalPredictions: number;
  latestYear: number;
  latestQuality: string | null;
  latestPriceTrend: string | null;
}

export interface ReportsData {
  totalPredictions: number;
  totalCrops: number;
  highQualityCount: number;
  increaseTrendCount: number;
  decreaseTrendCount: number;
  mostPredictedCrop: string;
  latestPredictionDate: string | null;
  predictions: Prediction[];
  cropSummaries: CropSummary[];
}

/** Statistics for the reports page, built from the user's predictions. */
@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly predictions = inject(PredictionService);

  load(userId: number): Observable<ReportsData> {
    return this.predictions.getForUser(userId).pipe(map(list => ReportsService.build(list)));
  }

  /** Pure function (no HTTP): easy to unit-test. */
  static build(list: Prediction[]): ReportsData {
    const sorted = newestFirst(list);
    return {
      totalPredictions: sorted.length,
      totalCrops: new Set(sorted.map(p => p.crop)).size,
      highQualityCount: sorted.filter(p => qualityLevel(p.quality) === 'high').length,
      increaseTrendCount: sorted.filter(p => trendDirection(p.priceTrend) === 'increase').length,
      decreaseTrendCount: sorted.filter(p => trendDirection(p.priceTrend) === 'decrease').length,
      mostPredictedCrop: mostCommon(sorted.map(p => p.crop || 'Unknown')),
      latestPredictionDate: sorted[0]?.createdAt ?? null,
      predictions: sorted,
      cropSummaries: ReportsService.summaries(sorted)
    };
  }

  private static summaries(sorted: Prediction[]): CropSummary[] {
    const byCrop = new Map<string, Prediction[]>();
    for (const p of sorted) {
      const crop = p.crop || 'Unknown';
      byCrop.set(crop, [...(byCrop.get(crop) ?? []), p]);
    }
    return [...byCrop.entries()].map(([crop, items]) => ({
      crop,
      totalPredictions: items.length,
      latestYear: items[0].targetYear,
      latestQuality: items[0].quality,
      latestPriceTrend: items[0].priceTrend
    }));
  }
}
