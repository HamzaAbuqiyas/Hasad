import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PredictionService } from '../../predictions/prediction.service';
import { PredictionStateService } from '../../predictions/prediction-state.service';
import { Prediction, PredictionRequest } from '../../../shared/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { errorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, RouterModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage {
  selectedCrop: string = '';
  cropSearch: string = '';
showCropDropdown: boolean = false;
  selectedYear: number | null = null;
  selectedSeason: string = '';

  result: string = '';
  predictionError: string = '';
  loadingPrediction: boolean = false;
  predictionResult: Prediction | null = null;

  crops = [

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

  years: number[] = [];

  stats = [
    { number: 'AI', label: 'Prediction Model' },
    { number: 'SQL', label: 'Saved Results' },
    { number: 'JO', label: 'Jordan Crops' }
  ];

  constructor(
    private predictionService: PredictionService,
    private predictionState: PredictionStateService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= 10; i++) {
      this.years.push(currentYear + i);
    }
  }

  predict(): void {
  this.result = '';
  this.predictionError = '';
  this.predictionResult = null;
  this.loadingPrediction = true;
  this.cdr.detectChanges();

  if (!this.selectedCrop || !this.selectedYear || !this.selectedSeason) {
    this.loadingPrediction = false;
    this.predictionError = 'Please select crop, target year, and season.';
    this.cdr.detectChanges();
    return;
  }

  // No userId here: the API reads the user from the JWT token (added by the authInterceptor).
  const request: PredictionRequest = {
    crop: String(this.selectedCrop),
    targetYear: Number(this.selectedYear),
    season: String(this.selectedSeason)
  };


  // The 2-minute timeout lives in PredictionService (the ML model can be slow to wake up).
  this.predictionService.predict(request)
    .subscribe({
      next: (data: Prediction) => {

        const normalizedData: Prediction = {
          ...data,
          crop: data.crop,
          targetYear: data.targetYear,
          season: data.season,
          predictedProduction: data.predictedProduction,
          quality: data.quality,
          priceTrend: data.priceTrend
        };

        this.predictionResult = normalizedData;

        this.predictionState.set(normalizedData);

        this.result =
          `Crop: ${normalizedData.crop}\n` +
          `Target Year: ${normalizedData.targetYear}\n` +
          `Season: ${normalizedData.season}\n` +
          `Predicted Production: ${normalizedData.predictedProduction ?? 'N/A'}\n` +
          `Quality: ${normalizedData.quality || 'N/A'}\n` +
          `Price Trend: ${normalizedData.priceTrend || 'N/A'}`;

        this.loadingPrediction = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          const resultSection = document.querySelector('.result-section');
          resultSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
      error: (err: unknown) => {
        this.predictionError = errorMessage(err, 'Failed to generate prediction.');

        this.loadingPrediction = false;
        this.cdr.detectChanges();
      }
    });
}

 
  scrollToPrediction(): void {
    const element = document.getElementById('prediction-section');

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  viewPredictionCharts(): void {
    if (!this.predictionResult) {
      this.predictionError = 'Please generate a prediction first.';
      return;
    }

    this.predictionState.set(this.predictionResult);
    this.router.navigate(['/prediction-charts']);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
  
}

