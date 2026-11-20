import { Component, OnDestroy, output, signal } from '@angular/core';

type Etat = 'pret' | 'enregistrement' | 'enregistre' | 'impossible';

const DUREE_MAX_MS = 5000;

/** Enregistre la voix du parent qui dit le mot (API MediaRecorder du navigateur). */
@Component({
  selector: 'app-voice-recorder',
  templateUrl: './voice-recorder.html',
  styleUrl: './voice-recorder.css',
})
export class VoiceRecorder implements OnDestroy {
  readonly son = output<Blob | undefined>();

  protected readonly etat = signal<Etat>('pret');
  protected readonly url = signal<string | null>(null);

  private recorder?: MediaRecorder;
  private morceaux: Blob[] = [];
  private minuteur?: ReturnType<typeof setTimeout>;

  async demarrer(): Promise<void> {
    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.morceaux = [];
      this.recorder = new MediaRecorder(flux);
      this.recorder.ondataavailable = (e) => this.morceaux.push(e.data);
      this.recorder.onstop = () => {
        flux.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this.morceaux, { type: this.recorder?.mimeType || 'audio/webm' });
        this.remplacerUrl(URL.createObjectURL(blob));
        this.etat.set('enregistre');
        this.son.emit(blob);
      };
      this.recorder.start();
      this.etat.set('enregistrement');
      this.minuteur = setTimeout(() => this.arreter(), DUREE_MAX_MS);
    } catch {
      this.etat.set('impossible');
    }
  }

  arreter(): void {
    clearTimeout(this.minuteur);
    if (this.recorder?.state === 'recording') this.recorder.stop();
  }

  ecouter(): void {
    const url = this.url();
    if (url) new Audio(url).play().catch(() => undefined);
  }

  supprimer(): void {
    this.remplacerUrl(null);
    this.etat.set('pret');
    this.son.emit(undefined);
  }

  ngOnDestroy(): void {
    this.arreter();
    this.remplacerUrl(null);
  }

  private remplacerUrl(url: string | null): void {
    const ancienne = this.url();
    if (ancienne) URL.revokeObjectURL(ancienne);
    this.url.set(url);
  }
}
