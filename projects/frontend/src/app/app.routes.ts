import { Routes } from '@angular/router';
import errorRoutes from './features/error/error.routes';
import {GameResolver} from './features/join/services/game.resolver';
import {JoinGuard} from './features/join/services/join.guard';
import {NeedResolver} from './features/join/services/need.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component'),
  },
  {
    path: 'create',
    loadComponent: () => import('./features/join/pages/create/create.component'),
    resolve: {
      game: GameResolver
    }
  },
  {
    path: 'join/:hash',
    loadComponent: () => import('./features/join/pages/join/join.component'),
    canMatch: [JoinGuard],
    resolve: {
      needs: NeedResolver,
      game: GameResolver
    }
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game.module'),
  },
  ...errorRoutes
];
