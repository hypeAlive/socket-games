import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {WindowComponent} from '../../components/window/window.component';
import {ActivatedRoute, Router} from '@angular/router';
import {CmsGame} from '../../../home/models/games.interface';

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
export default class CreateComponent implements OnInit {

  protected createForm: FormGroup;
  private gameData!: CmsGame;
  protected isLoading: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.gameData = data['game'];
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
    if(this.isLoading) return;
    this.isLoading = true;
    console.log(this.createForm.value);
    // Simulate an async operation
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  ngOnInit(): void {
    console.log(this.gameData);
  }

  protected get gameTitle(): string {
    return this.gameData.translations[0].title;
  }

}
