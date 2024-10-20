import { Component } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-tik-tak-toe',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './tik-tak-toe.component.html',
  styleUrl: './tik-tak-toe.component.scss'
})
export class TikTakToeComponent {
  board: (string | null)[] = Array(9).fill(null);

  makeMove(index: number): void {

  }

}
