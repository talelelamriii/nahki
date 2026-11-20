import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

/** Mise en page des pages adultes : en-tête (avec le compte), contenu, pied de page. */
@Component({
  selector: 'app-adult-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './adult-layout.html',
  styleUrl: './adult-layout.css',
})
export class AdultLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly annee = new Date().getFullYear();
  protected readonly liens = [
    { url: '/', libelle: 'Accueil', exact: true },
    { url: '/tableau', libelle: 'Tableau', exact: false },
    { url: '/bibliotheque', libelle: 'Bibliothèque', exact: false },
    { url: '/aide', libelle: 'Aide', exact: false },
  ];

  async deconnecter(): Promise<void> {
    await this.auth.deconnexion();
    this.toast.succes('Vous êtes déconnecté.');
    this.router.navigateByUrl('/');
  }
}
