import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { categorie } from '../../../core/data/categories';
import { PictoPartage } from '../../../core/models/picto-partage';
import { BibliothequeService } from '../../../core/services/bibliotheque.service';
import { ToastService } from '../../../core/services/toast.service';

type Etat = 'chargement' | 'pret' | 'introuvable' | 'erreur' | 'non-configure';

/** Écran 07 : fiche d'un picto de la bibliothèque, avec sa voix et l'ajout au tableau. */
@Component({
  selector: 'app-fiche-picto',
  imports: [RouterLink, DatePipe],
  templateUrl: './fiche-picto.html',
  styleUrl: './fiche-picto.css',
})
export class FichePicto {
  private readonly bibliotheque = inject(BibliothequeService);
  private readonly toast = inject(ToastService);

  /** Identifiant reçu depuis l'URL /bibliotheque/:id (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly picto = signal<PictoPartage | null>(null);
  protected readonly voisins = signal<PictoPartage[]>([]);
  protected readonly etat = signal<Etat>('chargement');
  protected readonly ajoutEnCours = signal(false);
  protected readonly enLecture = signal(false);

  protected readonly cat = computed(() => {
    const p = this.picto();
    return p ? categorie(p.categorie) : null;
  });

  constructor() {
    // Recharge la fiche quand l'identifiant change (clic sur un picto « de la même catégorie »)
    effect(() => {
      const id = this.id();
      void this.charger(id);
    });
  }

  private async charger(id: string): Promise<void> {
    if (!this.bibliotheque.configure) {
      this.etat.set('non-configure');
      return;
    }
    this.etat.set('chargement');
    this.voisins.set([]);
    try {
      const p = await this.bibliotheque.parId(id);
      this.picto.set(p);
      this.etat.set(p ? 'pret' : 'introuvable');
      if (p?.statut === 'publie') this.voisins.set(await this.bibliotheque.memeCategorie(p));
    } catch (e) {
      console.error('Fiche picto :', e);
      this.etat.set('erreur');
    }
  }

  protected ecouter(): void {
    const son = this.picto()?.sonUrl;
    if (!son || this.enLecture()) return;
    const audio = new Audio(son);
    this.enLecture.set(true);
    audio.onended = audio.onerror = () => this.enLecture.set(false);
    audio.play().catch(() => this.enLecture.set(false));
  }

  protected async ajouter(): Promise<void> {
    const p = this.picto();
    if (!p || this.ajoutEnCours()) return;
    this.ajoutEnCours.set(true);
    try {
      const resultat = await this.bibliotheque.ajouterAMonTableau(p);
      this.toast.succes(
        resultat === 'deja'
          ? `« ${p.mot} » est déjà dans votre tableau.`
          : `« ${p.mot} » a été ajouté à votre tableau.`,
      );
    } catch (e) {
      console.error('Ajout au tableau :', e);
      this.toast.erreur("L'ajout a échoué. Vérifiez la connexion internet.");
    } finally {
      this.ajoutEnCours.set(false);
    }
  }

  protected couleur(p: PictoPartage): string {
    return categorie(p.categorie).couleur;
  }
}
