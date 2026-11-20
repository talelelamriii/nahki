import { Injectable, inject, signal } from '@angular/core';
import { LignePictoPartage, PictoPartage, StatutPartage } from '../models/picto-partage';
import { AuthService } from './auth.service';
import { FamilleDbService } from './famille-db.service';
import { PictosService } from './pictos.service';
import { SupabaseService } from './supabase.service';

const BUCKET = 'pictos';
const COLONNES = 'id, auteur, mot, mot_ar, categorie, image_path, son_path, statut, motif, cree_le';
const CLE_PARTAGES = 'nahki.partages';

/**
 * La bibliothèque partagée : tout ce qui passe par le backend Supabase.
 * Les pages n'appellent jamais Supabase directement, seulement ce service.
 */
@Injectable({ providedIn: 'root' })
export class BibliothequeService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);
  private readonly famille = inject(FamilleDbService);
  private readonly pictos = inject(PictosService);

  /** Pictos de la famille déjà envoyés depuis cet appareil (pour afficher « Envoyé »). */
  readonly envoyes = signal<ReadonlySet<string>>(lireEnvoyes());

  get configure(): boolean {
    return this.supabase.configure;
  }

  // ---------- Lecture ----------

  /** Écran 06 : les pictos validés, visibles par tous, même sans compte. */
  async publies(): Promise<PictoPartage[]> {
    return this.lister('statut', 'publie');
  }

  /** Écran 18 : les propositions du parent connecté, quel que soit leur statut. */
  async mesPropositions(): Promise<PictoPartage[]> {
    const id = this.auth.session()?.user.id;
    if (!id) return [];
    return this.lister('auteur', id);
  }

  /** Écran 09 : les propositions en attente (réservé aux orthophonistes par les règles d'accès). */
  async aValider(): Promise<PictoPartage[]> {
    return this.lister('statut', 'en_attente', true);
  }

  /**
   * Écran 07 : un seul picto, par son identifiant.
   * Les règles d'accès ne renvoient que les pictos publiés, ceux de l'auteur, ou tout pour un orthophoniste :
   * `null` veut dire « introuvable ou pas visible ».
   */
  async parId(id: string): Promise<PictoPartage | null> {
    const { data, error } = await this.supabase.client.from('pictos_partages').select(COLONNES).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.versPicto(data as LignePictoPartage) : null;
  }

  /** Écran 07 : quelques autres pictos publiés de la même catégorie. */
  async memeCategorie(p: PictoPartage, nombre = 4): Promise<PictoPartage[]> {
    const { data, error } = await this.supabase.client
      .from('pictos_partages')
      .select(COLONNES)
      .eq('statut', 'publie')
      .eq('categorie', p.categorie)
      .neq('id', p.id)
      .order('cree_le', { ascending: false })
      .limit(nombre);
    if (error) throw error;
    return (data as LignePictoPartage[]).map((l) => this.versPicto(l));
  }

  // ---------- Écriture ----------

  /** Bouton « Partager » de Mes pictos : envoie la photo, la voix et le mot, avec le statut « en attente ». */
  async proposer(pictoFamilleId: string): Promise<void> {
    const auteur = this.auth.session()?.user.id;
    if (!auteur) throw new Error('connexion requise');
    const picto = await this.famille.obtenir(pictoFamilleId);
    if (!picto) throw new Error('picto introuvable');

    const base = `${auteur}/${crypto.randomUUID()}`;
    const imagePath = await this.deposer(`${base}.${extension(picto.image.type, 'webp')}`, picto.image);
    const sonPath = picto.son ? await this.deposer(`${base}-voix.${extension(picto.son.type, 'webm')}`, picto.son) : null;

    const { error } = await this.supabase.client.from('pictos_partages').insert({
      mot: picto.mot,
      mot_ar: picto.motAr ?? null,
      categorie: picto.categorie,
      image_path: imagePath,
      son_path: sonPath,
    });
    if (error) throw error;
    this.marquerEnvoye(pictoFamilleId);
  }

  /** Écran 09 : l'orthophoniste publie ou refuse (avec un motif). */
  async decider(id: string, statut: Exclude<StatutPartage, 'en_attente'>, motif?: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('pictos_partages')
      .update({
        statut,
        motif: statut === 'refuse' ? motif ?? null : null,
        decide_par: this.auth.session()?.user.id,
        decide_le: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
  }

  /** « + À mon tableau » : copie le picto partagé (image et voix) dans le tableau de cet appareil. */
  async ajouterAMonTableau(p: PictoPartage): Promise<'ajoute' | 'deja'> {
    await this.pictos.charger();
    if (this.pictos.tous().some((x) => x.origine === 'famille' && x.mot === p.mot && x.categorie === p.categorie)) {
      return 'deja';
    }
    const image = await (await fetch(p.imageUrl)).blob();
    const son = p.sonUrl ? await (await fetch(p.sonUrl)).blob() : undefined;
    await this.pictos.ajouter({ mot: p.mot, motAr: p.motAr, categorie: p.categorie, image, son });
    return 'ajoute';
  }

  // ---------- Outils ----------

  private async lister(colonne: 'statut' | 'auteur', valeur: string, plusAnciensDabord = false): Promise<PictoPartage[]> {
    const { data, error } = await this.supabase.client
      .from('pictos_partages')
      .select(COLONNES)
      .eq(colonne, valeur)
      .order('cree_le', { ascending: plusAnciensDabord });
    if (error) throw error;
    return (data as LignePictoPartage[]).map((l) => this.versPicto(l));
  }

  private async deposer(chemin: string, fichier: Blob): Promise<string> {
    const { error } = await this.supabase.client.storage
      .from(BUCKET)
      .upload(chemin, fichier, { contentType: fichier.type || undefined, upsert: false });
    if (error) throw error;
    return chemin;
  }

  private url(chemin: string): string {
    return this.supabase.client.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl;
  }

  private versPicto(l: LignePictoPartage): PictoPartage {
    return {
      id: l.id,
      auteur: l.auteur,
      mot: l.mot,
      motAr: l.mot_ar ?? undefined,
      categorie: l.categorie,
      imageUrl: this.url(l.image_path),
      sonUrl: l.son_path ? this.url(l.son_path) : undefined,
      statut: l.statut,
      motif: l.motif ?? undefined,
      creeLe: l.cree_le,
    };
  }

  private marquerEnvoye(id: string): void {
    const suivant = new Set(this.envoyes());
    suivant.add(id);
    this.envoyes.set(suivant);
    try {
      localStorage.setItem(CLE_PARTAGES, JSON.stringify([...suivant]));
    } catch {
      /* sans stockage, l'étiquette « Envoyé » ne dure que la visite */
    }
  }
}

function extension(type: string, defaut: string): string {
  const sousType = type.split('/')[1]?.split(';')[0];
  return sousType && /^[a-z0-9]+$/.test(sousType) ? sousType : defaut;
}

function lireEnvoyes(): ReadonlySet<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLE_PARTAGES) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}
