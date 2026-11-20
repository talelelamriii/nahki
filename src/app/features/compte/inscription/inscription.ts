import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';

/** Écran 12 : inscription ouverte aux parents seulement (les comptes pros sont créés par l'équipe). */
@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: '../compte.css',
})
export class Inscription {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly configure = inject(SupabaseService).configure;

  readonly suite = input<string>('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    prenom: ['', [Validators.required, Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    regles: [false, Validators.requiredTrue],
  });
  protected readonly erreur = signal<string | null>(null);
  protected readonly attenteEmail = signal(false);
  protected readonly envoi = signal(false);

  protected invalide(champ: 'prenom' | 'email' | 'motDePasse' | 'regles'): boolean {
    const c = this.form.controls[champ];
    return c.touched && c.invalid;
  }

  async inscrire(): Promise<void> {
    // Empêche un double envoi (double-clic) : les deux demandes partiraient en même temps
    if (this.envoi()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.envoi.set(true);
    this.erreur.set(null);
    try {
      const { prenom, email, motDePasse } = this.form.getRawValue();
      const pret = await this.auth.inscription(prenom.trim(), email.trim(), motDePasse);
      if (pret) {
        this.toast.succes(`Bienvenue ${prenom.trim()} ! Votre compte est créé.`);
        const suite = this.suite();
        this.router.navigateByUrl(suite.startsWith('/') ? suite : '/bibliotheque');
      } else {
        this.attenteEmail.set(true);
      }
    } catch (e) {
      console.error('Inscription :', e);
      const texte = e instanceof Error ? e.message : '';
      this.erreur.set(
        /already|registered/i.test(texte)
          ? 'Un compte existe déjà avec cette adresse. Connectez-vous.'
          : /rate limit|too many/i.test(texte)
            ? 'Trop de tentatives : patientez une minute puis réessayez.'
            : /password/i.test(texte)
            ? 'Mot de passe refusé : choisissez-en un plus long ou plus varié.'
            : 'Inscription impossible pour le moment. Réessayez.',
      );
    } finally {
      this.envoi.set(false);
    }
  }
}
