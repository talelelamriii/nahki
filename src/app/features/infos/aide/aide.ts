import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Écran 10 : aide, sous forme de questions repliables, regroupées par profil. */
@Component({
  selector: 'app-aide',
  imports: [RouterLink],
  templateUrl: './aide.html',
  styleUrl: '../infos.css',
})
export class Aide {}
