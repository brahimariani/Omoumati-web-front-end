import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

// Import des composants
import { GrossesseListComponent } from './components/grossesse-list/grossesse-list.component';
import { GrossesseFormComponent } from './components/grossesse-form/grossesse-form.component';
import { GrossesseDetailsComponent } from './components/grossesse-details/grossesse-details.component';
import { AccouchementFormComponent } from '../accouchements/components/accouchement-form/accouchement-form.component';
import { NaissanceFormComponent } from '../naissances/components/naissance-form/naissance-form.component';
import { ConsultationDetailsComponent } from '../consultations/consultation-details/consultation-details.component';

export const grossessesRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    children: [
      {
        path: '',
        component: GrossesseListComponent,
        data: { 
          title: 'Liste des grossesses',
          breadcrumb: 'Grossesses'
        }
      },
      {
        path: 'new',
        component: GrossesseFormComponent,
        canActivate: [RoleGuard],
        data: { 
          title: 'Nouvelle grossesse',
          breadcrumb: 'Nouvelle grossesse',
          roles: ['ADMIN', 'DOCTOR']
        }
      },
      {
        path: ':id',
        component: GrossesseDetailsComponent,
        data: { 
          title: 'Détails de la grossesse',
          breadcrumb: 'Détails'
        }
      },
      {
        path: ':id/edit',
        component: GrossesseFormComponent,
        canActivate: [RoleGuard],
        data: { 
          title: 'Modifier grossesse',
          breadcrumb: 'Modifier grossesse',
          roles: ['ADMIN', 'DOCTOR']
        }
      },
      {
        path: ':id/consultations/:consultationId',
        component: ConsultationDetailsComponent,
        data: { 
          title: 'Détails de la consultation',
          breadcrumb: 'Consultation',
          roles: ['ADMIN', 'DOCTOR', 'NURSE']
        }
      },
      {
        path: ':id/accouchement',
        component: AccouchementFormComponent,
        canActivate: [RoleGuard],
        data: { 
          title: 'Nouvel accouchement',
          breadcrumb: 'Nouvel accouchement',
          roles: ['ADMIN', 'DOCTOR', 'NURSE']
        }
      },
      {
        path: ':id/naissance',
        component: NaissanceFormComponent,
        canActivate: [RoleGuard],
        data: { 
          title: 'Nouvelle naissance',
          breadcrumb: 'Nouvelle naissance',
          roles: ['ADMIN', 'DOCTOR', 'NURSE']
        }
      },
      { path: '**', redirectTo: '' }
    ]
  }
]; 