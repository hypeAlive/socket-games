import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

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

}
