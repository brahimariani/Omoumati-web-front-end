import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { UtilisateurResponse } from '../../core/models/utilisateur/utilisateur.response.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StatutUtilisateur } from '../../core/models/utilisateur/statututilisateur.model';

/**
 * Interface pour l'état d'authentification
 */
export interface AuthState {
  user: UtilisateurResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

/**
 * État initial pour le reducer d'authentification
 */
export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null
};

/**
 * Helper pour extraire les informations utilisateur du token JWT
 */
const extractUserFromToken = (token: string): UtilisateurResponse | null => {
  try {
    const jwtHelper = new JwtHelperService();
    const decodedToken = jwtHelper.decodeToken(token);
    
    if (!decodedToken) {
      return null;
    }
    
    return {
      id: decodedToken.id || '',
      matricule: decodedToken.matricule || '',
      nom: decodedToken.nom || '',
      prenom: decodedToken.prenom || '',
      email: decodedToken.email || decodedToken.sub || '',
      telephone: decodedToken.telephone || '',
      adresse: decodedToken.adresse || '',
      statut: decodedToken.statut !== undefined ? decodedToken.statut : StatutUtilisateur.ACTIF,
      role: decodedToken.role || { 
        id: '',
        nom: 'USER', 
        description: 'Utilisateur',
        utilisateurs: []
      },
      centre: decodedToken.centre || null
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des informations utilisateur du token:', error);
    return null;
  }
};

/**
 * Reducer pour gérer les actions d'authentification
 */
export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.loginSuccess, (state, { response }) => {
    const user = extractUserFromToken(response.token);
    return {
      ...state,
      isLoading: false,
      isAuthenticated: true,
      user,
      token: response.token,
      error: null
    };
  }),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.logoutComplete, () => ({
    ...initialState
  })),
  
  // Refresh Token
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.refreshTokenSuccess, (state, { response }) => {
    const user = extractUserFromToken(response.token);
    return {
      ...state,
      isLoading: false,
      token: response.token,
      user,
      error: null
    };
  }),
  
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Load User
  on(AuthActions.loadUser, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    isLoading: false,
    user,
    isAuthenticated: true,
    error: null
  })),
  
  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Init Auth
  on(AuthActions.initAuth, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.initAuthComplete, (state) => ({
    ...state,
    isLoading: false
  }))
); 