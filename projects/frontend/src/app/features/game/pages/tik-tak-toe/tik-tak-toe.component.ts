import { Component } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';
import {GameInputBase} from '../../directives/game-input-base.directive';
import {PlayerData, TikTakToeGameData} from 'socket-game-types';

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
export class TikTakToeComponent extends GameInputBase<TikTakToeGameData, PlayerData>{
  board: (string | null)[] = Array(9).fill(null);

  makeMove(index: number): void {

  }

}
