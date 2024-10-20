import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component'),
  },
  {
    path: 'create',
    loadComponent: () => import('./features/join/pages/create/create.component'),
  },
  {
    path: 'join',
    loadComponent: () => import('./features/join/pages/join/join.component'),
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game.module'),
  }
];
