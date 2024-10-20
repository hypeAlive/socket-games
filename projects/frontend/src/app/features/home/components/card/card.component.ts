import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {CmsGame} from '../../models/games.interface';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'home-card',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './card.component.html',
  styles: []
})
export class CardComponent {

  @Input('game') game!: CmsGame;

  protected get title(): string {
    return this.game.translations[0].title;
  }

  protected get description(): string {
    return this.game.translations[0].description;
  }

  protected get icon(): string {
    return this.game.icon;
  }

}
