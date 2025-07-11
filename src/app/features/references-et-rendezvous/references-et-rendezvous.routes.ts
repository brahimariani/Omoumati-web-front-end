import { Routes } from '@angular/router';
import { ReferenceListComponent } from './components/reference-list/reference-list.component';
import { ReferenceFormComponent } from './components/reference-form/reference-form.component';
import { RendezVousListComponent } from './components/rendez-vous-list/rendez-vous-list.component';
import { RendezVousFormComponent } from './components/rendez-vous-form/rendez-vous-form.component';

export const referencesEtRendezVousRoutes: Routes = [
  {
    path: '',
    redirectTo: 'references',
    pathMatch: 'full'
  },
  {
    path: 'references',
    component: ReferenceListComponent,
    data: { title: 'Liste des Références' }
  },
  {
    path: 'references/nouveau',
    component: ReferenceFormComponent,
    data: { title: 'Nouvelle Référence' }
  },
  {
    path: 'references/modifier/:id',
    component: ReferenceFormComponent,
    data: { title: 'Modifier Référence' }
  },
  // Routes pour les rendez-vous
  {
    path: 'rendez-vous',
    component: RendezVousListComponent,
    data: { title: 'Liste des Rendez-vous' }
  },
  {
    path: 'rendez-vous/nouveau',
    component: RendezVousFormComponent,
    data: { title: 'Nouveau Rendez-vous' }
  },
  {
    path: 'rendez-vous/modifier/:id',
    component: RendezVousFormComponent,
    data: { title: 'Modifier Rendez-vous' }
  },
  // TODO: Ajouter le composant de calendrier plus tard
  // {
  //   path: 'rendez-vous/calendar',
  //   loadComponent: () => import('./components/rendez-vous-calendar/rendez-vous-calendar.component').then(m => m.RendezVousCalendarComponent),
  //   data: { title: 'Calendrier des Rendez-vous' }
  // }
]; 