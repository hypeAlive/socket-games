import {Component, OnDestroy, OnInit, Type} from '@angular/core';
import {ChatComponent} from '../../components/chat/chat/chat.component';
import {ChatMessageComponent} from '../../components/chat/chat-message/chat-message.component';
import {ChatInputComponent} from '../../components/chat/chat-input/chat-input.component';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {NgComponentOutlet} from '@angular/common';
import {LobbyComponent} from '../lobby/lobby.component';
import {GameService} from '../../../../shared/services/game.service';
import {Subscription} from 'rxjs';
import {GameData, GameState, PlayerData} from 'socket-game-types';
import {CmsGame} from '../../../home/models/games.interface';

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
  private playerDataSub!: Subscription;
  private gameData: GameData | undefined;
  private playerData: PlayerData | undefined;
  private cmsGame!: CmsGame;

  constructor(private game: GameService, private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.cmsGame = data['game'];
    });
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
          gameData: this.gameData,
          playerData: this.playerData,
          cmsGame: this.cmsGame
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
    });
    this.playerDataSub = this.game.subscribePlayerData((data) => {
      this.playerData = data;
    });
  }

  ngOnDestroy(): void {
    this.gameDataSub.unsubscribe();
  }

}
