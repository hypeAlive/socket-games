import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {SocketMessage} from 'socket-game-types';

@Component({
  selector: 'game-chat-message',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './chat-message.component.html',
  styles: []
})
export class ChatMessageComponent {

  @Input() isRightAligned: boolean = false;

  @Input() message!: SocketMessage;

  protected getTime(): string {
    return new Date(this.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

}
