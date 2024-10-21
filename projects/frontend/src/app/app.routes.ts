import { Routes } from '@angular/router';
import errorRoutes from './features/error/error.routes';
import {CreateResolver} from './features/join/services/create.resolver';
import {JoinGuard} from './features/join/services/join.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component'),
  },
  {
    path: 'create',
    loadComponent: () => import('./features/join/pages/create/create.component'),
    resolve: {
      game: CreateResolver
    }
  },
  {
    path: 'join/:hash',
    loadComponent: () => import('./features/join/pages/join/join.component'),
    canMatch: [JoinGuard]
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game.module'),
  },
  ...errorRoutes
];
