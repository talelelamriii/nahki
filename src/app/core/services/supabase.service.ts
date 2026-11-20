import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';

/** Crée une seule fois le client Supabase, partagé par tous les services. */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  /** Faux tant que l'URL et la clé n'ont pas été collées dans supabase.config.ts. */
  readonly configure =
    SUPABASE_CONFIG.url.startsWith('https://') &&
    !SUPABASE_CONFIG.url.includes('xxxx') &&
    !SUPABASE_CONFIG.cle.startsWith('COLLER') &&
    !SUPABASE_CONFIG.cle.includes('xxxx');

  private instance?: SupabaseClient;

  get client(): SupabaseClient {
    if (!this.configure) {
      throw new Error('Supabase non configuré : remplissez src/app/core/config/supabase.config.ts');
    }
    this.instance ??= createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.cle);
    return this.instance;
  }
}
