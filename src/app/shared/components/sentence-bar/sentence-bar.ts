import { Component, input, output } from '@angular/core';
import { Picto } from '../../../core/models/picto';
import { PictoCard } from '../picto-card/picto-card';

/** Barre de phrase : les pictos touchés s'alignent, le bouton vert lit la phrase. */
@Component({
  selector: 'app-sentence-bar',
  imports: [PictoCard],
  templateUrl: './sentence-bar.html',
  styleUrl: './sentence-bar.css',
})
export class SentenceBar {
  readonly phrase = input.required<readonly Picto[]>();
  /** Index du mot en cours de lecture (-1 : aucun). */
  readonly lectureIndex = input(-1);
  readonly lire = output<void>();
  readonly effacer = output<void>();
  readonly toutEffacer = output<void>();
}
