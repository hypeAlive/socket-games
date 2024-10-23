import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {GameInputBase} from '../../directives/game-input-base.directive';
import {PlayerData, TikTakToeAction, TikTakToeGameData} from 'socket-game-types';
import {GameInput} from '../../directives/game-input.directive';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {hugeCircle, hugeMultiplicationSign} from '@ng-icons/huge-icons';

@Component({
  selector: 'app-tik-tak-toe',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIcon,
    NgIf
  ],
  templateUrl: './tik-tak-toe.component.html',
  styleUrl: './tik-tak-toe.component.scss',
  viewProviders: [provideIcons({
    hugeCircle,
    hugeMultiplicationSign
  })]
})
export class TikTakToeComponent extends GameInput<TikTakToeGameData, PlayerData, TikTakToeAction>{

  protected get board() {
    return this.gameData.board;
  }

  protected canClickCell(x: number, y: number) {
    return this.isMyTurn() && this.board[x][y] === null;
  }

  protected handleClickCell(x: number, y: number) {
    if(!this.isMyTurn()) return;
    this.sendAction({
      x: x,
      y: y
    });
  }

  protected isPlayer1Cell(cell: boolean | null) {
    return cell === true;
  }

  protected isPlayer2Cell(cell: boolean | null) {
    return cell === false;
  }

}
