import { Injectable, computed, signal } from '@angular/core';

export type TailleCases = 'petite' | 'normale' | 'grande';

export interface Reglages {
  /** Taille des cases du tableau. */
  taille: TailleCases;
  /** Affiche le mot en arabe sous le mot latin, sur chaque case. */
  arabe: boolean;
  /** Dit le mot dès que l'enfant touche une case (sinon, seulement à la lecture de la phrase). */
  direAuToucher: boolean;
  /** Nombre maximum de pictos dans la barre de phrase. */
  longueurPhrase: number;
}

export const REGLAGES_DEFAUT: Reglages = {
  taille: 'normale',
  arabe: false,
  direAuToucher: true,
  longueurPhrase: 8,
};

/** Dimensions en pixels de chaque taille : case et image. */
const DIMENSIONS: Record<TailleCases, { case: number; image: number; mot: number }> = {
  petite: { case: 120, image: 72, mot: 18 },
  normale: { case: 150, image: 96, mot: 22 },
  grande: { case: 200, image: 136, mot: 28 },
};

const CLE = 'nahki.reglages';

/** Écran 15 : réglages du tableau, gardés sur l'appareil (localStorage). */
@Injectable({ providedIn: 'root' })
export class ReglagesService {
  private readonly etat = signal<Reglages>(lire());

  readonly valeurs = this.etat.asReadonly();

  /** Variables CSS à poser sur le tableau pour appliquer la taille choisie. */
  readonly stylesTableau = computed(() => {
    const d = DIMENSIONS[this.etat().taille];
    return {
      '--picto-card': `${d.case}px`,
      '--picto-image': `${d.image}px`,
      '--picto-mot': `${d.mot}px`,
    };
  });

  modifier(changement: Partial<Reglages>): void {
    this.etat.update((r) => ({ ...r, ...changement }));
    ecrire(this.etat());
  }

  reinitialiser(): void {
    this.etat.set({ ...REGLAGES_DEFAUT });
    ecrire(this.etat());
  }
}

function lire(): Reglages {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? '{}') as Partial<Reglages>;
    return valider(brut);
  } catch {
    return { ...REGLAGES_DEFAUT };
  }
}

/** Garde uniquement les valeurs connues : un fichier de sauvegarde ancien ou abîmé ne casse rien. */
export function valider(brut: Partial<Reglages> | null | undefined): Reglages {
  const r = { ...REGLAGES_DEFAUT };
  if (!brut || typeof brut !== 'object') return r;
  if (brut.taille === 'petite' || brut.taille === 'normale' || brut.taille === 'grande')
    r.taille = brut.taille;
  if (typeof brut.arabe === 'boolean') r.arabe = brut.arabe;
  if (typeof brut.direAuToucher === 'boolean') r.direAuToucher = brut.direAuToucher;
  if (
    Number.isInteger(brut.longueurPhrase) &&
    brut.longueurPhrase! >= 3 &&
    brut.longueurPhrase! <= 12
  )
    r.longueurPhrase = brut.longueurPhrase!;
  return r;
}

function ecrire(r: Reglages): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(r));
  } catch {
    /* navigation privée : les réglages durent le temps de la visite */
  }
}
