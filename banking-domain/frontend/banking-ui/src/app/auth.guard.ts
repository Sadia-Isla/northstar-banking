import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isOAuthEnabled() || authService.isAuthenticated()) {
    return true;
  }

  authService.login();
  return router.createUrlTree(['/']);
};
