import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {GameService} from '../../../../../shared/services/game.service';

@Component({
  selector: 'game-chat-input',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './chat-input.component.html',
  styles: []
})
export class ChatInputComponent {
  protected chatForm: FormGroup;

  constructor(private fb: FormBuilder, private game: GameService) {
    this.chatForm = this.fb.group({
      message: ['']
    });
  }

  onSubmit() {
    this.game.sendMessage(this.chatForm.value.message);
    this.chatForm.reset();
  }
}
