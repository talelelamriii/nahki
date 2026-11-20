import { Injectable, signal } from '@angular/core';

const CLE = 'nahki.parent';

/**
 * État du verrou parent. Il reste ouvert pendant la visite (sessionStorage)
 * et se referme dès qu'on revient au tableau de l'enfant.
 */
@Injectable({ providedIn: 'root' })
export class ParentLockService {
  readonly ouvert = signal(lire());

  ouvrir(): void {
    this.ouvert.set(true);
    ecrire(true);
  }

  fermer(): void {
    this.ouvert.set(false);
    ecrire(false);
  }
}

function lire(): boolean {
  try {
    return sessionStorage.getItem(CLE) === '1';
  } catch {
    return false;
  }
}

function ecrire(ouvert: boolean): void {
  try {
    sessionStorage.setItem(CLE, ouvert ? '1' : '0');
  } catch {
    /* sans stockage, le verrou ne dure que tant que la page reste ouverte */
  }
}
