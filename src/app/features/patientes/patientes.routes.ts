import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';
import { PatientProfileComponent } from './components/patient-profile/patient-profile.component';
import { PatientSearchComponent } from './components/patient-search/patient-search.component';

export const patientesRoutes: Routes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        component: PatientListComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      { 
        path: 'new', 
        component: PatientFormComponent,
        canActivate: [RoleGuard],
        data: { role: 'DOCTOR', roles: ['ADMIN', 'DOCTOR'] }
      },
      { 
        path: 'search', 
        component: PatientSearchComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      { 
        path: ':id', 
        component: PatientProfileComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
      },
      { 
        path: ':id/edit', 
        component: PatientFormComponent,
        canActivate: [RoleGuard],
        data: { role: 'DOCTOR', roles: ['ADMIN', 'DOCTOR'] }
      },
      { path: '**', redirectTo: '' }
    ]
  }
]; 