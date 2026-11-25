import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WeatherService } from '../weather.service';
import { WeatherData, DailyForecast } from '../../../shared/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { errorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './weather.html',
  styleUrl: './weather.css'
})
export class Weather implements OnInit {
  weatherData: WeatherData | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private weatherService: WeatherService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWeather();
  }

  loadWeather(): void {
    this.loading = true;
    this.error = '';
    this.weatherData = null;

    this.weatherService.getAmman().subscribe({
      next: (data: WeatherData) => {

        this.weatherData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.error = errorMessage(err, 'Failed to load Amman weather data.');

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refreshWeather(): void {
    this.loadWeather();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }

  getWeatherIcon(condition: string): string {
    const value = (condition || '').toLowerCase();

    if (value.includes('clear')) {
      return '☀️';
    }

    if (value.includes('cloud')) {
      return '☁️';
    }

    if (value.includes('rain') || value.includes('drizzle')) {
      return '🌧️';
    }

    if (value.includes('thunder')) {
      return '⛈️';
    }

    if (value.includes('fog')) {
      return '🌫️';
    }

    if (value.includes('snow')) {
      return '❄️';
    }

    return '🌤️';
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    return Number(value).toFixed(1);
  }

  getForecastTempText(day: DailyForecast): string {
    const max = this.formatNumber(day.maxTemperature);
    const min = this.formatNumber(day.minTemperature);

    return `${max}°C / ${min}°C`;
  }
}
