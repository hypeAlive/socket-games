import {Component, OnDestroy, OnInit, Type} from '@angular/core';
import {ChatComponent} from '../../components/chat/chat/chat.component';
import {ChatMessageComponent} from '../../components/chat/chat-message/chat-message.component';
import {ChatInputComponent} from '../../components/chat/chat-input/chat-input.component';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {NgComponentOutlet, NgIf} from '@angular/common';
import {LobbyComponent} from '../lobby/lobby.component';
import {GameService} from '../../../../shared/services/game.service';
import {Subscription} from 'rxjs';
import {GameData, GameState, PlayerData} from 'socket-game-types';
import {CmsGame} from '../../../home/models/games.interface';
import {TikTakToeComponent} from '../tik-tak-toe/tik-tak-toe.component';
import {CurrentTurnComponent} from '../../components/current-turn/current-turn.component';
import {EndComponent} from '../end/end.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    ChatComponent,
    ChatMessageComponent,
    ChatInputComponent,
    RouterOutlet,
    NgComponentOutlet,
    CurrentTurnComponent,
    NgIf
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export default class GameComponent implements OnInit, OnDestroy {

  private gameDataSub!: Subscription;
  private playerDataSub!: Subscription;
  protected gameData: GameData | undefined;
  protected playerData: PlayerData | undefined;
  private cmsGame!: CmsGame;

  constructor(private game: GameService, private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.cmsGame = data['game'];
    });
  }

  protected get gameComponent() {
    if (!this.gameData) return {
      component: null,
      inputs: {}
    };

    if (this.isGameState(GameState.WAITING))
      return {
        component: LobbyComponent,
        inputs: {
          gameData: this.gameData,
          playerData: this.playerData,
          cmsGame: this.cmsGame
        }
      }

    if(this.isGameState(GameState.ENDED))
      return {
        component: EndComponent,
        inputs: {
          gameData: this.gameData,
          playerData: this.playerData,
          cmsGame: this.cmsGame
        }
      }

    if (this.isGameState(GameState.RUNNING)) {
      const component = this.getComponentFromGameKey(this.cmsGame.unique_code);
      if (component) {
        return {
          component: component,
          inputs: {
            gameData: this.gameData,
            playerData: this.playerData,
            cmsGame: this.cmsGame
          }
        }
      }
    }

    return {
      component: null,
      inputs: {}
    };
  }

  protected isGameState(state: GameState) {
    if(!this.gameData) return false;
    return this.gameData.state === state;
  }

  private getComponentFromGameKey(gameKey: string): Type<any> | null {
    switch (gameKey) {
      case 'tiktaktoe':
        return TikTakToeComponent;
      default:
        return null;
    }
  }

  ngOnInit(): void {
    this.gameDataSub = this.game.subscribeGameData((data) => {
      if(!data) return;
      this.gameData = {
        ...this.gameData,
        ...data
      };
    });
    this.playerDataSub = this.game.subscribePlayerData((data) => {
      this.playerData = data;
    });
  }

  ngOnDestroy(): void {
    this.gameDataSub.unsubscribe();
    this.playerDataSub.unsubscribe();
  }

  protected readonly GameState = GameState;
}
