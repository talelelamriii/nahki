import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Nahki s'exécute dans le navigateur : sons, micro, appareil photo et stockage local (IndexedDB)
 * n'existent pas côté serveur. Toutes les pages sont donc rendues côté client.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
