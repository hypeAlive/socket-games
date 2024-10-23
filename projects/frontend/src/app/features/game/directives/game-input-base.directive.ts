import {Directive, inject, Input, OnInit} from '@angular/core';
import {GameData, PlayerData} from 'socket-game-types';
import {CmsGame} from '../../home/models/games.interface';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';

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

  protected copyLinkToClipboard() {
    navigator.clipboard.writeText(window.location.origin + this.router.createUrlTree(['join', this.hash]).toString()).then(() => {
      this.toastr.success('Join Link copied to clipboard');
    }).catch(err => {
      this.toastr.error('Failed to copy link to clipboard');
    });
  }

}
