import { Component } from '@angular/core';
import {WindowComponent} from '../../components/window/window.component';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-join-page',
  standalone: true,
  imports: [
    WindowComponent,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './join.component.html',
  styles: []
})
export default class JoinComponent {

  protected joinForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.joinForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  protected get needPassword() {
    return this.joinForm.controls['setPassword'].value;
  }

  onSubmit() {
    console.log(this.joinForm.value);
  }

}
