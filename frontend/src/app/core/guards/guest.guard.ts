import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from '../services/session.service';

/**
 * Pages for people who are NOT logged in (login, sign up, forgot / reset password).
 * A logged-in user who opens them is sent to their start page instead.
 */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);

  if (!session.isLoggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree([session.isAdmin() ? '/admin' : '/home']);
};
