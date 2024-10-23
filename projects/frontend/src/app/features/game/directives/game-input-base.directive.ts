import { Directive, Input } from '@angular/core';
import {GameData, PlayerData} from 'socket-game-types';

@Directive()
export class GameInputBase<GD extends GameData, PD extends PlayerData> {

  @Input('gameData') gameData!: GD;
  @Input('playerData') playerData!: PD;

}
