import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CATEGORIES, categorie } from '../../../core/data/categories';
import { CategorieId, Picto } from '../../../core/models/picto';
import { AuthService } from '../../../core/services/auth.service';
import { BibliothequeService } from '../../../core/services/bibliotheque.service';
import { PictosService } from '../../../core/services/pictos.service';
import { ToastService } from '../../../core/services/toast.service';
import { PictoCard } from '../../../shared/components/picto-card/picto-card';

/** Écran 14 : la liste des pictos, pour les masquer, les supprimer ou les partager à la bibliothèque. */
@Component({
  selector: 'app-mes-pictos',
  imports: [RouterLink, PictoCard],
  templateUrl: './mes-pictos.html',
  styleUrl: './mes-pictos.css',
})
export class MesPictos implements OnInit {
  protected readonly pictos = inject(PictosService);
  protected readonly bibliotheque = inject(BibliothequeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly categories = CATEGORIES;
  protected readonly filtre = signal<CategorieId | 'tous'>('tous');
  protected readonly aSupprimer = signal<string | null>(null);
  protected readonly envoiEnCours = signal<string | null>(null);

  protected readonly liste = computed(() => {
    const f = this.filtre();
    return this.pictos.tous().filter((p) => f === 'tous' || p.categorie === f);
  });

  ngOnInit(): void {
    this.pictos.charger();
  }

  protected libelle(p: Picto): string {
    return categorie(p.categorie).libelle;
  }

  /** Les photos de personnes restent privées : seuls les objets, plats et lieux de la famille se partagent. */
  protected partageable(p: Picto): boolean {
    return p.origine === 'famille' && p.categorie !== 'personnes';
  }

  /** Envoie le picto à la bibliothèque, avec le statut « en attente » de validation. */
  protected async partager(p: Picto): Promise<void> {
    if (this.envoiEnCours()) return; // un seul envoi à la fois
    if (!this.bibliotheque.configure) {
      this.toast.erreur("Le partage n'est pas encore configuré (voir le README).");
      return;
    }
    await this.auth.attendre();
    if (!this.auth.estConnecte()) {
      this.toast.succes('Connectez-vous pour partager vos pictos avec les autres familles.');
      this.router.navigate(['/connexion'], { queryParams: { suite: '/parent/mes-pictos' } });
      return;
    }
    this.envoiEnCours.set(p.id);
    try {
      await this.bibliotheque.proposer(p.id);
      this.toast.succes(`« ${p.mot} » est envoyé : un orthophoniste va le vérifier.`);
    } catch (e) {
      console.error('Partage :', e);
      this.toast.erreur("L'envoi a échoué. Vérifiez la connexion internet.");
    } finally {
      this.envoiEnCours.set(null);
    }
  }

  protected async confirmerSuppression(p: Picto): Promise<void> {
    await this.pictos.supprimer(p.id);
    this.aSupprimer.set(null);
    this.toast.succes(`« ${p.mot} » a été supprimé.`);
  }
}
