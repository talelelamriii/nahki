import { Injectable } from '@angular/core';
import { Picto } from '../models/picto';

/**
 * Fait parler le tableau.
 * 1. Si le picto a un son enregistré (voix humaine en derja), on le joue.
 * 2. Sinon, solution de secours : la synthèse vocale du navigateur lit le mot arabe
 *    (ou, à défaut, le mot latin). Elle ne parle pas derja : il faut enregistrer les vrais sons.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private lecture?: HTMLAudioElement;

  dire(picto: Picto): Promise<void> {
    this.arreter();
    return picto.son ? this.jouer(picto.son) : this.synthese(picto);
  }

  /** Lit les pictos les uns après les autres ; `surMot` signale le mot en cours (pour le surligner). */
  async direPhrase(pictos: readonly Picto[], surMot: (index: number) => void): Promise<void> {
    for (let i = 0; i < pictos.length; i++) {
      surMot(i);
      await this.dire(pictos[i]);
    }
    surMot(-1);
  }

  arreter(): void {
    this.lecture?.pause();
    this.lecture = undefined;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  private jouer(url: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.lecture = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }

  private synthese(picto: Picto): Promise<void> {
    if (!('speechSynthesis' in window)) return Promise.resolve();
    return new Promise((resolve) => {
      const voixArabe = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ar'));
      const enArabe = !!picto.motAr && !!voixArabe;
      const enonce = new SpeechSynthesisUtterance(enArabe ? picto.motAr : picto.mot);
      enonce.lang = enArabe ? voixArabe!.lang : 'fr-FR';
      if (enArabe) enonce.voice = voixArabe!;
      enonce.rate = 0.85;
      enonce.onend = () => resolve();
      enonce.onerror = () => resolve();
      // Sécurité : certains navigateurs ne déclenchent jamais « onend »
      setTimeout(resolve, 2500);
      speechSynthesis.speak(enonce);
    });
  }
}
