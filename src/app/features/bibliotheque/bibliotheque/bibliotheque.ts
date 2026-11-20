import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, categorie } from '../../../core/data/categories';
import { CategorieId } from '../../../core/models/picto';
import { PictoPartage } from '../../../core/models/picto-partage';
import { AuthService } from '../../../core/services/auth.service';
import { BibliothequeService } from '../../../core/services/bibliotheque.service';
import { ToastService } from '../../../core/services/toast.service';

/** Écran 06 : les pictos tunisiens partagés par les familles et validés par un orthophoniste. */
@Component({
  selector: 'app-bibliotheque',
  imports: [RouterLink],
  templateUrl: './bibliotheque.html',
  styleUrl: './bibliotheque.css',
})
export class Bibliotheque implements OnInit {
  private readonly bibliotheque = inject(BibliothequeService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly categories = CATEGORIES;
  protected readonly pictos = signal<PictoPartage[]>([]);
  protected readonly etat = signal<'chargement' | 'pret' | 'erreur' | 'non-configure'>('chargement');
  protected readonly recherche = signal('');
  protected readonly filtre = signal<CategorieId | 'tous'>('tous');
  protected readonly ajoutEnCours = signal<string | null>(null);

  protected readonly affiches = computed(() => {
    const texte = normaliser(this.recherche());
    const f = this.filtre();
    return this.pictos().filter(
      (p) => (f === 'tous' || p.categorie === f) && (!texte || normaliser(p.mot).includes(texte) || (p.motAr ?? '').includes(texte)),
    );
  });

  async ngOnInit(): Promise<void> {
    if (!this.bibliotheque.configure) {
      this.etat.set('non-configure');
      return;
    }
    try {
      this.pictos.set(await this.bibliotheque.publies());
      this.etat.set('pret');
    } catch (e) {
      console.error('Bibliothèque :', e);
      this.etat.set('erreur');
    }
  }

  protected libelle(id: CategorieId): string {
    return categorie(id).libelle;
  }

  protected couleur(id: CategorieId): string {
    return categorie(id).couleur;
  }

  protected ecouter(p: PictoPartage): void {
    if (p.sonUrl) new Audio(p.sonUrl).play().catch(() => undefined);
  }

  protected async ajouter(p: PictoPartage): Promise<void> {
    if (this.ajoutEnCours()) return; // un ajout à la fois
    this.ajoutEnCours.set(p.id);
    try {
      const resultat = await this.bibliotheque.ajouterAMonTableau(p);
      if (resultat === 'deja') this.toast.succes(`« ${p.mot} » est déjà dans votre tableau.`);
      else this.toast.succes(`« ${p.mot} » a été ajouté à votre tableau.`);
    } catch (e) {
      console.error('Ajout au tableau :', e);
      this.toast.erreur("L'ajout a échoué. Vérifiez la connexion internet.");
    } finally {
      this.ajoutEnCours.set(null);
    }
  }
}

function normaliser(texte: string): string {
  return texte.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
