import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'succes' | 'erreur';
}

/** Petites notifications en bas de l'écran (« Picto ajouté »…), qui disparaissent seules. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private suivant = 1;

  succes(message: string): void {
    this.afficher(message, 'succes');
  }

  erreur(message: string): void {
    this.afficher(message, 'erreur');
  }

  fermer(id: number): void {
    this.toasts.update((liste) => liste.filter((t) => t.id !== id));
  }

  private afficher(message: string, type: Toast['type']): void {
    const id = this.suivant++;
    this.toasts.update((liste) => [...liste, { id, message, type }]);
    setTimeout(() => this.fermer(id), 4000);
  }
}
