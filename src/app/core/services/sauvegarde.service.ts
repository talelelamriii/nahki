import { Injectable, inject } from '@angular/core';
import { CATEGORIES } from '../data/categories';
import { CategorieId, PictoFamille } from '../models/picto';
import { FamilleDbService } from './famille-db.service';
import { PictosService } from './pictos.service';
import { Reglages, ReglagesService, valider } from './reglages.service';

/** Format du fichier de sauvegarde (JSON). `version` permet de faire évoluer le format plus tard. */
interface FichierSauvegarde {
  application: 'nahki';
  version: 1;
  creeLe: string;
  reglages: Reglages;
  masques: string[];
  pictos: {
    id: string;
    mot: string;
    motAr?: string;
    categorie: CategorieId;
    creeLe: number;
    /** Photo encodée en texte (data URL), pour tenir dans un seul fichier. */
    image: string;
    son?: string;
  }[];
}

export interface ResultatImport {
  ajoutes: number;
  dejaPresents: number;
  ignores: number;
}

const TAILLE_MAX = 100 * 1024 * 1024; // 100 Mo
const CATEGORIES_VALIDES = new Set<string>(CATEGORIES.map((c) => c.id));

/**
 * Écran 16 : exporter le tableau de la famille dans un fichier, et le réimporter
 * (changement de tablette, navigateur réinitialisé…). Tout se passe dans le navigateur.
 */
@Injectable({ providedIn: 'root' })
export class SauvegardeService {
  private readonly db = inject(FamilleDbService);
  private readonly pictos = inject(PictosService);
  private readonly reglages = inject(ReglagesService);

  /** Nombre de pictos de la famille, pour l'afficher avant l'export. */
  async compter(): Promise<number> {
    return (await this.db.lister()).length;
  }

  /** Crée le fichier de sauvegarde et le fait télécharger. Renvoie le nombre de pictos exportés. */
  async exporter(): Promise<number> {
    const famille = await this.db.lister();
    const contenu: FichierSauvegarde = {
      application: 'nahki',
      version: 1,
      creeLe: new Date().toISOString(),
      reglages: this.reglages.valeurs(),
      masques: this.pictos.listeMasques(),
      pictos: await Promise.all(
        famille.map(async (p) => ({
          id: p.id,
          mot: p.mot,
          motAr: p.motAr,
          categorie: p.categorie,
          creeLe: p.creeLe,
          image: await versDataUrl(p.image),
          son: p.son ? await versDataUrl(p.son) : undefined,
        })),
      ),
    };
    const fichier = new Blob([JSON.stringify(contenu)], { type: 'application/json' });
    telecharger(fichier, `nahki-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`);
    return famille.length;
  }

  /**
   * Lit un fichier de sauvegarde et ajoute ses pictos à ceux de l'appareil (sans rien écraser).
   * Lève une erreur avec un message lisible si le fichier n'est pas une sauvegarde Nahki.
   */
  async importer(fichier: File): Promise<ResultatImport> {
    if (fichier.size > TAILLE_MAX)
      throw new Error('Ce fichier est trop volumineux (plus de 100 Mo).');
    let donnees: Partial<FichierSauvegarde>;
    try {
      donnees = JSON.parse(await fichier.text());
    } catch {
      throw new Error("Ce fichier n'est pas une sauvegarde Nahki.");
    }
    if (donnees?.application !== 'nahki' || !Array.isArray(donnees.pictos)) {
      throw new Error("Ce fichier n'est pas une sauvegarde Nahki.");
    }
    if (donnees.version !== 1)
      throw new Error("Cette sauvegarde vient d'une version de Nahki plus récente.");

    const resultat: ResultatImport = { ajoutes: 0, dejaPresents: 0, ignores: 0 };
    for (const p of donnees.pictos) {
      const picto = await versPictoFamille(p);
      if (!picto) {
        resultat.ignores++;
        continue;
      }
      if (await this.pictos.restaurer(picto)) resultat.ajoutes++;
      else resultat.dejaPresents++;
    }
    if (Array.isArray(donnees.masques))
      this.pictos.fusionnerMasques(donnees.masques.filter((m) => typeof m === 'string'));
    if (donnees.reglages) this.reglages.modifier(valider(donnees.reglages));
    return resultat;
  }
}

/** Vérifie un picto du fichier et le remet sous la forme enregistrée dans IndexedDB. */
async function versPictoFamille(
  p: FichierSauvegarde['pictos'][number],
): Promise<PictoFamille | null> {
  const valide =
    p &&
    typeof p.id === 'string' &&
    typeof p.mot === 'string' &&
    p.mot.trim().length > 0 &&
    p.mot.length <= 24 &&
    CATEGORIES_VALIDES.has(p.categorie) &&
    typeof p.image === 'string' &&
    p.image.startsWith('data:image/') &&
    (p.son === undefined || (typeof p.son === 'string' && p.son.startsWith('data:audio/')));
  if (!valide) return null;
  try {
    return {
      id: p.id,
      mot: p.mot,
      motAr: typeof p.motAr === 'string' ? p.motAr : undefined,
      categorie: p.categorie,
      creeLe: typeof p.creeLe === 'number' ? p.creeLe : Date.now(),
      image: await versBlob(p.image),
      son: p.son ? await versBlob(p.son) : undefined,
    };
  } catch {
    return null;
  }
}

function versDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(lecteur.result as string);
    lecteur.onerror = () => reject(lecteur.error);
    lecteur.readAsDataURL(blob);
  });
}

async function versBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

function telecharger(blob: Blob, nom: string): void {
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  lien.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
