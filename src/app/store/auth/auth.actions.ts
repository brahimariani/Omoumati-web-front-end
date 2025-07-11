import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest } from '../../core/models/login/login.request.model';
import { UtilisateurResponse } from '../../core/models/utilisateur/utilisateur.response.model';
import { LoginResponse } from '../../core/models/login/login.response.model';

/**
 * Actions pour le module d'authentification
 */
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Connexion
    'Login': props<{ request: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse }>(),
    'Login Failure': props<{ error: string }>(),
    
    
    // Déconnexion
    'Logout': emptyProps(),
    'Logout Complete': emptyProps(),
    
    // Refresh du token
    'Refresh Token': emptyProps(),
    'Refresh Token Success': props<{ response: LoginResponse }>(),
    'Refresh Token Failure': props<{ error: string }>(),
    
    // Chargement de l'utilisateur
    'Load User': emptyProps(),
    'Load User Success': props<{ user: UtilisateurResponse }>(),
    'Load User Failure': props<{ error: string }>(),
    
    // Initialisation de l'authentification
    'Init Auth': emptyProps(),
    'Init Auth Complete': emptyProps()
  }
}); 