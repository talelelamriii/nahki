import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

/** Affiche les notifications du ToastService en bas de l'écran. */
@Component({
  selector: 'app-toast',
  template: `
    <div class="zone" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast" [class.toast--erreur]="t.type === 'erreur'" role="status">
          <span>{{ t.message }}</span>
          <button type="button" (click)="toasts.fermer(t.id)" aria-label="Fermer">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .zone { position: fixed; left: 50%; bottom: var(--space-6); transform: translateX(-50%); z-index: 100;
      display: flex; flex-direction: column; gap: var(--space-2); width: min(92vw, 420px); }
    .toast { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
      padding: 12px var(--space-4); border-radius: var(--radius-md); background: var(--ink); color: var(--on-ink);
      font: 700 15px/20px var(--font-text); box-shadow: var(--shadow-card); }
    .toast--erreur { background: var(--danger); }
    button { border: 0; background: none; color: inherit; font-size: 22px; line-height: 1; cursor: pointer; }
  `,
})
export class ToastComponent {
  protected readonly toasts = inject(ToastService);
}
