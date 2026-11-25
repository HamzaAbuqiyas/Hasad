import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PredictionService } from '../prediction.service';
import { Prediction } from '../../../shared/models/api.models';
import { errorMessage } from '../../../core/utils/http-error';

interface CropOption {
  value: string;
  label: string;
}

interface CompareResult {
  crop: string;
  targetYear: number;
  season: string;
  predictedProduction: number | null;
  quality: string;
  priceTrend: string;
  hasError: boolean;
  errorMessage?: string;
}

@Component({
  selector: 'app-compare-crops',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterModule],
  templateUrl: './compare-crops.html',
  styleUrl: './compare-crops.css'
})
export class CompareCrops {
  selectedCrops: string[] = [];
  selectedYear: number | null = null;
  selectedSeason: string = '';

  loading = false;
  error = '';
  results: CompareResult[] = [];

  years: number[] = [];

crops: CropOption[] = [
  { value: 'Almond', label: '🌰 Almond' },
  { value: 'Apple', label: '🍎 Apple' },
  { value: 'Apricot', label: '🍑 Apricot' },
  { value: 'Armenian Cucumber', label: '🥒 Armenian Cucumber' },
  { value: 'Banana', label: '🍌 Banana' },
  { value: 'Barley', label: '🌾 Barley' },
  { value: 'Beans', label: '🫘 Beans' },
  { value: 'Cabbage', label: '🥬 Cabbage' },
  { value: 'Carrot', label: '🥕 Carrot' },
  { value: 'Cauliflower', label: '🥦 Cauliflower' },
  { value: 'Chickpeas', label: '🧆 Chickpeas' },
  { value: 'Chili Pepper', label: '🌶️ Chili Pepper' },
  { value: 'Clementine', label: '🍊 Clementine' },
  { value: 'Common Vetch', label: '🌿 Common Vetch' },
  { value: 'Cowpea', label: '🫘 Cowpea' },
  { value: 'Cucumber', label: '🥒 Cucumber' },
  { value: 'Eggplant', label: '🍆 Eggplant' },
  { value: 'Fig', label: '🌳 Fig' },
  { value: 'Garlic', label: '🧄 Garlic' },
  { value: 'Grapefruit', label: '🍊 Grapefruit' },
  { value: 'Grapes', label: '🍇 Grapes' },
  { value: 'Green Fava Beans', label: '🫘 Green Fava Beans' },
  { value: 'Green Onion', label: '🧅 Green Onion' },
  { value: 'Lemon', label: '🍋 Lemon' },
  { value: 'Lentils', label: '🫘 Lentils' },
  { value: 'Lettuce', label: '🥬 Lettuce' },
  { value: 'Mandarin', label: '🍊 Mandarin' },
  { value: 'Mediterranean Mandarin', label: '🍊 Mediterranean Mandarin' },
  { value: 'Melon', label: '🍈 Melon' },
  { value: 'Molokhia', label: '🌿 Molokhia' },
  { value: 'Navel Orange', label: '🍊 Navel Orange' },
  { value: 'Nectarine', label: '🍑 Nectarine' },
  { value: 'Okra', label: '🌿 Okra' },
  { value: 'Olive', label: '🫒 Olive' },
  { value: 'Onion', label: '🧅 Onion' },
  { value: 'Oriental Tobacco', label: '🍃 Oriental Tobacco' },
  { value: 'Parsley', label: '🌿 Parsley' },
  { value: 'Peach', label: '🍑 Peach' },
  { value: 'Pear', label: '🍐 Pear' },
  { value: 'Peas', label: '🟢 Peas' },
  { value: 'Pomegranate', label: '🔴 Pomegranate' },
  { value: 'Pomelo', label: '🍈 Pomelo' },
  { value: 'Potato', label: '🥔 Potato' },
  { value: 'Radish', label: '🌱 Radish' },
  { value: 'Sesame', label: '🌱 Sesame' },
  { value: 'Spinach', label: '🥬 Spinach' },
  { value: 'Sweet Pepper', label: '🫑 Sweet Pepper' },
  { value: 'Tomato', label: '🍅 Tomato' },
  { value: 'Turnip', label: '🥬 Turnip' },
  { value: 'Vicia', label: '🌿 Vicia' },
  { value: 'Watermelon', label: '🍉 Watermelon' },
  { value: 'Wheat', label: '🌾 Wheat' },
  { value: 'White Maize', label: '🌽 White Maize' },
  { value: 'Yellow_Maize', label: '🌽 Yellow_Maize' },
  { value: 'palm trees', label: '🌴 palm trees' },
  { value: 'zucchini', label: '🥒 zucchini' }
];

  constructor(
    private predictionService: PredictionService,
    private router: Router
  ) {
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= 10; i++) {
      this.years.push(currentYear + i);
    }
  }

  toggleCrop(crop: CropOption): void {
    this.error = '';

    if (this.selectedCrops.includes(crop.value)) {
      this.selectedCrops = this.selectedCrops.filter(c => c !== crop.value);
      return;
    }

    if (this.selectedCrops.length >= 4) {
      this.error = 'You can compare up to 4 crops only.';
      return;
    }

    this.selectedCrops.push(crop.value);
  }

  isSelected(cropValue: string): boolean {
    return this.selectedCrops.includes(cropValue);
  }

  compareCrops(): void {
    this.error = '';
    this.results = [];

    if (this.selectedCrops.length < 2) {
      this.error = 'Please select at least 2 crops to compare.';
      return;
    }

    if (!this.selectedYear || !this.selectedSeason) {
      this.error = 'Please select target year and season.';
      return;
    }

    this.loading = true;

    const requests = this.selectedCrops.map(crop => {
      // No userId: the API reads the user from the JWT token (added by the authInterceptor).
      return this.predictionService.predict({
        crop: crop,
        targetYear: Number(this.selectedYear),
        season: this.selectedSeason
      }).pipe(
        map((data: Prediction) => {
          const result: CompareResult = {
            crop: data.crop ?? crop,
            targetYear: Number(data.targetYear ?? this.selectedYear),
            season: data.season ?? this.selectedSeason,
            predictedProduction: this.toNumberOrNull(data.predictedProduction),
            quality: data.quality ?? 'N/A',
            priceTrend: data.priceTrend ?? 'N/A',
            hasError: false
          };

          return result;
        }),
        catchError((err: unknown) => {
          const failedResult: CompareResult = {
            crop: crop,
            targetYear: Number(this.selectedYear),
            season: this.selectedSeason,
            predictedProduction: null,
            quality: 'Error',
            priceTrend: 'Error',
            hasError: true,
            errorMessage: errorMessage(err, 'Prediction failed')
          };

          return of(failedResult);
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (res: CompareResult[]) => {
        this.results = res;
        this.loading = false;

        const allFailed = res.every(r => r.hasError);

        if (allFailed) {
          this.error = 'Failed to compare crops. Please make sure the API is running.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to compare crops.';
      }
    });
  }

  clearComparison(): void {
    this.selectedCrops = [];
    this.selectedYear = null;
    this.selectedSeason = '';
    this.results = [];
    this.error = '';
  }

  toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return null;
    }

    return numberValue;
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }

    return Math.round(Number(value)).toLocaleString();
  }

  getQualityClass(quality: string): string {
    return (quality || '').toLowerCase();
  }

  getTrendClass(trend: string): string {
    return (trend || '').toLowerCase();
  }

  getQualityRank(quality: string): number {
    const q = (quality || '').toLowerCase();

    if (q === 'high') return 3;
    if (q === 'medium') return 2;
    if (q === 'low') return 1;

    return 0;
  }

  getBestProductionCrop(): string {
    const valid = this.results.filter(r => !r.hasError && r.predictedProduction !== null);

    if (valid.length === 0) {
      return 'N/A';
    }

    const best = valid.reduce((max, current) => {
      return Number(current.predictedProduction) > Number(max.predictedProduction) ? current : max;
    });

    return best.crop;
  }

  getBestQualityCrop(): string {
    const valid = this.results.filter(r => !r.hasError);

    if (valid.length === 0) {
      return 'N/A';
    }

    const best = valid.reduce((max, current) => {
      return this.getQualityRank(current.quality) > this.getQualityRank(max.quality) ? current : max;
    });

    return best.crop;
  }

  getIncreaseCount(): number {
    return this.results.filter(r =>
      !r.hasError &&
      (r.priceTrend || '').toLowerCase().includes('increase')
    ).length;
  }

  getMaxProduction(): number {
    const values = this.results
      .filter(r => !r.hasError && r.predictedProduction !== null)
      .map(r => Number(r.predictedProduction));

    if (values.length === 0) {
      return 1;
    }

    return Math.max(...values);
  }

  getProductionPercent(value: number | null): number {
    if (value === null) {
      return 0;
    }

    const max = this.getMaxProduction();

    if (max <= 0) {
      return 0;
    }

    return Math.max(6, (Number(value) / max) * 100);
  }
}