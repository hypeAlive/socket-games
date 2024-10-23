import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {WindowComponent} from '../../components/window/window.component';
import {ActivatedRoute, Router} from '@angular/router';
import {CmsGame} from '../../../home/models/games.interface';
import {GameService} from '../../../../shared/services/game.service';
import {SocketJoin} from 'socket-game-types';
import { ToastrService } from 'ngx-toastr';

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
export default class CreateComponent implements OnInit, AfterViewInit {

  protected createForm: FormGroup;
  private gameData!: CmsGame;
  protected isLoading: boolean = false;
  private exampleName: string = 'Player';

  constructor(private fb: FormBuilder,
              private socket: GameService,
              private route: ActivatedRoute,
              private router: Router,
              private toastr: ToastrService) {
    this.route.data.subscribe(data => {
      this.gameData = data['game'];
      this.exampleName = data['exampleName'];
    });
    this.createForm = this.fb.group({
      username: ['', Validators.required],
      password: [''],
      setPassword: [false]
    });
  }

  protected get needPassword() {
    return this.createForm.controls['setPassword'].value;
  }

  onSubmit() {
    if (this.isLoading) return;
    if (this.createForm.invalid) return;
    this.isLoading = true;
    this.socket.createGame(this.gameData.unique_code, this.needPassword ? this.createForm.controls['password'].value : undefined)
      .then(async (data) => {
        this.toastr.success('Created Game ' + data.hash);
        await this.router.navigate(['/join', data.hash], {
          state: {
            join: {
              name: this.createForm.controls['username'].value,
              hash: data.hash,
              password: this.needPassword ? this.createForm.controls['password'].value : undefined
            } as SocketJoin
          }
        });
      })
  }

  ngOnInit(): void {
    console.log(this.gameData);
  }

  protected get gameTitle(): string {
    return this.gameData.translations[0].title;
  }

  ngAfterViewInit(): void {
    this.createForm.controls['username'].setValue(this.exampleName);
  }

  clearPlaceholder(): void {
    if (this.createForm.controls['username'].value === this.exampleName) {
      this.createForm.controls['username'].setValue('');
    }
  }

}
