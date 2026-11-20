import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

/** Adresse qui reçoit les messages. À remplacer par l'adresse de l'équipe si besoin. */
export const EMAIL_CONTACT = 'talel.elamri@supcom.tn';

/**
 * Écran 23 : formulaire de contact.
 * Sans serveur d'envoi d'e-mails, le message validé est ouvert dans la messagerie de l'utilisateur (lien mailto).
 */
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrls: ['../infos.css', '../../compte/compte.css'],
})
export class Contact {
  private readonly toast = inject(ToastService);

  protected readonly email = EMAIL_CONTACT;
  protected readonly sujets = [
    'Une question sur Nahki',
    'Signaler un picto de la bibliothèque',
    'Devenir orthophoniste partenaire',
    'Supprimer mon compte ou mes données',
    'Autre',
  ];

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    sujet: [this.sujets[0], Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });
  protected readonly envoye = signal(false);

  /** Vrai si le champ a été touché et contient une erreur (pour afficher le message). */
  protected invalide(champ: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[champ];
    return c.touched && c.invalid;
  }

  protected envoyer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nom, email, sujet, message } = this.form.getRawValue();
    const corps = `${message.trim()}\n\n— ${nom.trim()} (${email.trim()})`;
    const lien = `mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent('[Nahki] ' + sujet)}&body=${encodeURIComponent(corps)}`;
    window.location.href = lien;
    this.envoye.set(true);
    this.toast.succes("Votre messagerie s'ouvre avec le message prêt à envoyer.");
  }

  protected recommencer(): void {
    this.form.reset();
    this.envoye.set(false);
  }
}
