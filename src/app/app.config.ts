import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { reducers, metaReducers } from './store';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { AuthEffects } from './store/auth';
import { PatientsEffects } from './store/patients';
import { GrossessesEffects } from './store/grossesses';
import { AccouchementsEffects } from './store/accouchements';
import { NaissancesEffects } from './store/naissances';
import { ComplicationsEffects } from './store/complications';
import { VaccinsEffects } from './store/vaccins';
import { ConsultationsEffects } from './store/consultations';
import { TraitementsEffects } from './store/traitements';
import { ExamensCliniquesEffects } from './store/examens-cliniques';
import { ExamensBiologiquesEffects } from './store/examens-biologiques';
import { ExamensEchographiquesEffects } from './store/examens-echographiques';
import { CentresEffects } from './store/centres';
import { UtilisateursEffects } from './store/utilisateurs';
import { RolesEffects } from './store/roles';
import { ReferencesEffects } from './store/references';
import { RendezVousEffects } from './store/rendez-vous';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    ),
    provideStore(reducers, { metaReducers }),
    provideStoreDevtools({
      maxAge: 25, // Retient les 25 dernières actions
      logOnly: !isDevMode(), // Restreint l'extension à la journalisation en production
      autoPause: true, // Met en pause l'enregistrement des actions lorsque l'extension de devtools du navigateur n'est pas ouverte
      trace: false, // Inclut ou non la trace de la pile dans les actions enregistrées
      traceLimit: 75, // Limite de la trace de la pile (en lignes) pour chaque action enregistrée
    }),
    provideEffects(
      AuthEffects, 
      PatientsEffects,
      GrossessesEffects,
      AccouchementsEffects,
      NaissancesEffects,
      ComplicationsEffects,
      VaccinsEffects,
      ConsultationsEffects,
      TraitementsEffects,
      ExamensCliniquesEffects,
      ExamensBiologiquesEffects,
      ExamensEchographiquesEffects,
      CentresEffects,
      UtilisateursEffects,
      RolesEffects,
      ReferencesEffects,
      RendezVousEffects
    ),
    provideRouterStore(),
    provideAnimationsAsync()
  ]
};
