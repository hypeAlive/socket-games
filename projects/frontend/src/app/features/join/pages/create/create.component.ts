import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {WindowComponent} from '../../components/window/window.component';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    WindowComponent
  ],
  templateUrl: './create.component.html',
  styles: []
})
export default class CreateComponent {

  protected createForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      username: [''],
      password: [''],
      setPassword: [false]
    });
  }

  protected get needPassword() {
    return this.createForm.controls['setPassword'].value;
  }

  onSubmit() {
    console.log(this.createForm.value);
  }

}
