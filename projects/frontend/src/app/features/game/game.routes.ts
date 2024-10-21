import {Routes} from '@angular/router';
import GameComponent from './pages/game/game.component';
import {ConnectionGuard} from './services/connection.guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':hash',
        component: GameComponent,
        canActivate: [ConnectionGuard]
      }
    ]
  }
];
