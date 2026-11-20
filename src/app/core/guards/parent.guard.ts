import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ParentLockService } from '../services/parent-lock.service';

/**
 * Protège l'espace parent : sans passer le verrou, on est renvoyé vers lui,
 * puis ramené à la page demandée (paramètre « suite »).
 */
export const parentGuard: CanActivateFn = (_route, state) => {
  if (inject(ParentLockService).ouvert()) return true;
  return inject(Router).createUrlTree(['/parent/verrou'], { queryParams: { suite: state.url } });
};
