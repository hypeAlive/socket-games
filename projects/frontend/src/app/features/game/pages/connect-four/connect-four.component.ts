import { Component } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';
import {GameInput} from '../../directives/game-input.directive';
import {ConnectFourAction, ConnectFourGameData, PlayerData} from 'socket-game-types';

@Component({
  selector: 'app-connect-four',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './connect-four.component.html',
  styleUrl: './connect-four.component.scss'
})
export class ConnectFourComponent extends GameInput<ConnectFourGameData, PlayerData, ConnectFourAction>{

  protected get board() {
    return this.gameData.board;
  }

  protected canClickColumn(columnIndex: number): boolean {
    return this.isMyTurn() && this.board[columnIndex].some(row => row === null);
  }

  protected handleClickColumn(columnIndex: number) {
    if (!this.isMyTurn()) return;
    console.log(columnIndex)
    console.log(this.board)
    this.sendAction({ x: columnIndex });
  }

}
