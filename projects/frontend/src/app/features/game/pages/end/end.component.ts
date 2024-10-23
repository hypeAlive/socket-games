import {Component} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {GameInputBase} from '../../directives/game-input-base.directive';
import {GameData, GameState, PlayerData} from 'socket-game-types';
import {GameService} from '../../../../shared/services/game.service';

@Component({
  selector: 'app-end',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './end.component.html',
  styleUrl: './end.component.scss'
})
export class EndComponent extends GameInputBase<GameData, PlayerData> {

  constructor(private game: GameService) {
    super();
  }

  protected get winner() {
    const winnerId = this.gameData.winnerId;
    if (!winnerId) return null;
    const player = this.gameData.players.find(player => player.playerId[1] === winnerId[1]);
    return player ? player.name : null;
  }

  protected get myWin() {
    return this.gameData.winnerId ? this.gameData.winnerId[1] === this.playerData.playerId[1] : false;
  }

  protected isOwner() {
    return this.game.isRoomOwner;
  }

  protected startNewGame() {
    if (!this.isOwner()) return;
    if (this.gameData.state !== GameState.ENDED) return;
    this.game.sendRecreateGame();
  }

}
