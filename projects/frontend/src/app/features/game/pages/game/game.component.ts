import { Component, Type } from '@angular/core';
import {ChatComponent} from '../../components/chat/chat/chat.component';
import {ChatMessageComponent} from '../../components/chat/chat-message/chat-message.component';
import {ChatInputComponent} from '../../components/chat/chat-input/chat-input.component';
import {RouterOutlet} from '@angular/router';
import {ConnectFourComponent} from '../connect-four/connect-four.component';
import {NgComponentOutlet} from '@angular/common';
import {TikTakToeComponent} from '../tik-tak-toe/tik-tak-toe.component';

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
export default class GameComponent {

  protected get gameComponent() {
    return {
      component: TikTakToeComponent
    } as {component: Type<any>}
  }

}
