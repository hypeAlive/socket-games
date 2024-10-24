import {Directive, inject, Input, OnInit} from '@angular/core';
import {GameData, PlayerAction, PlayerData} from 'socket-game-types';
import {CmsGame} from '../../home/models/games.interface';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {GameService} from '../../../shared/services/game.service';
import {GameInputBase} from './game-input-base.directive';

@Directive()
export class GameInput<GD extends GameData, PD extends PlayerData, PA extends PlayerAction> extends GameInputBase<GD, PD>{

  protected gameService = inject(GameService);

  constructor() {
    super();
  }

  protected sendAction(action: Omit<PA, 'playerId'>) {
    if(!this.isMyTurn()) return;
    this.gameService.sendAction({
      ...action,
      playerId: this.playerData.playerId
    });
  }

}
