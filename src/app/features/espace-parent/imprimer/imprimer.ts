import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CATEGORIES } from '../../../core/data/categories';
import { CategorieId } from '../../../core/models/picto';
import { PictosService } from '../../../core/services/pictos.service';
import { ReglagesService } from '../../../core/services/reglages.service';
import { PictoCard } from '../../../shared/components/picto-card/picto-card';

/** Écran 17 : imprimer le tableau sur papier (classeur, frigo, sortie sans tablette). */
@Component({
  selector: 'app-imprimer',
  imports: [PictoCard],
  templateUrl: './imprimer.html',
  styleUrls: ['../espace-parent.css', './imprimer.css'],
})
export class Imprimer implements OnInit {
  protected readonly pictos = inject(PictosService);
  protected readonly reglages = inject(ReglagesService);

  protected readonly categories = CATEGORIES;
  protected readonly choisies = signal<ReadonlySet<CategorieId>>(
    new Set(CATEGORIES.map((c) => c.id)),
  );
  protected readonly colonnes = signal(4);
  protected readonly arabe = signal(this.reglages.valeurs().arabe);
  protected readonly erreur = signal(false);

  /** Les pictos visibles, regroupés par catégorie choisie (les catégories vides sont omises). */
  protected readonly groupes = computed(() =>
    CATEGORIES.filter((c) => this.choisies().has(c.id))
      .map((c) => ({
        categorie: c,
        pictos: this.pictos.visibles().filter((p) => p.categorie === c.id),
      }))
      .filter((g) => g.pictos.length > 0),
  );
  protected readonly total = computed(() =>
    this.groupes().reduce((n, g) => n + g.pictos.length, 0),
  );

  ngOnInit(): void {
    this.pictos.charger().catch(() => this.erreur.set(true));
  }

  protected basculer(id: CategorieId): void {
    const suivant = new Set(this.choisies());
    if (suivant.has(id)) suivant.delete(id);
    else suivant.add(id);
    this.choisies.set(suivant);
  }

  protected imprimer(): void {
    window.print();
  }
}
