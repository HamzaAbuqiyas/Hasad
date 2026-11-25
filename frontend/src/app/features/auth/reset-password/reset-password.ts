import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { errorMessage } from '../../../core/utils/http-error';
import { PasswordResetService } from '../password-reset.service';

const CODE_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  private readonly passwordReset = inject(PasswordResetService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal(this.route.snapshot.queryParamMap.get('email') ?? '');
  readonly code = signal(this.route.snapshot.queryParamMap.get('code') ?? '');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  /** 1) enter the code  2) choose a new password  3) done */
  readonly step = signal<'code' | 'password' | 'done'>(this.email() && this.code() ? 'password' : 'code');

  private readonly newPasswordInput = viewChild<ElementRef<HTMLInputElement>>('newPasswordInput');

  submitCode(): void {
    this.clearMessages();
    const email = this.email().trim().toLowerCase();
    const code = this.code().trim();

    if (!email) return this.error.set('Email is missing. Please go back and enter your email.');
    if (!code) return this.error.set('Please enter the verification code.');
    if (code.length !== CODE_LENGTH) return this.error.set(`Verification code must be ${CODE_LENGTH} digits.`);

    this.loading.set(true);
    this.passwordReset.verifyCode(email, code).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Code verified successfully. Please enter your new password.');
        this.step.set('password');
        setTimeout(() => this.newPasswordInput()?.nativeElement.focus());
      },
      error: err => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'Invalid or expired verification code.'));
        this.step.set('code');
      }
    });
  }

  resetPassword(): void {
    this.clearMessages();
    const email = this.email().trim().toLowerCase();
    const code = this.code().trim();

    if (!email || !code) {
      this.error.set('Email or verification code is missing.');
      this.step.set('code');
      return;
    }
    if (!this.newPassword() || !this.confirmPassword()) return this.error.set('Please fill in all password fields.');
    if (this.newPassword().length < MIN_PASSWORD_LENGTH) return this.error.set(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (this.newPassword() !== this.confirmPassword()) return this.error.set('Passwords do not match.');

    this.loading.set(true);
    this.passwordReset.resetPassword(email, code, this.newPassword()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Password reset successfully!');
        this.step.set('done');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'Failed to reset password.'));
      }
    });
  }

  togglePasswordVisibility(type: 'password' | 'confirm'): void {
    const target = type === 'password' ? this.showPassword : this.showConfirmPassword;
    target.update(v => !v);
  }

  goBackToCode(): void {
    this.step.set('code');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.clearMessages();
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private clearMessages(): void {
    this.error.set('');
    this.success.set('');
  }
}
