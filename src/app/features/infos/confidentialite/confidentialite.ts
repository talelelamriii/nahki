import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Écran 22 : où sont gardées les données, en langage simple. */
@Component({
  selector: 'app-confidentialite',
  imports: [RouterLink],
  templateUrl: './confidentialite.html',
  styleUrl: '../infos.css',
})
export class Confidentialite {
  protected readonly donnees = [
    {
      quoi: 'Photos et voix ajoutées par la famille',
      ou: 'appareil',
      detail:
        'Gardées dans le navigateur de cet appareil. Elles ne sont envoyées nulle part, sauf si vous choisissez de partager un picto.',
    },
    {
      quoi: 'Pictos masqués, préférences',
      ou: 'appareil',
      detail: 'Gardés dans le navigateur de cet appareil.',
    },
    {
      quoi: "Ouverture de l'espace parent",
      ou: 'appareil',
      detail: "Oubliée à la fermeture de l'onglet.",
    },
    {
      quoi: 'Compte : adresse e-mail, prénom, mot de passe',
      ou: 'ligne',
      detail:
        "Seulement si vous créez un compte. Le mot de passe est chiffré : personne ne peut le lire, même l'équipe.",
    },
    {
      quoi: 'Pictos que vous partagez (image, mot, voix)',
      ou: 'ligne',
      detail:
        "Visibles par les orthophonistes, puis par tous une fois publiés. Aucun visage ni photo d'enfant n'est accepté.",
    },
  ];
}
