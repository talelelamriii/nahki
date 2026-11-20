import { Component, OnInit, computed, inject } from '@angular/core';
import { PictosService } from '../../../core/services/pictos.service';
import { ReglagesService, TailleCases } from '../../../core/services/reglages.service';
import { ToastService } from '../../../core/services/toast.service';
import { PictoCard } from '../../../shared/components/picto-card/picto-card';

/** Écran 15 : adapter le tableau à l'enfant (taille des cases, libellés, voix). Aperçu en direct. */
@Component({
  selector: 'app-reglages',
  imports: [PictoCard],
  templateUrl: './reglages.html',
  styleUrls: ['../espace-parent.css', './reglages.css'],
})
export class Reglages implements OnInit {
  protected readonly reglages = inject(ReglagesService);
  private readonly pictos = inject(PictosService);
  private readonly toast = inject(ToastService);

  protected readonly tailles: { id: TailleCases; libelle: string; aide: string }[] = [
    { id: 'petite', libelle: 'Petites', aide: 'Plus de pictos à l\'écran' },
    { id: 'normale', libelle: 'Normales', aide: 'Recommandé sur tablette' },
    { id: 'grande', libelle: 'Grandes', aide: 'Plus faciles à toucher' },
  ];
  protected readonly longueurs = [4, 6, 8, 10, 12];

  /** Trois pictos du tableau pour l'aperçu (de préférence avec un mot arabe). */
  protected readonly apercu = computed(() => {
    const tous = this.pictos.visibles();
    const avecArabe = tous.filter((p) => p.motAr);
    return (avecArabe.length >= 3 ? avecArabe : tous).slice(0, 3);
  });

  ngOnInit(): void {
    void this.pictos.charger();
  }

  protected reinitialiser(): void {
    this.reglages.reinitialiser();
    this.toast.succes('Réglages par défaut rétablis.');
  }
}
