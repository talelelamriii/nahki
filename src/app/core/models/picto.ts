/** Identifiants des catégories du tableau (ordre et couleurs : core/data/categories.ts). */
export type CategorieId =
  | 'manger'
  | 'boire'
  | 'besoins'
  | 'emotions'
  | 'actions'
  | 'lieux'
  | 'personnes'
  | 'photos';

/** Un pictogramme tel qu'il est affiché dans le tableau. */
export interface Picto {
  id: string;
  /** Le mot en derja, écrit en lettres latines (« nekol »). */
  mot: string;
  /** Le même mot en arabe (facultatif). */
  motAr?: string;
  categorie: CategorieId;
  /** URL d'une image (photo de la famille). */
  image?: string;
  /** Mot-clé français pour chercher l'image dans ARASAAC. */
  arasaac?: string;
  /** Emoji affiché si aucune image n'est disponible. */
  emoji?: string;
  /** URL d'un son enregistré (voix humaine). */
  son?: string;
  /** « base » : livré avec Nahki ; « famille » : ajouté par le parent sur cet appareil. */
  origine: 'base' | 'famille';
}

/** Un picto ajouté par la famille, tel qu'il est enregistré dans IndexedDB. */
export interface PictoFamille {
  id: string;
  mot: string;
  motAr?: string;
  categorie: CategorieId;
  image: Blob;
  son?: Blob;
  creeLe: number;
}
