import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PictoPartage } from '../../../core/models/picto-partage';
import { BibliothequeService } from '../../../core/services/bibliotheque.service';

/** Écran 18 : le parent suit le statut de ce qu'il a partagé (et le motif d'un refus). */
@Component({
  selector: 'app-mes-propositions',
  imports: [DatePipe, RouterLink],
  templateUrl: './mes-propositions.html',
  styleUrl: './mes-propositions.css',
})
export class MesPropositions implements OnInit {
  private readonly bibliotheque = inject(BibliothequeService);
  protected readonly propositions = signal<PictoPartage[]>([]);
  protected readonly etat = signal<'chargement' | 'pret' | 'erreur'>('chargement');
  protected readonly libelles = { en_attente: 'En attente', publie: 'Validé', refuse: 'Refusé' } as const;

  async ngOnInit(): Promise<void> {
    try {
      this.propositions.set(await this.bibliotheque.mesPropositions());
      this.etat.set('pret');
    } catch (e) {
      console.error('Mes propositions :', e);
      this.etat.set('erreur');
    }
  }
}
