import { Component, OnInit, inject, signal } from '@angular/core';
import { ResultatImport, SauvegardeService } from '../../../core/services/sauvegarde.service';
import { ToastService } from '../../../core/services/toast.service';

/** Écran 16 : exporter et réimporter le tableau de la famille (photos, voix, réglages). */
@Component({
  selector: 'app-sauvegarde',
  templateUrl: './sauvegarde.html',
  styleUrls: ['../espace-parent.css', './sauvegarde.css'],
})
export class Sauvegarde implements OnInit {
  private readonly sauvegarde = inject(SauvegardeService);
  private readonly toast = inject(ToastService);

  protected readonly nombre = signal<number | null>(null);
  protected readonly enCours = signal<'export' | 'import' | null>(null);
  protected readonly resultat = signal<ResultatImport | null>(null);
  protected readonly erreur = signal<string | null>(null);
  protected readonly survol = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.nombre.set(await this.sauvegarde.compter());
    } catch {
      this.nombre.set(0);
    }
  }

  protected async exporter(): Promise<void> {
    if (this.enCours()) return;
    this.enCours.set('export');
    try {
      const n = await this.sauvegarde.exporter();
      this.toast.succes(`Sauvegarde téléchargée (${n} picto${n > 1 ? 's' : ''}).`);
    } catch (e) {
      console.error('Export :', e);
      this.toast.erreur("La sauvegarde n'a pas pu être créée.");
    } finally {
      this.enCours.set(null);
    }
  }

  protected choisir(evenement: Event): void {
    const champ = evenement.target as HTMLInputElement;
    const fichier = champ.files?.[0];
    champ.value = ''; // permet de rechoisir le même fichier
    if (fichier) void this.importer(fichier);
  }

  protected deposer(evenement: DragEvent): void {
    evenement.preventDefault();
    this.survol.set(false);
    const fichier = evenement.dataTransfer?.files[0];
    if (fichier) void this.importer(fichier);
  }

  protected survoler(evenement: DragEvent, actif: boolean): void {
    evenement.preventDefault();
    this.survol.set(actif);
  }

  private async importer(fichier: File): Promise<void> {
    if (this.enCours()) return;
    this.enCours.set('import');
    this.erreur.set(null);
    this.resultat.set(null);
    try {
      const r = await this.sauvegarde.importer(fichier);
      this.resultat.set(r);
      this.nombre.set(await this.sauvegarde.compter());
      this.toast.succes(
        r.ajoutes
          ? `${r.ajoutes} picto${r.ajoutes > 1 ? 's' : ''} restauré${r.ajoutes > 1 ? 's' : ''}.`
          : 'Aucun nouveau picto à restaurer.',
      );
    } catch (e) {
      console.error('Import :', e);
      this.erreur.set(
        e instanceof Error && e.message ? e.message : "Le fichier n'a pas pu être lu.",
      );
    } finally {
      this.enCours.set(null);
    }
  }
}
