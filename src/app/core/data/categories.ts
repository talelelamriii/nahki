import { CategorieId } from '../models/picto';

export interface Categorie {
  id: CategorieId;
  libelle: string;
  /** Variable CSS de la couleur (charte graphique). */
  couleur: string;
  /** Couleur du texte posé sur l'onglet : ink sauf sur Lieux et Personnes (contraste). */
  texte: 'ink' | 'on-ink';
}

/** Ordre fixe des onglets du tableau. */
export const CATEGORIES: readonly Categorie[] = [
  { id: 'manger', libelle: 'Manger', couleur: 'var(--cat-manger)', texte: 'ink' },
  { id: 'boire', libelle: 'Boire', couleur: 'var(--cat-boire)', texte: 'ink' },
  { id: 'besoins', libelle: 'Besoins', couleur: 'var(--cat-besoins)', texte: 'ink' },
  { id: 'emotions', libelle: 'Émotions', couleur: 'var(--cat-emotions)', texte: 'ink' },
  { id: 'actions', libelle: 'Actions', couleur: 'var(--cat-actions)', texte: 'ink' },
  { id: 'lieux', libelle: 'Lieux', couleur: 'var(--cat-lieux)', texte: 'on-ink' },
  { id: 'personnes', libelle: 'Personnes', couleur: 'var(--cat-personnes)', texte: 'on-ink' },
  { id: 'photos', libelle: 'Mes photos', couleur: 'var(--cat-photos)', texte: 'ink' },
];

export function categorie(id: CategorieId): Categorie {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
