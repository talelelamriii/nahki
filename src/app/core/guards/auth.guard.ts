import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Page réservée aux comptes connectés : sinon, connexion puis retour ici. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.attendre();
  return auth.estConnecte() ? true : router.createUrlTree(['/connexion'], { queryParams: { suite: state.url } });
};

/** Espace pro : réservé aux comptes orthophonistes (rôle « pro »). */
export const proGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.attendre();
  if (auth.estPro()) return true;
  if (auth.estConnecte()) return router.createUrlTree(['/'], { queryParams: { refus: 'pro' } });
  return router.createUrlTree(['/connexion'], { queryParams: { suite: state.url } });
};
