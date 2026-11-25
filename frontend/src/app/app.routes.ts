import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';
import { Homepage } from './features/home/homepage/homepage';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { Profile } from './features/profile/profile/profile';
import { Reports } from './features/reports/reports/reports';
import { Weather } from './features/weather/weather/weather';
import { Support } from './features/support/support/support';
import { PredictionCharts } from './features/predictions/prediction-charts/prediction-charts';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { CompareCrops } from './features/predictions/compare-crops/compare-crops';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Only for visitors who are not logged in
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword, canActivate: [guestGuard] },
  { path: '', component: Signup, canActivate: [guestGuard] },

  // Logged-in users only

  { path: 'home', component: Homepage, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'reports', component: Reports, canActivate: [authGuard] },
  { path: 'weather', component: Weather, canActivate: [authGuard] },
  { path: 'support', component: Support, canActivate: [authGuard] },
  { path: 'prediction-charts', component: PredictionCharts, canActivate: [authGuard] },
  { path: 'compare-crops', component: CompareCrops, canActivate: [authGuard] },

  // Admins only
  { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];