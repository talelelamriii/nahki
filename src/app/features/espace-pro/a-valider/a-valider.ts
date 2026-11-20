import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { categorie } from '../../../core/data/categories';
import { CategorieId } from '../../../core/models/picto';
import { PictoPartage } from '../../../core/models/picto-partage';
import { BibliothequeService } from '../../../core/services/bibliotheque.service';
import { ToastService } from '../../../core/services/toast.service';

/** Écran 09 : l'orthophoniste vérifie chaque proposition, puis la publie ou la refuse avec un motif. */
@Component({
  selector: 'app-a-valider',
  imports: [DatePipe],
  templateUrl: './a-valider.html',
  styleUrl: './a-valider.css',
})
export class AValider implements OnInit {
  private readonly bibliotheque = inject(BibliothequeService);
  private readonly toast = inject(ToastService);

  protected readonly propositions = signal<PictoPartage[]>([]);
  protected readonly etat = signal<'chargement' | 'pret' | 'erreur'>('chargement');
  protected readonly motifs = signal<Record<string, string>>({});
  protected readonly enCours = signal<string | null>(null);

  protected readonly listeMotifs = [
    'Un visage ou un enfant est visible',
    "L'image est floue ou contient plusieurs objets",
    'Le mot ou la catégorie ne correspond pas',
    'La voix est inaudible',
    'Ce picto existe déjà',
  ];

  async ngOnInit(): Promise<void> {
    try {
      this.propositions.set(await this.bibliotheque.aValider());
      this.etat.set('pret');
    } catch (e) {
      console.error('Espace pro :', e);
      this.etat.set('erreur');
    }
  }

  protected libelle(id: CategorieId): string {
    return categorie(id).libelle;
  }

  protected choisirMotif(id: string, motif: string): void {
    this.motifs.update((m) => ({ ...m, [id]: motif }));
  }

  protected ecouter(p: PictoPartage): void {
    if (p.sonUrl) new Audio(p.sonUrl).play().catch(() => undefined);
  }

  protected async decider(p: PictoPartage, statut: 'publie' | 'refuse'): Promise<void> {
    if (this.enCours()) return; // une décision à la fois
    const motif = this.motifs()[p.id];
    if (statut === 'refuse' && !motif) {
      this.toast.erreur('Choisissez un motif avant de refuser.');
      return;
    }
    this.enCours.set(p.id);
    try {
      await this.bibliotheque.decider(p.id, statut, motif);
      this.propositions.update((liste) => liste.filter((x) => x.id !== p.id));
      this.toast.succes(statut === 'publie' ? `« ${p.mot} » est publié dans la bibliothèque.` : `« ${p.mot} » a été refusé.`);
    } catch (e) {
      console.error('Décision :', e);
      this.toast.erreur("La décision n'a pas pu être enregistrée.");
    } finally {
      this.enCours.set(null);
    }
  }
}
