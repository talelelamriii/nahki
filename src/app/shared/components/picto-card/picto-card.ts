import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Picto } from '../../../core/models/picto';
import { categorie } from '../../../core/data/categories';
import { ArasaacService } from '../../../core/services/arasaac.service';

/**
 * Case picto : une image + un mot, bordure de la couleur de la catégorie.
 * Image : photo de la famille, sinon pictogramme ARASAAC, sinon emoji de secours.
 */
@Component({
  selector: 'app-picto-card',
  templateUrl: './picto-card.html',
  styleUrl: './picto-card.css',
})
export class PictoCard {
  private readonly arasaac = inject(ArasaacService);

  readonly picto = input.required<Picto>();
  /** « normale » dans la grille, « mini » dans la barre de phrase et les listes. */
  readonly taille = input<'normale' | 'mini'>('normale');
  /** Surligne la case (mot en cours de lecture). */
  readonly active = input(false);
  /** Désactive le clic (affichage seul). */
  readonly decorative = input(false);
  /** Affiche aussi le mot en arabe (réglage « libellés en arabe »). */
  readonly arabe = input(false);
  /** Chargement différé de l'image ; désactivé pour l'impression (toutes les images doivent être prêtes). */
  readonly differe = input(true);
  readonly toucher = output<Picto>();

  protected readonly couleur = computed(() => categorie(this.picto().categorie).couleur);
  protected readonly src = signal<string | null>(null);
  protected readonly appuyee = signal(false);

  constructor() {
    effect(() => {
      const p = this.picto();
      this.src.set(p.image ?? null);
      if (!p.image && p.arasaac) {
        this.arasaac.imagePour(p.arasaac).then((url) => {
          if (this.picto() === p) this.src.set(url);
        });
      }
    });
  }

  protected clic(): void {
    if (this.decorative()) return;
    this.appuyee.set(true);
    setTimeout(() => this.appuyee.set(false), 180);
    this.toucher.emit(this.picto());
  }
}
