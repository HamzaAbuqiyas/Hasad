import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from '../services/session.service';

/**
 * Admin pages only. This only hides the page in the browser;
 * the real protection is on the API ([Authorize(Policy = "AdminOnly")]).
 */
export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);

  if (session.isAdmin()) {
    return true;
  }

  return inject(Router).createUrlTree([session.isLoggedIn() ? '/home' : '/login']);
};
