import { Injectable, computed, signal } from '@angular/core';

import { AuthUser, LoginResponse } from '../../shared/models/api.models';

interface Session {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

/**
 * Who is logged in. The ONLY place that knows how the session is stored
 * (before, every page read localStorage by itself).
 * The data is in a signal, so any page that shows it updates automatically.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  // Same keys as before, so people who are already logged in stay logged in.
  private static readonly Keys = {
    token: 'token',
    expiresAt: 'expiresAt',
    userId: 'userId',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    role: 'role',
    accountStatus: 'accountStatus',
    isProfileCompleted: 'isProfileCompleted'
  } as const;

  private readonly session = signal<Session | null>(this.read());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly userId = computed(() => this.session()?.user.id ?? null);
  readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : '';
  });

  get token(): string | null {
    return this.isLoggedIn() ? this.session()!.token : null;
  }

  /** Logged in = we have a token AND it has not expired. */
  isLoggedIn(): boolean {
    const s = this.session();
    if (!s?.token) return false;
    const expires = Date.parse(s.expiresAt);
    return Number.isNaN(expires) || expires > Date.now();
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.session()!.user.role === 'Admin';
  }

  start(res: LoginResponse): void {
    const k = SessionService.Keys;
    localStorage.setItem(k.token, res.token);
    localStorage.setItem(k.expiresAt, res.expiresAt);
    localStorage.setItem(k.userId, String(res.user.id));
    localStorage.setItem(k.email, res.user.email);
    localStorage.setItem(k.firstName, res.user.firstName);
    localStorage.setItem(k.lastName, res.user.lastName);
    localStorage.setItem(k.role, res.user.role);
    localStorage.setItem(k.accountStatus, res.user.accountStatus);
    localStorage.setItem(k.isProfileCompleted, String(res.user.isProfileCompleted));
    this.session.set({ token: res.token, expiresAt: res.expiresAt, user: res.user });
  }

  setProfileCompleted(completed: boolean): void {
    localStorage.setItem(SessionService.Keys.isProfileCompleted, String(completed));
    this.session.update(s => (s ? { ...s, user: { ...s.user, isProfileCompleted: completed } } : s));
  }

  end(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.session.set(null);
  }

  private read(): Session | null {
    const k = SessionService.Keys;
    const token = localStorage.getItem(k.token);
    const id = Number(localStorage.getItem(k.userId));
    if (!token || !Number.isInteger(id) || id <= 0) {
      return null;
    }

    return {
      token,
      expiresAt: localStorage.getItem(k.expiresAt) ?? '',
      user: {
        id,
        email: localStorage.getItem(k.email) ?? '',
        firstName: localStorage.getItem(k.firstName) ?? '',
        lastName: localStorage.getItem(k.lastName) ?? '',
        role: localStorage.getItem(k.role) === 'Admin' ? 'Admin' : 'User',
        accountStatus: localStorage.getItem(k.accountStatus) === 'Blocked' ? 'Blocked' : 'Active',
        isProfileCompleted: localStorage.getItem(k.isProfileCompleted) === 'true',
        totalPredictions: 0
      }
    };
  }
}
