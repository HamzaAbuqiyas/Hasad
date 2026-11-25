import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { Prediction } from '../../shared/models/api.models';
import { mostCommon, newestFirst } from '../../shared/utils/format';
import { ProfileService } from '../profile/profile.service';
import { PredictionService } from '../predictions/prediction.service';

export interface DashboardData {
  userName: string;
  email: string;
  accountStatus: string;
  profileCompleted: boolean;
  totalPredictions: number;
  activeCrops: string[];
  latestPrediction: Prediction | null;
  recentPredictions: Prediction[];
  mostUsedCrop: string;
}

/** Combines the profile and the predictions into what the dashboard shows. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly profiles = inject(ProfileService);
  private readonly predictions = inject(PredictionService);

  load(userId: number): Observable<DashboardData> {
    return forkJoin({
      profile: this.profiles.get(userId),
      predictions: this.predictions.getForUser(userId)
    }).pipe(
      map(({ profile, predictions }) => {
        const sorted = newestFirst(predictions);
        return {
          userName: `${profile.firstName} ${profile.lastName}`.trim() || 'User',
          email: profile.email,
          accountStatus: profile.accountStatus,
          profileCompleted: profile.isProfileCompleted,
          totalPredictions: sorted.length,
          activeCrops: profile.crops,
          latestPrediction: sorted[0] ?? null,
          recentPredictions: sorted.slice(0, 5),
          mostUsedCrop: mostCommon(sorted.map(p => p.crop || 'Unknown'))
        };
      })
    );
  }
}
