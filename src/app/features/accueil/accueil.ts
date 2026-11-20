import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Écran 01 : présentation courte pour les adultes et accès direct au tableau. */
@Component({
  selector: 'app-accueil',
  imports: [RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil {
  protected readonly profils = [
    { titre: "Pour l'enfant", texte: 'Toucher une image, entendre le mot en derja, composer une phrase.', lien: '/tableau', action: 'Ouvrir le tableau', couleur: 'var(--cat-emotions)', emoji: '🧒' },
    { titre: 'Pour les parents', texte: 'Ajouter les photos et la voix de la maison, choisir les pictos utiles.', lien: '/parent', action: "Ouvrir l'espace parent", couleur: 'var(--cat-manger)', emoji: '👨‍👩‍👧' },
    { titre: 'Pour les orthophonistes', texte: 'Valider les pictos partagés par les familles et les utiliser en séance.', lien: '/pro', action: 'Espace pro', couleur: 'var(--cat-personnes)', emoji: '🩺' },
  ];
}
