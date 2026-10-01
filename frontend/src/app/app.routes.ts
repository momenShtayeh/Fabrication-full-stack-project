import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

//every page is loaded on demand (loadComponent), so the first download only contains what the login needs
export const routes: Routes = [
  {
    path: 'login',
    title: 'Log in | Fabrication Planning',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard | Fabrication Planning',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'materials',
        title: 'Materials | Fabrication Planning',
        loadComponent: () => import('./features/materials/material-list.component').then(m => m.MaterialListComponent)
      },
      {
        path: 'isos',
        title: 'ISOs | Fabrication Planning',
        loadComponent: () => import('./features/isos/iso-list.component').then(m => m.IsoListComponent)
      },
      {
        path: 'isos/:id',
        title: 'ISO | Fabrication Planning',
        loadComponent: () => import('./features/isos/iso-detail.component').then(m => m.IsoDetailComponent)
      },
      {
        path: 'spools',
        title: 'Spools | Fabrication Planning',
        loadComponent: () => import('./features/spools/spool-list.component').then(m => m.SpoolListComponent)
      },
      {
        path: 'spools/:id',
        title: 'Spool | Fabrication Planning',
        loadComponent: () => import('./features/spools/spool-detail.component').then(m => m.SpoolDetailComponent)
      },
      {
        path: 'batches',
        title: 'Batches | Fabrication Planning',
        loadComponent: () => import('./features/batches/batch-list.component').then(m => m.BatchListComponent)
      },
      {
        path: 'batches/:id',
        title: 'Batch | Fabrication Planning',
        loadComponent: () => import('./features/batches/batch-detail.component').then(m => m.BatchDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
