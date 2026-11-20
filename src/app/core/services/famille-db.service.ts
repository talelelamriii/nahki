import { Injectable } from '@angular/core';
import { PictoFamille } from '../models/picto';

const DB_NOM = 'nahki';
const DB_VERSION = 1;
const STORE = 'pictos';

/**
 * Stockage des pictos de la famille dans IndexedDB (dans le navigateur).
 * Les photos et les voix restent sur l'appareil : rien n'est envoyé en ligne.
 * IndexedDB est utilisé plutôt que localStorage, limité à ~5 Mo et incapable de stocker des images.
 */
@Injectable({ providedIn: 'root' })
export class FamilleDbService {
  private db?: Promise<IDBDatabase>;

  private ouvrir(): Promise<IDBDatabase> {
    this.db ??= new Promise((resolve, reject) => {
      const requete = indexedDB.open(DB_NOM, DB_VERSION);
      requete.onupgradeneeded = () => {
        if (!requete.result.objectStoreNames.contains(STORE)) {
          requete.result.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
    return this.db;
  }

  private async transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.ouvrir();
    return new Promise((resolve, reject) => {
      const requete = action(db.transaction(STORE, mode).objectStore(STORE));
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
  }

  async lister(): Promise<PictoFamille[]> {
    const tous = await this.transaction<PictoFamille[]>('readonly', (s) => s.getAll());
    return tous.sort((a, b) => a.creeLe - b.creeLe);
  }

  async obtenir(id: string): Promise<PictoFamille | undefined> {
    return this.transaction<PictoFamille | undefined>('readonly', (s) => s.get(id));
  }

  async enregistrer(picto: PictoFamille): Promise<void> {
    await this.transaction('readwrite', (s) => s.put(picto));
  }

  async supprimer(id: string): Promise<void> {
    await this.transaction('readwrite', (s) => s.delete(id));
  }
}
