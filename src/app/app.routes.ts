import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { TestRoutingComponent } from './test-routing.component';
import { ProfileComponent } from './features/auth/components/profile/profile.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AccouchementFormComponent } from './features/accouchements/components/accouchement-form/accouchement-form.component';
import { AccouchementDetailsComponent } from './features/accouchements/components/accouchement-details/accouchement-details.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'auth/login', 
    pathMatch: 'full' 
  },
  // Routes d'authentification sans layout
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  // Routes protégées avec layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      {
        path: 'patientes',
        loadChildren: () => import('./features/patientes/patientes.module').then(m => m.PatientesModule),
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      {
        path: 'grossesses',
        loadChildren: () => import('./features/grossesses/grossesses.module').then(m => m.GrossessesModule),
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      {
        path: 'references-et-rendezvous',
        loadChildren: () => import('./features/references-et-rendezvous/references-et-rendezvous.module').then(m => m.ReferencesEtRendezVousModule),
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      // Routes pour les accouchements antérieurs
      {
        path: 'accouchements',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
        children: [
          {
            path: 'new',
            component: AccouchementFormComponent,
            data: { 
              title: 'Nouvel accouchement antérieur',
              breadcrumb: 'Nouvel accouchement'
            }
          },
          {
            path: ':id',
            component: AccouchementDetailsComponent,
            data: { 
              title: 'Détails de l\'accouchement',
              breadcrumb: 'Détails accouchement'
            }
          },
          {
            path: ':id/edit',
            component: AccouchementFormComponent,
            data: { 
              title: 'Modifier accouchement',
              breadcrumb: 'Modifier accouchement'
            }
          }
        ]
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      // Routes de redirection vers le nouveau module
      {
        path: 'rendez-vous',
        redirectTo: 'references-et-rendezvous/rendez-vous',
        pathMatch: 'full'
      },
      {
        path: 'references',
        redirectTo: 'references-et-rendezvous/references',
        pathMatch: 'full'
      },
      // Routes temporaires - redirection vers dashboard
      {
        path: 'diagnostique',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'etablissements',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'administration',
        loadChildren: () => import('./features/administration/administration.module').then(m => m.AdministrationModule),
        canActivate: [RoleGuard],
        data: { role: 'ADMIN', title: 'Administration' }
      }
    ]
  },
  // Route de test
  { 
    path: 'test', 
    component: TestRoutingComponent 
  },
  // Routes d'erreur
  {
    path: 'forbidden',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'not-found',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  { 
    path: '**', 
    redirectTo: 'auth/login'
  }
];
