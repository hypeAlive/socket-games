import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'home-card',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

}
