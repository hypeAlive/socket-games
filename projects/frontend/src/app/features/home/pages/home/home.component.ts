import { Component } from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {NgForOf} from '@angular/common';

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
export default class HomeComponent {

  protected games = [1,2,3,4];

}
