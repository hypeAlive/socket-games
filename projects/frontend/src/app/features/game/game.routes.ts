import {Routes} from '@angular/router';
import GameComponent from './pages/game/game.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id',
        component: GameComponent
      }
    ]
  }
];
