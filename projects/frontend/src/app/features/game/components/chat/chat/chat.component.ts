import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {hugeBubbleChat, hugeBubbleChatCancel, hugeCancelCircle} from '@ng-icons/huge-icons';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ChatInputComponent} from '../chat-input/chat-input.component';
import {ChatMessageComponent} from '../chat-message/chat-message.component';
import {animate, state, style, transition, trigger } from '@angular/animations';
import {FrontendMessage, GameService} from '../../../../../shared/services/game.service';

@Component({
  selector: 'game-chat-sidebar',
  standalone: true,
  imports: [
    NgIcon,
    NgClass,
    ChatInputComponent,
    ChatMessageComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  viewProviders: [
    provideIcons({
      hugeBubbleChat,
      hugeBubbleChatCancel,
      hugeCancelCircle
    })
  ],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(120%)' })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class ChatComponent implements AfterViewInit {

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('openButton') openButton!: ElementRef;

  private currentMessage = 0;

  constructor(private game: GameService) {
  }

  private hideOnOutsideClick = false;

  protected isChatOpen = false;

  protected toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    this.currentMessage = this.messages.length;
    if(this.isChatOpen) {
      this.scrollToBottom();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if(!this.hideOnOutsideClick) return;
    if(this.openButton && this.openButton.nativeElement.contains(event.target)) return;
    if (this.isChatOpen && !this.chatContainer.nativeElement.contains(event.target)) {
      this.isChatOpen = false;
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  protected get messages(): FrontendMessage[] {
    return this.game.messages;
  }

  protected get hasNewMessages(): boolean {
    return this.newMessagesCount > 0;
  }

  protected get newMessagesCount(): number {
    return this.game.messages.length - this.currentMessage;
  }

}
