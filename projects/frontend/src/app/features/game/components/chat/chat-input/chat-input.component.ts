import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.chatForm = this.fb.group({
      message: ['']
    });
  }

  onSubmit() {
    console.log(this.chatForm.value);
  }
}
