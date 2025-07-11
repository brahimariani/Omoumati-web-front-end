import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { CentresListComponent } from './components/centres-list/centres-list.component';
import { CentreDetailsComponent } from './components/centre-details/centre-details.component';
import { CentreFormComponent } from './components/centre-form/centre-form.component';
import { UtilisateurListComponent } from './components/utilisateur-list/utilisateur-list.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { UtilisateurFormComponent } from './components/utilisateur-form/utilisateur-form.component';
import { RoleListComponent } from './components/role-list/role-list.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { RoleFormComponent } from './components/role-form/role-form.component';

export const administrationRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: '',
        redirectTo: 'centres',
        pathMatch: 'full'
      },
      {
        path: 'centres',
        component: CentresListComponent,
        data: { title: 'Administration - Gestion des centres' }
      },
      {
        path: 'centres/nouveau',
        component: CentreFormComponent,
        data: { title: 'Administration - Nouveau centre' }
      },
      {
        path: 'centres/:id',
        component: CentreDetailsComponent,
        data: { title: 'Administration - Détails du centre' }
      },
      {
        path: 'centres/:id/modifier',
        component: CentreFormComponent,
        data: { title: 'Administration - Modifier le centre' }
      },
      {
        path: 'utilisateurs',
        component: UtilisateurListComponent,
        data: { title: 'Administration - Gestion des utilisateurs' }
      },
      {
        path: 'utilisateurs/nouveau',
        component: UtilisateurFormComponent,
        data: { title: 'Administration - Nouvel utilisateur' }
      },
      {
        path: 'utilisateurs/:id',
        component: UtilisateurDetailsComponent,
        data: { title: 'Administration - Détails de l\'utilisateur' }
      },
      {
        path: 'utilisateurs/:id/modifier',
        component: UtilisateurFormComponent,
        data: { title: 'Administration - Modifier l\'utilisateur' }
      },
      {
        path: 'roles',
        component: RoleListComponent,
        data: { title: 'Administration - Gestion des rôles' }
      },
      {
        path: 'roles/nouveau',
        component: RoleFormComponent,
        data: { title: 'Administration - Nouveau rôle' }
      },
      {
        path: 'roles/:id',
        component: RoleDetailsComponent,
        data: { title: 'Administration - Détails du rôle' }
      },
      {
        path: 'roles/:id/modifier',
        component: RoleFormComponent,
        data: { title: 'Administration - Modifier le rôle' }
      },
      { 
        path: '**', 
        redirectTo: 'centres' 
      }
    ]
  }
]; 