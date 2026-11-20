import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';

/** Écran 11 : une seule page de connexion ; le rôle du compte décide de la suite. */
@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: '../compte.css',
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly configure = inject(SupabaseService).configure;

  /** Page où revenir après la connexion (paramètre d'URL « suite »). */
  readonly suite = input<string>('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });
  protected readonly erreur = signal<string | null>(null);
  protected readonly envoi = signal(false);

  async connecter(): Promise<void> {
    // Empêche un double envoi (double-clic) : les deux demandes partiraient en même temps
    if (this.envoi()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.envoi.set(true);
    this.erreur.set(null);
    try {
      const { email, motDePasse } = this.form.getRawValue();
      await this.auth.connexion(email.trim(), motDePasse);
      const prenom = this.auth.profil()?.prenom;
      this.toast.succes(prenom ? `Bonjour ${prenom} !` : 'Vous êtes connecté.');
      const suite = this.suite();
      const destination = suite.startsWith('/') ? suite : this.auth.estPro() ? '/pro' : '/bibliotheque';
      this.router.navigateByUrl(destination);
    } catch (e) {
      console.error('Connexion :', e);
      this.erreur.set(message(e));
    } finally {
      this.envoi.set(false);
    }
  }
}

function message(e: unknown): string {
  const texte = e instanceof Error ? e.message : '';
  if (/confirm/i.test(texte)) return 'Confirmez d\'abord votre adresse avec le lien reçu par e-mail.';
  if (/invalid login|credentials/i.test(texte)) return 'Adresse e-mail ou mot de passe incorrect.';
  return 'Connexion impossible pour le moment. Vérifiez votre connexion internet.';
}
