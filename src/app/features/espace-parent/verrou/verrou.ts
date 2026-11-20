import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ParentLockService } from '../../../core/services/parent-lock.service';

type Forme = 'cercle' | 'triangle' | 'carre' | 'etoile';

const NOMS: Record<Forme, string> = { cercle: 'le rond', triangle: 'le triangle', carre: 'le carré', etoile: "l'étoile" };

/**
 * Écran 04 : le verrou parent. Une consigne écrite (« touchez le triangle ») :
 * un adulte réussit tout de suite, l'enfant qui ne lit pas encore ne peut pas entrer.
 */
@Component({
  selector: 'app-verrou',
  templateUrl: './verrou.html',
  styleUrl: './verrou.css',
})
export class Verrou {
  private readonly router = inject(Router);
  private readonly verrou = inject(ParentLockService);

  /** Page à ouvrir après le verrou (paramètre d'URL « suite »). */
  readonly suite = input<string>('/parent/mes-pictos');

  protected readonly formes = signal<Forme[]>(melanger(['cercle', 'triangle', 'carre', 'etoile']));
  protected readonly cible = signal<Forme>(this.formes()[Math.floor(Math.random() * 4)]);
  protected readonly erreur = signal(false);
  protected readonly noms = NOMS;

  protected choisir(forme: Forme): void {
    if (forme === this.cible()) {
      this.verrou.ouvrir();
      const suite = this.suite();
      this.router.navigateByUrl(suite.startsWith('/parent') ? suite : '/parent/mes-pictos');
      return;
    }
    this.erreur.set(true);
    this.formes.set(melanger(this.formes()));
  }

  protected annuler(): void {
    this.router.navigateByUrl('/tableau');
  }
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
