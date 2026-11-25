import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { errorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);

  constructor() {
    if (this.route.snapshot.queryParamMap.has('expired')) {
      this.notify.info('Your session has ended. Please sign in again.');
    }
  }

  onSubmit(): void {
    if (!this.email().trim() || !this.password()) {
      this.notify.error('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.auth.login({ email: this.email().trim(), password: this.password() }).subscribe({
      next: res => {
        this.loading.set(false);
        this.notify.success(`Welcome to Hassad, ${res.user.firstName}!`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const home = res.user.role === 'Admin' ? '/admin' : '/home';
        this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : home);
      },
      error: err => {
        this.loading.set(false);
        this.notify.error(errorMessage(err, 'Invalid credentials. Please try again.'));
      }
    });
  }
}
