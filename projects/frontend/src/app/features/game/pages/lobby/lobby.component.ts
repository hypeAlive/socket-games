import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {hugePlusSign, hugeUser} from '@ng-icons/huge-icons';
import {GameService} from '../../../../shared/services/game.service';
import {GameData} from 'socket-game-types';

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
export class LobbyComponent {

  @Input('gameData') gameData!: GameData;

  constructor() {
  }

  protected get minPlayers() {
    return this.gameData.minPlayers;
  }

  protected get maxPlayers() {
    return this.gameData.maxPlayers;
  }

  protected get players() {
    return this.gameData.playerIds;
  }



  startGame() {
    // Logic to start the game
    console.log('Game started');
  }
}
