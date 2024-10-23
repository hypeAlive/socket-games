import {AfterViewInit, Component, OnInit} from '@angular/core';
import {WindowComponent} from '../../components/window/window.component';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SocketJoin} from 'socket-game-types';
import {ActivatedRoute, Router} from '@angular/router';
import {CmsGame} from '../../../home/models/games.interface';
import {RoomNeeds} from 'socket-game-types/dist/src/websocket/room.type';

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
export default class JoinComponent implements OnInit, AfterViewInit {

  protected joinForm: FormGroup;
  private gameData!: CmsGame;
  private needs!: RoomNeeds;
  private exampleName: string = 'Player';

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.gameData = data['game'];
      this.needs = data['needs'];
      this.exampleName = data['exampleName'];
    });
    this.joinForm = this.fb.group({
      username: ['', Validators.required],
      password: ['']
    });
  }

  protected get needPassword() {
    return this.needs.password;
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
        } as SocketJoin,
        game: this.gameData
      },
      onSameUrlNavigation: 'reload'
    });
  }

  protected get gameTitle() {
    return this.gameData.translations[0].title;
  }

  ngOnInit(): void {
    console.log("gameData", this.gameData);
    console.log("needs", this.needs);
  }

  ngAfterViewInit(): void {
    this.joinForm.controls['username'].setValue(this.exampleName);
  }

  clearPlaceholder(): void {
    if (this.joinForm.controls['username'].value === this.exampleName) {
      this.joinForm.controls['username'].setValue('');
    }
  }

}
