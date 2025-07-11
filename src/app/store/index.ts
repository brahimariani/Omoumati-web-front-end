import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { AuthState, authReducer } from './auth';
import { PatientsState, patientsReducer } from './patients';
import { GrossessesState, grossessesReducer } from './grossesses';
import { AccouchementsState, accouchementsReducer } from './accouchements';
import { NaissancesState, naissancesReducer } from './naissances';
import { ComplicationsState, complicationsReducer } from './complications';
import { VaccinsState, vaccinsReducer } from './vaccins';
import { ConsultationsState, consultationsReducer } from './consultations';
import { TraitementsState, traitementsReducer } from './traitements';
import { ExamensCliniquesState, examensCliniquesReducer } from './examens-cliniques';
import { ExamensBiologiquesState, examensBiologiquesReducer } from './examens-biologiques';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ExamensEchographiquesState,examensEchographiquesReducer } from './examens-echographiques';
import { CentresState, centresReducer } from './centres';
import { UtilisateursState, utilisateursReducer } from './utilisateurs';
import { RolesState, rolesReducer } from './roles';
import { ReferencesState, referencesReducer } from './references';
import { RendezVousState, rendezVousReducer } from './rendez-vous';

/**
 * Interface décrivant la structure de l'état global de l'application
 */
export interface AppState {
  auth: AuthState;
  router: RouterReducerState;
  patients: PatientsState;
  grossesses: GrossessesState;
  accouchements: AccouchementsState;
  naissances: NaissancesState;
  complications: ComplicationsState;
  vaccins: VaccinsState;
  consultations: ConsultationsState;
  traitements: TraitementsState;
  'examens-cliniques': ExamensCliniquesState;
  'examens-biologiques': ExamensBiologiquesState;
  'examens-echographiques': ExamensEchographiquesState;
  centres: CentresState;
  utilisateurs: UtilisateursState;
  roles: RolesState;
  references: ReferencesState;
  rendezVous: RendezVousState;
  // Les autres états spécifiques à chaque module seront ajoutés ici
  // appointments: AppointmentsState;
  // establishments: EstablishmentsState;
  // diagnostics: DiagnosticsState;
}

/**
 * Objet contenant tous les reducers de l'application
 */
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  router: routerReducer,
  patients: patientsReducer,
  grossesses: grossessesReducer,
  accouchements: accouchementsReducer,
  naissances: naissancesReducer,
  complications: complicationsReducer,
  vaccins: vaccinsReducer,
  consultations: consultationsReducer,
  traitements: traitementsReducer,
  'examens-cliniques': examensCliniquesReducer,
  'examens-biologiques': examensBiologiquesReducer,
  'examens-echographiques': examensEchographiquesReducer,
  centres: centresReducer,
  utilisateurs: utilisateursReducer,
  roles: rolesReducer,
  references: referencesReducer,
  rendezVous: rendezVousReducer,
  // Les autres reducers spécifiques à chaque module seront ajoutés ici
  // appointments: appointmentsReducer,
  // establishments: establishmentsReducer,
  // diagnostics: diagnosticsReducer,
};

/**
 * Meta-reducer pour le débogage (actif uniquement en mode développement)
 * Journalise les actions et les changements d'état dans la console
 */
export function debugMetaReducer(reducer: any): any {
  return function(state: any, action: any): any {
    // Journalisation de l'action
    console.groupCollapsed(`[Action]: ${action.type}`);
    console.info('Action:', action);
    console.groupEnd();

    // Réduction de l'état
    const nextState = reducer(state, action);

    // Journalisation du nouvel état
    console.groupCollapsed(`[State]: ${action.type}`);
    console.info('Ancien état:', state);
    console.info('Action:', action);
    console.info('Nouvel état:', nextState);
    console.groupEnd();

    return nextState;
  };
}

/**
 * Meta-reducers pour intercepter les actions avant qu'elles n'atteignent les reducers
 * Utilisés pour la journalisation, les effets secondaires, etc.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production 
  ? [debugMetaReducer] 
  : [];