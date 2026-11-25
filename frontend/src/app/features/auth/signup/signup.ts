import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { errorMessage } from '../../../core/utils/http-error';

const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);

  onSubmit(): void {
    const problem = this.validate();
    if (problem) {
      this.notify.error(problem);
      return;
    }

    this.loading.set(true);
    this.auth.register({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notify.success('Account created successfully! Please sign in.');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading.set(false);
        this.notify.error(errorMessage(err, 'Signup failed'));
      }
    });
  }

  private validate(): string | null {
    if (!this.firstName().trim() || !this.lastName().trim() || !this.email().trim() || !this.password() || !this.confirmPassword()) {
      return 'Please fill in all fields';
    }
    if (this.password() !== this.confirmPassword()) {
      return 'Passwords do not match';
    }
    if (this.password().length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
    }
    return null;
  }
}
