import { AdminPrediction, AdminSummary, AdminUser } from '../../../shared/models/api.models';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  summary: AdminSummary | null = null;
  users: AdminUser[] = [];
  predictions: AdminPrediction[] = [];

  loading = false;
  activeTab: 'users' | 'predictions' = 'users';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;

    this.adminService.getSummary().subscribe({
      next: (res) => {
        this.summary = res;
      },
      error: (err) => {
        console.error('SUMMARY ERROR:', err);
      }
    });

    this.loadUsers();
    this.loadPredictions();

    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        console.error('USERS ERROR:', err);
        alert('Failed to load users.');
      }
    });
  }

  loadPredictions() {
    this.adminService.getPredictions().subscribe({
      next: (res) => {
        this.predictions = res;
      },
      error: (err) => {
        console.error('PREDICTIONS ERROR:', err);
      }
    });
  }

  blockUser(user: AdminUser) {
    if (!confirm(`Block ${user.email}?`)) return;

    this.adminService.updateUserStatus(user.id, 'Blocked').subscribe({
      next: () => {
        alert('User blocked successfully.');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to block user.');
      }
    });
  }

  activateUser(user: AdminUser) {
    this.adminService.updateUserStatus(user.id, 'Active').subscribe({
      next: () => {
        alert('User activated successfully.');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to activate user.');
      }
    });
  }

  makeAdmin(user: AdminUser) {
    if (!confirm(`Make ${user.email} an Admin?`)) return;

    this.adminService.updateUserRole(user.id, 'Admin').subscribe({
      next: () => {
        alert('User is now Admin.');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to update role.');
      }
    });
  }

  makeUser(user: AdminUser) {
    if (!confirm(`Change ${user.email} to normal User?`)) return;

    this.adminService.updateUserRole(user.id, 'User').subscribe({
      next: () => {
        alert('User is now normal User.');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to update role.');
      }
    });
  }

  deleteUser(user: AdminUser) {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        alert('User deleted successfully.');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to delete user.');
      }
    });
  }

  deletePrediction(prediction: AdminPrediction) {
    if (!confirm(`Delete prediction for ${prediction.crop}?`)) return;

    this.adminService.deletePrediction(prediction.id).subscribe({
      next: () => {
        alert('Prediction deleted successfully.');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to delete prediction.');
      }
    });
  }

  logout() {
    // AuthService.logout() clears the session (signal + storage) and goes to /login.
    this.authService.logout();
  }
}