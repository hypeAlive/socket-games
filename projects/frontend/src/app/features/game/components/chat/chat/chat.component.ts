import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {hugeBubbleChat, hugeBubbleChatCancel, hugeCancelCircle} from '@ng-icons/huge-icons';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ChatInputComponent} from '../chat-input/chat-input.component';
import {ChatMessageComponent} from '../chat-message/chat-message.component';
import {animate, state, style, transition, trigger } from '@angular/animations';
import {Subscription} from 'rxjs';
import * as console from 'node:console';
import {GameService} from '../../../../../shared/services/game.service';
import {SocketMessage} from 'socket-game-types';

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
export class ChatComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('openButton') openButton!: ElementRef;

  constructor(private game: GameService) {
  }

  private hideOnOutsideClick = false;

  protected messages: SocketMessage[] = [];
  private messageSub!: Subscription;

  protected isChatOpen = false;

  protected toggleChat() {
    this.isChatOpen = !this.isChatOpen;
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
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.messageSub = this.game.subscribeMessages((message) => {
      this.messages.push(message);
    });
  }

}
