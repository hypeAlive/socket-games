import {Component, OnInit} from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {NgForOf} from '@angular/common';
import {DirectusService} from '../../../../core/services/directus.service';
import {CmsGame} from '../../models/games.interface';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CardComponent,
    NgForOf
  ],
  templateUrl: './home.component.html',
  styles: []
})
export default class HomeComponent implements OnInit {

  private availableGames: CmsGame[] = [];

  constructor(private directus: DirectusService) {
  }

  ngOnInit(): void {
    this.directus.readItemsWithTranslation<CmsGame>('games')
      .then((games) => {
        this.availableGames = games;
      });
  }

  protected get games(): CmsGame[] {
    return this.availableGames;
  }

}
