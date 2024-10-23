import {Component, OnDestroy, OnInit, Type} from '@angular/core';
import {ChatComponent} from '../../components/chat/chat/chat.component';
import {ChatMessageComponent} from '../../components/chat/chat-message/chat-message.component';
import {ChatInputComponent} from '../../components/chat/chat-input/chat-input.component';
import {RouterOutlet} from '@angular/router';
import {NgComponentOutlet} from '@angular/common';
import {LobbyComponent} from '../lobby/lobby.component';
import {GameService} from '../../../../shared/services/game.service';
import {Subscription} from 'rxjs';
import {GameData, GameState} from 'socket-game-types';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    ChatComponent,
    ChatMessageComponent,
    ChatInputComponent,
    RouterOutlet,
    NgComponentOutlet
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export default class GameComponent implements OnInit, OnDestroy {

  private gameDataSub!: Subscription;
  private gameData: GameData | undefined

  constructor(private game: GameService) {
  }

  protected get gameComponent() {
    if(!this.gameData) return {
      component: null,
      inputs: {}
    };

    if(this.gameData.state === GameState.WAITING)
      return {
        component: LobbyComponent,
        inputs: {
          gameData: this.gameData
        }
      }

    return {
      component: null,
      inputs: {}
    };
  }

  ngOnInit(): void {
    this.gameDataSub = this.game.subscribeGameData((data) => {
      this.gameData = data;
    })
  }

  ngOnDestroy(): void {
  }

}
