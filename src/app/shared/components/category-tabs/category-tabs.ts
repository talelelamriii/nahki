import { Component, input, output } from '@angular/core';
import { CATEGORIES } from '../../../core/data/categories';
import { CategorieId } from '../../../core/models/picto';

/** Onglets de catégorie du tableau : une couleur par famille de mots. */
@Component({
  selector: 'app-category-tabs',
  templateUrl: './category-tabs.html',
  styleUrl: './category-tabs.css',
})
export class CategoryTabs {
  readonly active = input.required<CategorieId>();
  readonly choisir = output<CategorieId>();
  protected readonly categories = CATEGORIES;
}
