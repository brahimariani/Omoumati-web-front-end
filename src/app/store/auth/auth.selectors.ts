import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

/**
 * Sélecteur de feature pour l'état d'authentification
 */
export const selectAuthState = createFeatureSelector<AuthState>('auth');

/**
 * Sélecteur pour l'utilisateur actuel
 */
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

/**
 * Sélecteur pour savoir si l'utilisateur est authentifié
 */
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

/**
 * Sélecteur pour l'état de chargement de l'authentification
 */
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

/**
 * Sélecteur pour les erreurs d'authentification
 */
export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

/**
 * Sélecteur pour le token JWT
 */
export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

/**
 * Sélecteur pour le refresh token
 */
export const selectRefreshToken = createSelector(
  selectAuthState,
  (state) => state.refreshToken
);

/**
 * Sélecteur pour le nom complet de l'utilisateur
 */
export const selectUserFullName = createSelector(
  selectCurrentUser,
  (user) => user ? `${user.nom} ${user.prenom}` : null
);

/**
 * Sélecteur pour l'ID du centre de l'utilisateur actuel
 */
export const selectCurrentUserCentreId = createSelector(
  selectCurrentUser,
  (user) => user?.centre?.id || null
);

/**
 * Sélecteur pour le centre de l'utilisateur actuel
 */
export const selectCurrentUserCentre = createSelector(
  selectCurrentUser,
  (user) => user?.centre || null
);

/**
 * Sélecteur pour vérifier si l'utilisateur a un rôle spécifique
 */
export const selectHasRole = (role: string) => createSelector(
  selectCurrentUser,
  (user) => !!user && user.role.nom.includes(role)
);

/**
 * Sélecteur pour vérifier si l'utilisateur a au moins un des rôles spécifiés
 */
export const selectHasAnyRole = (roles: string[]) => createSelector(
  selectCurrentUser,
  (user) => !!user && roles.some(role => user.role.nom.includes(role))
); 