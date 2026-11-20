import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Profil } from '../models/picto-partage';
import { SupabaseService } from './supabase.service';

/**
 * Comptes : inscription des parents, connexion de tous, rôle (parent ou pro).
 * Le tableau et l'espace parent n'en ont pas besoin : seuls la bibliothèque et l'espace pro l'utilisent.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  readonly session = signal<Session | null>(null);
  readonly profil = signal<Profil | null>(null);
  readonly estConnecte = computed(() => this.session() !== null);
  readonly estPro = computed(() => this.profil()?.role === 'pro');

  private readonly pret: Promise<void>;

  constructor() {
    this.pret = this.demarrer();
  }

  /** Les guards attendent que la session éventuelle soit relue avant de décider. */
  attendre(): Promise<void> {
    return this.pret;
  }

  async connexion(email: string, motDePasse: string): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password: motDePasse });
    if (error) throw error;
    await this.mettreAJour(data.session);
  }

  /** Renvoie vrai si le compte est utilisable tout de suite (confirmation par e-mail désactivée). */
  async inscription(prenom: string, email: string, motDePasse: string): Promise<boolean> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password: motDePasse,
      options: { data: { prenom } },
    });
    if (error) throw error;
    await this.mettreAJour(data.session);
    return data.session !== null;
  }

  async deconnexion(): Promise<void> {
    await this.supabase.client.auth.signOut();
    await this.mettreAJour(null);
  }

  private async demarrer(): Promise<void> {
    if (!this.supabase.configure) return;
    const { data } = await this.supabase.client.auth.getSession();
    await this.mettreAJour(data.session);
    this.supabase.client.auth.onAuthStateChange((_evenement: AuthChangeEvent, session: Session | null) => {
      // Rafraîchissement du jeton, déconnexion dans un autre onglet…
      // setTimeout : Supabase recommande de ne pas appeler la base DANS ce rappel. Pendant une inscription,
      // la requête du profil attendrait la fin de l'inscription, qui attend elle-même ce rappel (blocage).
      setTimeout(() => {
        if (session?.user.id !== this.session()?.user.id) void this.mettreAJour(session);
        else this.session.set(session);
      });
    });
  }

  private async mettreAJour(session: Session | null): Promise<void> {
    this.session.set(session);
    if (!session) {
      this.profil.set(null);
      return;
    }
    const { data } = await this.supabase.client
      .from('profils')
      .select('id, prenom, role')
      .eq('id', session.user.id)
      .maybeSingle();
    this.profil.set((data as Profil | null) ?? { id: session.user.id, prenom: '', role: 'parent' });
  }
}
