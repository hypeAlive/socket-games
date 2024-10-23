import { Component } from '@angular/core';
import {GameInputBase} from '../../directives/game-input-base.directive';
import {GameData, PlayerData} from 'socket-game-types';
import {NgIf} from '@angular/common';

@Component({
  selector: 'game-current-turn',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './current-turn.component.html',
  styleUrl: './current-turn.component.scss'
})
export class CurrentTurnComponent extends GameInputBase<GameData, PlayerData>{

  constructor() {
    super();
  }

}
