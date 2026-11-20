import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategorieId, Picto } from '../../core/models/picto';
import { AudioService } from '../../core/services/audio.service';
import { PictosService } from '../../core/services/pictos.service';
import { ParentLockService } from '../../core/services/parent-lock.service';
import { CategoryTabs } from '../../shared/components/category-tabs/category-tabs';
import { PictoCard } from '../../shared/components/picto-card/picto-card';
import { SentenceBar } from '../../shared/components/sentence-bar/sentence-bar';

const LONGUEUR_MAX = 8;

/**
 * Écrans 02 et 03 : le tableau de l'enfant, en plein écran, sans menu.
 * Toucher une case dit le mot et l'ajoute à la phrase ; le bouton vert lit toute la phrase.
 */
@Component({
  selector: 'app-tableau',
  imports: [CategoryTabs, PictoCard, SentenceBar],
  templateUrl: './tableau.html',
  styleUrl: './tableau.css',
})
export class Tableau implements OnInit, OnDestroy {
  private readonly pictos = inject(PictosService);
  private readonly audio = inject(AudioService);
  private readonly router = inject(Router);
  private readonly verrou = inject(ParentLockService);

  protected readonly categorie = signal<CategorieId>('manger');
  protected readonly phrase = signal<Picto[]>([]);
  protected readonly lectureIndex = signal(-1);
  protected readonly erreur = signal(false);
  protected readonly charge = this.pictos.charge;

  protected readonly grille = computed(() =>
    this.pictos.visibles().filter((p) => p.categorie === this.categorie()),
  );

  ngOnInit(): void {
    // Arriver sur le tableau referme toujours l'espace parent
    this.verrou.fermer();
    this.pictos.charger().catch(() => this.erreur.set(true));
  }

  ngOnDestroy(): void {
    this.audio.arreter();
  }

  protected toucher(picto: Picto): void {
    this.phrase.update((p) => (p.length < LONGUEUR_MAX ? [...p, picto] : p));
    this.audio.dire(picto);
  }

  protected lire(): void {
    this.audio.direPhrase(this.phrase(), (i) => this.lectureIndex.set(i));
  }

  protected effacerDernier(): void {
    this.phrase.update((p) => p.slice(0, -1));
  }

  protected toutEffacer(): void {
    this.audio.arreter();
    this.lectureIndex.set(-1);
    this.phrase.set([]);
  }

  /** Case « ajouter » : verrou, puis directement le formulaire (3 clics au total). */
  protected ajouter(): void {
    this.router.navigate(['/parent/verrou'], { queryParams: { suite: '/parent/ajouter' } });
  }

  /** Cadenas : verrou, puis « Mes pictos ». */
  protected espaceParent(): void {
    this.router.navigate(['/parent/verrou'], { queryParams: { suite: '/parent/mes-pictos' } });
  }
}
