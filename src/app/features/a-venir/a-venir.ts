import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Page provisoire pour les écrans du sitemap pas encore développés.
 * Le titre et le numéro de wireframe viennent des `data` de la route (app.routes.ts).
 */
@Component({
  selector: 'app-a-venir',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="card bloc">
        <p class="muted">Écran {{ ecran() }} du sitemap · vague {{ vague() }}</p>
        <h1>{{ titre() }}</h1>
        <p>Cette page fait partie du sitemap de Nahki et sera développée lors de la vague {{ vague() }}.</p>
        <a routerLink="/" class="btn btn--primary">Retour à l'accueil</a>
      </div>
    </section>
  `,
  styles: `.bloc { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-4); max-width: 640px; }`,
})
export class AVenir {
  // Reçus depuis `data` de la route grâce à withComponentInputBinding()
  readonly titre = input('Page à venir');
  readonly ecran = input('');
  readonly vague = input(2);
}
