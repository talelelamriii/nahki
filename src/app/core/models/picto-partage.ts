import { CategorieId } from './picto';

export type StatutPartage = 'en_attente' | 'publie' | 'refuse';

/** Un picto de la bibliothèque partagée, tel que l'affichent les pages. */
export interface PictoPartage {
  id: string;
  auteur: string;
  mot: string;
  motAr?: string;
  categorie: CategorieId;
  imageUrl: string;
  sonUrl?: string;
  statut: StatutPartage;
  motif?: string;
  creeLe: string;
}

/** Une ligne de la table pictos_partages, telle que Supabase la renvoie. */
export interface LignePictoPartage {
  id: string;
  auteur: string;
  mot: string;
  mot_ar: string | null;
  categorie: CategorieId;
  image_path: string;
  son_path: string | null;
  statut: StatutPartage;
  motif: string | null;
  cree_le: string;
}

export interface Profil {
  id: string;
  prenom: string;
  role: 'parent' | 'pro';
}
