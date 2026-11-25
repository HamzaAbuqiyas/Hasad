import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, KeyValue } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, ReportsData } from '../reports.service';
import { Prediction } from '../../../shared/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { errorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  reportsData: ReportsData | null = null;
  loading: boolean = true;
  error: string = '';
  // Filtering / Pagination / Grouping state
  filterText: string = '';
  selectedCrop: string = 'All';
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  filteredPredictions: Prediction[] = [];
  pagedPredictions: Prediction[] = [];
  groupedPredictions: { [year: string]: Prediction[] } = {};
  groupedArray: Array<{ key: string; value: Prediction[] }> = [];
  groupByYear: boolean = false;

  constructor(
    private router: Router,
    private reportsService: ReportsService,
    private session: SessionService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    // The authGuard already made sure we are logged in, so the session has the user id.
    const userId = this.session.userId();
    if (userId === null) return;

    this.loading = true;
    this.error = '';
    this.reportsData = null;

    this.reportsService.load(userId).subscribe({
      next: (data: ReportsData) => {

        this.reportsData = data;
        this.loading = false;
        this.resetFiltersAndPagination();
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.error = errorMessage(err, 'Failed to load reports.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private resetFiltersAndPagination(): void {
    this.filterText = '';
    this.selectedCrop = 'All';
    this.pageSize = 10;
    this.currentPage = 1;
    this.groupByYear = false;
  }

  applyFilters(): void {
    if (!this.reportsData) return;

    const q = (this.filterText || '').toLowerCase().trim();

    this.filteredPredictions = this.reportsData.predictions.filter(p => {
      const cropMatch = this.selectedCrop === 'All' || p.crop === this.selectedCrop;
      const textMatch =
        !q ||
        p.crop.toLowerCase().includes(q) ||
        (p.season || '').toLowerCase().includes(q) ||
        (p.priceTrend || '').toLowerCase().includes(q);

      return cropMatch && textMatch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (this.groupByYear) {
      // Build grouped map by targetYear
      this.groupedPredictions = this.filteredPredictions.reduce((acc, cur) => {
        const year = String(cur.targetYear || new Date(cur.createdAt).getFullYear());
        (acc[year] = acc[year] || []).push(cur);
        return acc;
      }, {} as { [year: string]: Prediction[] });

      // create sorted array of groups (years desc)
      this.groupedArray = Object.keys(this.groupedPredictions)
        .sort((a, b) => Number(b) - Number(a))
        .map(k => ({ key: k, value: this.groupedPredictions[k] }));

      this.pagedPredictions = [];
      this.totalPages = 1;
      this.currentPage = 1;
    } else {
      // Pagination
      this.totalPages = Math.max(1, Math.ceil(this.filteredPredictions.length / this.pageSize));
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

      const start = (this.currentPage - 1) * this.pageSize;
      this.pagedPredictions = this.filteredPredictions.slice(start, start + this.pageSize);
      this.groupedPredictions = {};
      this.groupedArray = [];
    }
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages) return;
    this.currentPage = nextPage;
    this.applyFilters();
  }

  toggleGroupByYear(): void {
    this.groupByYear = !this.groupByYear;
    this.applyFilters();
  }

  compareYearDesc = (a: KeyValue<string, Prediction>, b: KeyValue<string, Prediction>) => {
    // sort years descending
    return Number(b.key) - Number(a.key);
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

  getQualityClass(quality: string | null): string {
    const value = (quality || '').toLowerCase();

    if (value === 'high') {
      return 'quality-high';
    }

    if (value === 'medium') {
      return 'quality-medium';
    }

    if (value === 'low') {
      return 'quality-low';
    }

    return 'quality-normal';
  }

  getTrendClass(priceTrend: string | null): string {
    const value = (priceTrend || '').toLowerCase();

    if (value.includes('increase')) {
      return 'trend-increase';
    }

    if (value.includes('decrease')) {
      return 'trend-decrease';
    }

    return 'trend-normal';
  }
}
