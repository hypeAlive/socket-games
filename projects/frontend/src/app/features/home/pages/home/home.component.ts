import {Component, OnInit} from '@angular/core';
import {CardComponent} from '../../components/card/card.component';
import {NgForOf} from '@angular/common';
import {DirectusService} from '../../../../core/services/directus.service';
import {CmsGame} from '../../models/games.interface';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CardComponent,
    NgForOf,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styles: []
})
export default class HomeComponent implements OnInit {

  joinForm: FormGroup;

  private availableGames: CmsGame[] = [];

  constructor(private directus: DirectusService, private fb: FormBuilder, private router: Router) {
    this.joinForm = this.fb.group({
      roomCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.directus.readItemsWithTranslation<CmsGame>('games')
      .then((games) => {
        this.availableGames = games;
      });
  }

  protected get games(): CmsGame[] {
    return this.availableGames;
  }

  async onSubmit(): Promise<void> {
    if (!this.joinForm.valid) return;

    const roomCode = this.joinForm.get('roomCode')?.value;

    await this.router.navigate(['/join', roomCode]);
  }

}
