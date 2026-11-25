import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from '../services/session.service';

/** Lets the page open only for logged-in users whose token has not expired. */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);

  if (session.isLoggedIn()) {
    return true;
  }

  session.end();
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
