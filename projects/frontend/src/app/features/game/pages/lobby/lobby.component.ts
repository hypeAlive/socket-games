import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {hugePlusSign, hugeUser} from '@ng-icons/huge-icons';
import {GameService} from '../../../../shared/services/game.service';
import {GameData, PlayerData} from 'socket-game-types';
import {GameInputBase} from '../../directives/game-input-base.directive';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    NgForOf,
    NgIcon,
    NgIf
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
  viewProviders: [
    provideIcons({
      hugeUser,
      hugePlusSign
    })
  ]
})
export class LobbyComponent extends GameInputBase<GameData, PlayerData> implements OnInit{

  constructor() {
    super();
  }

  protected get minPlayers() {
    return this.gameData.minPlayers;
  }

  protected get maxPlayers() {
    return this.gameData.maxPlayers;
  }

  protected get players() {
    return this.gameData.players;
  }

  protected get gameTitle() {
    return this.cmsGame.translations[0].title;
  }

  startGame() {
    // Logic to start the game
    console.log('Game started');
  }

  ngOnInit(): void {
    console.log("gameData", this.gameData);
    console.log("playerData", this.playerData);
  }
}
