import {Component} from '@angular/core';
import {WindowComponent} from '../../components/window/window.component';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SocketJoin} from 'socket-game-types';
import {ActivatedRoute, Router} from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.joinForm = this.fb.group({
      username: ['', Validators.required],
      password: ['']
    });
  }

  protected get needPassword() {
    return false;
  }

  private get hash() {
    return this.route.snapshot.paramMap.get('hash');
  }

  protected async onSubmit() {
    if (this.joinForm.invalid) return;


    await this.router.navigate(['/join', this.hash], {
      state: {
        join: {
          name: this.joinForm.controls['username'].value,
          hash: this.hash,
          password: this.needPassword ? this.joinForm.controls['password'].value : undefined
        } as SocketJoin
      },
      onSameUrlNavigation: 'reload'
    });
  }

}
