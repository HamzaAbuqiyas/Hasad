import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HasadAiService } from '../hasad-ai.service';
import { PredictionStateService } from '../prediction-state.service';
import { HasadAiAnswer, HasadAiExplanation, HasadAiPayload } from '../../../shared/models/api.models';

interface PredictionResponse {
  id?: number;
  userId?: number;
  crop?: string;
  Crop?: string;
  targetYear?: number;
  TargetYear?: number;
  year?: number;
  Year?: number;
  season?: string;
  Season?: string;
  predictedProduction?: number | null;
  PredictedProduction?: number | null;
  quality?: string;
  Quality?: string;
  priceTrend?: string;
  PriceTrend?: string;
  createdAt?: string;
}

interface ComboSegment {
  name: string;
  value: number;
  color: string;
  y: number;
  height: number;
}

interface ComboChartPoint {
  year: number;
  value: number;
  x: number;
  lineY: number;
  segments: ComboSegment[];
}

@Component({
  selector: 'app-prediction-charts',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, FormsModule],
  templateUrl: './prediction-charts.html',
  styleUrl: './prediction-charts.css'
})
export class PredictionCharts implements OnInit {

  prediction: PredictionResponse | null = null;

  comboChartPoints: ComboChartPoint[] = [];
  comboLinePoints = '';

  aiInsight: HasadAiExplanation | null = null;
  aiLoading = false;
  aiError = '';

  askQuestion = '';
  askAnswer = '';
  askLoading = false;

  constructor(
    private hasadAiService: HasadAiService,
    private predictionState: PredictionStateService
  ) {}

  ngOnInit(): void {
    // The prediction the user just made on the home page (kept by PredictionStateService).
    const saved = this.predictionState.latest();

    if (!saved) {
      this.prediction = null;
      return;
    }

    this.prediction = saved as PredictionResponse;
    this.buildCharts();
    this.loadHasadAiInsight();
  }

  buildCharts(): void {
    if (!this.prediction) {
      return;
    }

    const production = this.getProductionValue();
    const selectedYear = this.getTargetYearValue();

    const years: number[] = [];

    for (let year = selectedYear - 5; year <= selectedYear; year++) {
      years.push(year);
    }

    const factors = [0.68, 0.76, 0.84, 0.91, 0.96, 1.0];

    const values = years.map((year, index) => {
      return {
        year: year,
        value: Math.max(1, production * factors[index])
      };
    });

    this.buildComboChart(values);
  }

  buildComboChart(values: { year: number; value: number }[]): void {
    const chartTop = 35;
    const chartBottom = 310;
    const chartLeft = 70;
    const chartRight = 820;

    const maxValue = Math.max(...values.map(v => v.value)) * 1.28 || 1;

    this.comboChartPoints = values.map((item, index) => {
      const x = chartLeft + index * ((chartRight - chartLeft) / (values.length - 1));

      const segmentParts = [
        { name: 'Area', value: item.value * 0.20, color: '#8ecae6' },
        { name: 'Rainfall', value: item.value * 0.16, color: '#ffd166' },
        { name: 'Temperature', value: item.value * 0.14, color: '#f4a261' },
        { name: 'Yield', value: item.value * 0.20, color: '#90be6d' },
        { name: 'Market', value: item.value * 0.17, color: '#cdb4db' },
        { name: 'Growth', value: item.value * 0.13, color: '#adb5bd' }
      ];

      let currentY = chartBottom;

      const segments = segmentParts.map(segment => {
        const height = (segment.value / maxValue) * (chartBottom - chartTop);
        currentY -= height;

        return {
          ...segment,
          y: currentY,
          height
        };
      });

      const lineY = chartBottom - (item.value / maxValue) * (chartBottom - chartTop);

      return {
        year: item.year,
        value: item.value,
        x,
        lineY,
        segments
      };
    });

    this.comboLinePoints = this.comboChartPoints
      .map(point => `${point.x},${point.lineY}`)
      .join(' ');
  }

  loadHasadAiInsight(): void {
    if (!this.prediction) {
      return;
    }

    const payload = this.buildHasadAiPayload();

    this.aiLoading = true;
    this.aiError = '';
    this.aiInsight = null;

    this.hasadAiService.explain(payload).subscribe({
      next: (res: HasadAiExplanation) => {
        this.aiInsight = res;
        this.aiLoading = false;
      },
      error: () => {
        this.aiError = 'Hasad AI explanation is temporarily unavailable.';
        this.aiLoading = false;
      }
    });
  }

  askHasadAi(): void {
    if (!this.prediction || !this.askQuestion.trim()) {
      return;
    }

    const payload = {
      ...this.buildHasadAiPayload(),
      question: this.askQuestion.trim()
    };

    this.askLoading = true;
    this.askAnswer = '';

    this.hasadAiService.ask(payload).subscribe({
      next: (res: HasadAiAnswer) => {
        this.askAnswer = res.answer;
        this.askLoading = false;
      },
      error: () => {
        this.askAnswer = 'Sorry, Ask Hasad AI is temporarily unavailable.';
        this.askLoading = false;
      }
    });
  }

  buildHasadAiPayload(): HasadAiPayload {
    if (!this.prediction) {
      return {
        crop: '',
        targetYear: 0,
        season: '',
        predictedProduction: null,
        quality: '',
        priceTrend: '',
        chartDataSummary: ''
      };
    }

    return {
      crop: this.getCropValue(),
      targetYear: this.getTargetYearValue(),
      season: this.getSeasonValue(),
      predictedProduction: this.getProductionValue(),
      quality: this.getQualityValue(),
      priceTrend: this.getPriceTrendValue(),
      chartDataSummary: this.getChartSummary()
    };
  }

  getChartSummary(): string {
    if (!this.prediction) {
      return '';
    }

    const chartValues = this.comboChartPoints
      .map(point => `${point.year}: ${Math.round(point.value).toLocaleString()}`)
      .join(', ');

    return `
The chart summarizes the Hasad prediction for ${this.getCropValue()} in ${this.getSeasonValue()} ${this.getTargetYearValue()}.
It displays only the selected year and the five previous years.
Predicted production: ${this.formatNumber(this.getProductionValue())}.
Predicted quality: ${this.getQualityValue()}.
Predicted price trend: ${this.getPriceTrendValue()}.
The combined chart shows stacked agricultural factors and a production trend line.
Chart points are: ${chartValues}.
`;
  }

  getCropValue(): string {
    const p: any = this.prediction;
    return p?.crop ?? p?.Crop ?? 'Selected Crop';
  }

  getTargetYearValue(): number {
    const p: any = this.prediction;
    return Number(p?.targetYear ?? p?.TargetYear ?? p?.year ?? p?.Year ?? new Date().getFullYear());
  }

  getSeasonValue(): string {
    const p: any = this.prediction;
    return p?.season ?? p?.Season ?? 'Selected Season';
  }

  getProductionValue(): number {
    const p: any = this.prediction;
    return Number(p?.predictedProduction ?? p?.PredictedProduction ?? 0);
  }

  getQualityValue(): string {
    const p: any = this.prediction;
    return p?.quality ?? p?.Quality ?? 'N/A';
  }

  getPriceTrendValue(): string {
    const p: any = this.prediction;
    return p?.priceTrend ?? p?.PriceTrend ?? 'N/A';
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }

    return Math.round(Number(value)).toLocaleString();
  }

  getQualityIcon(quality: string | null | undefined): string {
    if (quality === 'High') {
      return '🌟';
    }

    if (quality === 'Medium') {
      return '⭐';
    }

    if (quality === 'Low') {
      return '⚠️';
    }

    return '❔';
  }

  getQualityMessage(quality: string | null | undefined): string {
    if (quality === 'High') {
      return 'The crop is expected to have high quality.';
    }

    if (quality === 'Medium') {
      return 'The crop is expected to have medium quality.';
    }

    if (quality === 'Low') {
      return 'The crop is expected to have low quality.';
    }

    return 'No quality result available.';
  }
}