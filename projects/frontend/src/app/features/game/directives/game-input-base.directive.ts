import {Directive, inject, Input, OnInit} from '@angular/core';
import {GameData, PlayerData} from 'socket-game-types';
import {CmsGame} from '../../home/models/games.interface';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {GameService} from '../../../shared/services/game.service';

@Directive()
export class GameInputBase<GD extends GameData, PD extends PlayerData> {

  protected toastr = inject(ToastrService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  constructor() {
  }

  @Input('gameData') gameData!: GD;
  @Input('playerData') playerData!: PD;
  @Input('cmsGame') cmsGame!: CmsGame;


  protected get hash() {
    return this.route.snapshot.paramMap.get('hash');
  }

  protected get gameTitle() {
    return this.cmsGame.translations[0].title;
  }

  protected isMyTurn() {
    if(this.gameData.currentPlayerIndex === -1) return false;
    return this.gameData.players[this.gameData.currentPlayerIndex].playerId[1] === this.playerData.playerId[1];
  }

  protected copyLinkToClipboard() {
    navigator.clipboard.writeText(window.location.origin + this.router.createUrlTree(['join', this.hash]).toString()).then(() => {
      this.toastr.success('Join Link copied to clipboard');
    }).catch(err => {
      this.toastr.error('Failed to copy link to clipboard');
    });
  }

}
