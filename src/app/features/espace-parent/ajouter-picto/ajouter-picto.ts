import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CATEGORIES } from '../../../core/data/categories';
import { CategorieId, Picto } from '../../../core/models/picto';
import { PictosService } from '../../../core/services/pictos.service';
import { ToastService } from '../../../core/services/toast.service';
import { reduireImage } from '../../../core/utils/image';
import { PictoCard } from '../../../shared/components/picto-card/picto-card';
import { VoiceRecorder } from '../../../shared/components/voice-recorder/voice-recorder';

/** Écran 05 : ajouter un picto en 4 étapes (photo, mot, catégorie, voix) avec un aperçu de la case. */
@Component({
  selector: 'app-ajouter-picto',
  imports: [ReactiveFormsModule, PictoCard, VoiceRecorder],
  templateUrl: './ajouter-picto.html',
  styleUrl: './ajouter-picto.css',
})
export class AjouterPicto implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly pictos = inject(PictosService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;

  protected readonly form = this.fb.nonNullable.group({
    mot: ['', [Validators.required, Validators.maxLength(24)]],
    motAr: ['', [Validators.maxLength(24)]],
    categorie: ['photos' as CategorieId, Validators.required],
  });

  protected readonly photo = signal<Blob | null>(null);
  protected readonly photoUrl = signal<string | null>(null);
  protected readonly son = signal<Blob | undefined>(undefined);
  protected readonly envoye = signal(false);
  protected readonly enregistrement = signal(false);

  private readonly valeurs = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Aperçu en direct de la case telle qu'elle apparaîtra dans le tableau. */
  protected readonly apercu = computed<Picto>(() => ({
    id: 'apercu',
    mot: this.valeurs().mot?.trim() || 'mot',
    categorie: this.valeurs().categorie ?? 'photos',
    image: this.photoUrl() ?? undefined,
    emoji: '📷',
    origine: 'famille',
  }));

  async choisirPhoto(evenement: Event): Promise<void> {
    const fichier = (evenement.target as HTMLInputElement).files?.[0];
    if (!fichier) return;
    const reduite = await reduireImage(fichier);
    this.photo.set(reduite);
    const ancienne = this.photoUrl();
    if (ancienne) URL.revokeObjectURL(ancienne);
    this.photoUrl.set(URL.createObjectURL(reduite));
  }

  protected erreur(champ: 'mot' | 'motAr'): string | null {
    const c = this.form.controls[champ];
    if (!(c.touched || this.envoye()) || c.valid) return null;
    if (c.hasError('required')) return 'Écrivez le mot, comme on le dit à la maison.';
    if (c.hasError('maxlength')) return 'Le mot est trop long (24 caractères maximum).';
    return null;
  }

  async enregistrer(): Promise<void> {
    this.envoye.set(true);
    const photo = this.photo();
    if (this.form.invalid || !photo) {
      this.form.markAllAsTouched();
      return;
    }
    this.enregistrement.set(true);
    try {
      const { mot, motAr, categorie } = this.form.getRawValue();
      await this.pictos.charger();
      await this.pictos.ajouter({ mot: mot.trim(), motAr: motAr.trim() || undefined, categorie, image: photo, son: this.son() });
      this.toast.succes(`« ${mot.trim()} » a été ajouté au tableau.`);
      this.router.navigateByUrl('/parent/mes-pictos');
    } catch {
      this.toast.erreur("L'enregistrement a échoué. Réessayez.");
    } finally {
      this.enregistrement.set(false);
    }
  }

  annuler(): void {
    this.router.navigateByUrl('/parent/mes-pictos');
  }

  ngOnDestroy(): void {
    const url = this.photoUrl();
    if (url) URL.revokeObjectURL(url);
  }
}
