import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CategorieId, Picto, PictoFamille } from '../models/picto';
import { FamilleDbService } from './famille-db.service';

const CLE_MASQUES = 'nahki.masques';

type PictoBaseJson = Omit<Picto, 'origine'>;

/**
 * Point d'accès unique aux pictos : ceux livrés avec Nahki (public/data/pictos.json)
 * et ceux ajoutés par la famille (IndexedDB). Les pages ne lisent jamais les données ailleurs.
 */
@Injectable({ providedIn: 'root' })
export class PictosService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(FamilleDbService);

  private readonly base = signal<Picto[]>([]);
  private readonly famille = signal<Picto[]>([]);
  private readonly masques = signal<ReadonlySet<string>>(lireMasques());
  private chargement?: Promise<void>;

  /** Tous les pictos, y compris les masqués (pour l'espace parent). */
  readonly tous = computed(() => [...this.base(), ...this.famille()]);
  /** Les pictos affichés dans le tableau de l'enfant. */
  readonly visibles = computed(() => this.tous().filter((p) => !this.masques().has(p.id)));
  readonly charge = signal(false);

  /** Charge les données une seule fois, quel que soit le nombre d'appels. */
  charger(): Promise<void> {
    this.chargement ??= (async () => {
      const [base, famille] = await Promise.all([
        firstValueFrom(this.http.get<PictoBaseJson[]>('data/pictos.json')),
        this.db.lister(),
      ]);
      this.base.set(base.map((p) => ({ ...p, origine: 'base' as const })));
      this.famille.set(famille.map(versPicto));
      this.charge.set(true);
    })();
    return this.chargement;
  }

  estMasque(id: string): boolean {
    return this.masques().has(id);
  }

  basculerMasque(id: string): void {
    const suivant = new Set(this.masques());
    if (suivant.has(id)) suivant.delete(id);
    else suivant.add(id);
    this.masques.set(suivant);
    ecrireMasques(suivant);
  }

  async ajouter(donnees: { mot: string; motAr?: string; categorie: CategorieId; image: Blob; son?: Blob }): Promise<Picto> {
    const enregistre: PictoFamille = { ...donnees, id: crypto.randomUUID(), creeLe: Date.now() };
    await this.db.enregistrer(enregistre);
    const picto = versPicto(enregistre);
    this.famille.update((liste) => [...liste, picto]);
    return picto;
  }

  async supprimer(id: string): Promise<void> {
    await this.db.supprimer(id);
    const picto = this.famille().find((p) => p.id === id);
    if (picto?.image) URL.revokeObjectURL(picto.image);
    if (picto?.son) URL.revokeObjectURL(picto.son);
    this.famille.update((liste) => liste.filter((p) => p.id !== id));
  }
}

function versPicto(p: PictoFamille): Picto {
  return {
    id: p.id,
    mot: p.mot,
    motAr: p.motAr,
    categorie: p.categorie,
    image: URL.createObjectURL(p.image),
    son: p.son ? URL.createObjectURL(p.son) : undefined,
    origine: 'famille',
  };
}

function lireMasques(): ReadonlySet<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLE_MASQUES) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function ecrireMasques(masques: ReadonlySet<string>): void {
  try {
    localStorage.setItem(CLE_MASQUES, JSON.stringify([...masques]));
  } catch {
    /* stockage indisponible (navigation privée) : le réglage dure le temps de la visite */
  }
}
