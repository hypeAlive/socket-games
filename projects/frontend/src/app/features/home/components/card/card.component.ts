import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'home-card',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './card.component.html',
  styles: []
})
export class CardComponent {

}
