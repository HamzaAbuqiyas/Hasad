import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { errorMessage } from '../../../core/utils/http-error';
import { PasswordResetService } from '../password-reset.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private readonly passwordReset = inject(PasswordResetService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  requestReset(): void {
    this.error.set('');
    this.success.set('');

    const email = this.email().trim().toLowerCase();
    if (!email) {
      this.error.set('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    this.loading.set(true);
    this.passwordReset.requestCode(email).subscribe({
      next: res => {
        this.loading.set(false);
        this.success.set(res.message);
        setTimeout(() => this.router.navigate(['/reset-password'], { queryParams: { email } }), 1000);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'Failed to send reset code.'));
      }
    });
  }
}
