import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Écran 21 : présentation du projet et crédits (pictogrammes, polices, outils). */
@Component({
  selector: 'app-a-propos',
  imports: [RouterLink],
  templateUrl: './a-propos.html',
  styleUrl: '../infos.css',
})
export class APropos {
  protected readonly credits = [
    {
      nom: 'ARASAAC',
      role: 'Pictogrammes de base',
      detail:
        "Auteur : Sergio Palao. Licence CC BY-NC-SA. Propriété du Gouvernement d'Aragon (Espagne).",
      lien: 'https://arasaac.org',
    },
    {
      nom: 'Google Fonts',
      role: 'Polices',
      detail: 'Baloo Bhaijaan 2, Nunito et Noto Sans Arabic, sous licence SIL Open Font.',
      lien: 'https://fonts.google.com',
    },
    {
      nom: 'Angular',
      role: 'Framework du site',
      detail: 'Framework open source développé par Google, licence MIT.',
      lien: 'https://angular.dev',
    },
    {
      nom: 'Supabase',
      role: 'Comptes et bibliothèque partagée',
      detail: 'Base de données PostgreSQL, connexion et stockage des fichiers partagés.',
      lien: 'https://supabase.com',
    },
  ];
}
