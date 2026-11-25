import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { DashboardService, DashboardData } from '../dashboard.service';
import { Prediction } from '../../../shared/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { errorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe, NgIf, NgFor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  dashboardData: DashboardData | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private session: SessionService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // The authGuard already made sure we are logged in, so the session has the user id.
    const userId = this.session.userId();
    if (userId === null) return;

    this.loading = true;
    this.error = '';
    this.dashboardData = null;

    this.dashboardService.load(userId).subscribe({
      next: (data: DashboardData) => {

        this.dashboardData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.error = errorMessage(err, 'Failed to load dashboard data.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }

  getCropIcon(crop: string): string {
    const cropIcons: { [key: string]: string } = {
      Almond: '🌰',
      Olive: '🫒',
      Tomato: '🍅',
      Cucumber: '🥒',
      Orange: '🍊',
      Lemon: '🍋',
      Wheat: '🌾',
      Apple: '🍎',
      Grape: '🍇',
      Strawberry: '🍓',
      Potato: '🥔'
    };

    return cropIcons[crop] || '🌱';
  }

  getProductionText(prediction: Prediction): string {
    if (
      prediction.predictedProduction === null ||
      prediction.predictedProduction === undefined
    ) {
      return 'N/A';
    }

    return Number(prediction.predictedProduction).toFixed(2);
  }

  getLatestPredictionText(): string {
    if (!this.dashboardData?.latestPrediction) {
      return 'No predictions yet';
    }

    const latest = this.dashboardData.latestPrediction;
    return `${latest.crop} - ${latest.targetYear}`;
  }
}
