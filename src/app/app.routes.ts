import { Routes } from '@angular/router';
import { authGuard, proGuard } from './core/guards/auth.guard';
import { parentGuard } from './core/guards/parent.guard';

/**
 * Routes calquées sur le sitemap de l'Objectif 2.
 * `ecran` = numéro du wireframe correspondant ; `vague` = moment prévu pour le développer.
 * Chaque page est chargée à la demande (loadComponent) pour un premier affichage rapide.
 */
const aVenir = () => import('./features/a-venir/a-venir').then((m) => m.AVenir);

export const routes: Routes = [
  // ----- Pages adultes : en-tête + pied de page -----
  {
    path: '',
    loadComponent: () => import('./layouts/adult-layout/adult-layout').then((m) => m.AdultLayout),
    children: [
      { path: '', title: 'Nahki', loadComponent: () => import('./features/accueil/accueil').then((m) => m.Accueil) },
      { path: 'bibliotheque', title: 'Bibliothèque – Nahki', loadComponent: () => import('./features/bibliotheque/bibliotheque/bibliotheque').then((m) => m.Bibliotheque) },
      { path: 'bibliotheque/:id', title: 'Fiche picto – Nahki', loadComponent: aVenir, data: { titre: 'Fiche picto', ecran: '07', vague: 2 } },
      { path: 'connexion', title: 'Connexion – Nahki', loadComponent: () => import('./features/compte/connexion/connexion').then((m) => m.Connexion) },
      { path: 'inscription', title: 'Inscription – Nahki', loadComponent: () => import('./features/compte/inscription/inscription').then((m) => m.Inscription) },
      { path: 'mes-propositions', title: 'Mes propositions – Nahki', canActivate: [authGuard], loadComponent: () => import('./features/bibliotheque/mes-propositions/mes-propositions').then((m) => m.MesPropositions) },
      { path: 'pro', title: 'Espace pro – Nahki', canActivate: [proGuard], loadComponent: () => import('./features/espace-pro/a-valider/a-valider').then((m) => m.AValider) },
      { path: 'aide', title: 'Aide – Nahki', loadComponent: () => import('./features/infos/aide/aide').then((m) => m.Aide) },
      { path: 'a-propos', title: 'À propos – Nahki', loadComponent: () => import('./features/infos/a-propos/a-propos').then((m) => m.APropos) },
      { path: 'confidentialite', title: 'Confidentialité – Nahki', loadComponent: () => import('./features/infos/confidentialite/confidentialite').then((m) => m.Confidentialite) },
      { path: 'contact', title: 'Contact – Nahki', loadComponent: () => import('./features/infos/contact/contact').then((m) => m.Contact) },
    ],
  },

  // ----- Tableau de l'enfant : plein écran, sans menu -----
  { path: 'tableau', title: 'Tableau – Nahki', loadComponent: () => import('./features/tableau/tableau').then((m) => m.Tableau) },

  // ----- Verrou parent -----
  { path: 'parent/verrou', title: 'Espace parent – Nahki', loadComponent: () => import('./features/espace-parent/verrou/verrou').then((m) => m.Verrou) },

  // ----- Espace parent : protégé par le verrou -----
  {
    path: 'parent',
    canActivate: [parentGuard],
    loadComponent: () => import('./layouts/parent-layout/parent-layout').then((m) => m.ParentLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'mes-pictos' },
      { path: 'mes-pictos', title: 'Mes pictos – Nahki', loadComponent: () => import('./features/espace-parent/mes-pictos/mes-pictos').then((m) => m.MesPictos) },
      { path: 'ajouter', title: 'Ajouter un picto – Nahki', loadComponent: () => import('./features/espace-parent/ajouter-picto/ajouter-picto').then((m) => m.AjouterPicto) },
      { path: 'reglages', title: 'Réglages – Nahki', loadComponent: aVenir, data: { titre: 'Réglages', ecran: '15', vague: 3 } },
      { path: 'sauvegarde', title: 'Sauvegarde – Nahki', loadComponent: aVenir, data: { titre: 'Sauvegarde', ecran: '16', vague: 3 } },
      { path: 'imprimer', title: 'Imprimer – Nahki', loadComponent: aVenir, data: { titre: 'Imprimer le tableau', ecran: '17', vague: 3 } },
    ],
  },

  { path: '**', redirectTo: '' },
];
