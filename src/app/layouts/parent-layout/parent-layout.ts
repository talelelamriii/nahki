import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ParentLockService } from '../../core/services/parent-lock.service';

/**
 * Mise en page de l'espace parent : menu latéral (en bas sur smartphone).
 * Le menu ramène aussi vers la bibliothèque et le site : plus de cul-de-sac.
 */
@Component({
  selector: 'app-parent-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './parent-layout.html',
  styleUrl: './parent-layout.css',
})
export class ParentLayout {
  private readonly verrou = inject(ParentLockService);
  private readonly router = inject(Router);

  protected readonly menu = [
    { url: 'mes-pictos', libelle: 'Mes pictos', icone: '▦' },
    { url: 'ajouter', libelle: 'Ajouter un picto', icone: '＋' },
    { url: 'reglages', libelle: 'Réglages', icone: '⚙' },
    { url: 'sauvegarde', libelle: 'Sauvegarde', icone: '⇅' },
    { url: 'imprimer', libelle: 'Imprimer', icone: '⎙' },
  ];

  /** Retour au tableau : le verrou se referme pour que l'enfant ne puisse pas revenir ici. */
  retourTableau(): void {
    this.verrou.fermer();
    this.router.navigateByUrl('/tableau');
  }
}
