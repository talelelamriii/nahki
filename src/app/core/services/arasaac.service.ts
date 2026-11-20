import { Injectable } from '@angular/core';

const API = 'https://api.arasaac.org/v1/pictograms/fr/bestsearch/';
const IMAGE = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
const CLE_CACHE = 'nahki.arasaac';

/**
 * Consomme l'API REST publique d'ARASAAC pour trouver l'image d'un mot.
 * Pictogrammes : Sergio Palao, ARASAAC (arasaac.org), licence CC BY-NC-SA — à citer dans les crédits.
 * Les identifiants trouvés sont gardés en cache local pour ne pas rappeler l'API à chaque affichage.
 * Si l'API ne répond pas, la case affiche l'emoji de secours.
 */
@Injectable({ providedIn: 'root' })
export class ArasaacService {
  private readonly cache: Record<string, number | null> = lireCache();
  private readonly enCours = new Map<string, Promise<string | null>>();

  imagePour(motCle: string): Promise<string | null> {
    const cle = motCle.toLowerCase();
    if (cle in this.cache) {
      const id = this.cache[cle];
      return Promise.resolve(id === null ? null : IMAGE(id));
    }
    let requete = this.enCours.get(cle);
    if (!requete) {
      requete = this.chercher(cle);
      this.enCours.set(cle, requete);
    }
    return requete;
  }

  private async chercher(cle: string): Promise<string | null> {
    try {
      const reponse = await fetch(API + encodeURIComponent(cle));
      if (!reponse.ok) return this.memoriser(cle, null);
      const resultats = (await reponse.json()) as { _id: number }[];
      return this.memoriser(cle, resultats[0]?._id ?? null);
    } catch {
      return null; // hors ligne : on réessaiera à la prochaine visite
    }
  }

  private memoriser(cle: string, id: number | null): string | null {
    this.cache[cle] = id;
    try {
      localStorage.setItem(CLE_CACHE, JSON.stringify(this.cache));
    } catch {
      /* pas de stockage : tant pis pour le cache */
    }
    return id === null ? null : IMAGE(id);
  }
}

function lireCache(): Record<string, number | null> {
  try {
    return JSON.parse(localStorage.getItem(CLE_CACHE) ?? '{}') as Record<string, number | null>;
  } catch {
    return {};
  }
}
