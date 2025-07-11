import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RolesState } from './roles.reducer';

/**
 * Sélecteur de la feature 'roles'
 */
export const selectRolesState = createFeatureSelector<RolesState>('roles');

// ============================
// SÉLECTEURS DE BASE
// ============================

/**
 * Sélectionne tous les rôles (avec pagination)
 */
export const selectAllRoles = createSelector(
  selectRolesState,
  (state: RolesState) => state.roles
);

/**
 * Sélectionne tous les rôles (simple, sans pagination)
 */
export const selectAllRolesSimple = createSelector(
  selectRolesState,
  (state: RolesState) => state.allRoles
);

/**
 * Sélectionne le rôle sélectionné
 */
export const selectSelectedRole = createSelector(
  selectRolesState,
  (state: RolesState) => state.selectedRole
);

/**
 * Sélectionne l'ID du rôle sélectionné
 */
export const selectSelectedRoleId = createSelector(
  selectRolesState,
  (state: RolesState) => state.selectedRoleId
);

/**
 * Sélectionne l'état de chargement
 */
export const selectRolesLoading = createSelector(
  selectRolesState,
  (state: RolesState) => state.loading
);

/**
 * Sélectionne l'erreur courante
 */
export const selectRolesError = createSelector(
  selectRolesState,
  (state: RolesState) => state.error
);

// ============================
// SÉLECTEURS DE PAGINATION
// ============================

/**
 * Sélectionne les informations de pagination
 */
export const selectRolesPagination = createSelector(
  selectRolesState,
  (state: RolesState) => state.pagination
);

/**
 * Sélectionne le nombre total de rôles
 */
export const selectRolesTotalElements = createSelector(
  selectRolesPagination,
  (pagination) => pagination.totalElements
);

/**
 * Sélectionne le nombre total de pages
 */
export const selectRolesTotalPages = createSelector(
  selectRolesPagination,
  (pagination) => pagination.totalPages
);

/**
 * Sélectionne la page courante
 */
export const selectRolesCurrentPage = createSelector(
  selectRolesPagination,
  (pagination) => pagination.currentPage
);

/**
 * Sélectionne la taille de page
 */
export const selectRolesPageSize = createSelector(
  selectRolesPagination,
  (pagination) => pagination.pageSize
);

// ============================
// SÉLECTEURS DE RECHERCHE ET FILTRAGE
// ============================

/**
 * Sélectionne le terme de recherche
 */
export const selectRolesSearchTerm = createSelector(
  selectRolesState,
  (state: RolesState) => state.searchTerm
);

/**
 * Vérifie si une recherche est active
 */
export const selectHasActiveSearch = createSelector(
  selectRolesSearchTerm,
  (searchTerm) => !!searchTerm
);

// ============================
// SÉLECTEURS DE STATISTIQUES
// ============================

/**
 * Sélectionne les statistiques des rôles
 */
export const selectRolesStatistics = createSelector(
  selectRolesState,
  (state: RolesState) => state.statistics
);

/**
 * Sélectionne le nombre total de rôles (depuis les statistiques)
 */
export const selectRolesStatsTotal = createSelector(
  selectRolesStatistics,
  (stats) => stats?.total || 0
);

/**
 * Sélectionne la répartition des utilisateurs par rôle
 */
export const selectUtilisateursParRole = createSelector(
  selectRolesStatistics,
  (stats) => stats?.utilisateursParRole || {}
);

/**
 * Sélectionne les rôles les plus utilisés
 */
export const selectRolesLesUtilises = createSelector(
  selectRolesStatistics,
  (stats) => stats?.rolesLesUtilises || []
);

// ============================
// SÉLECTEURS DE VALIDATION ET VÉRIFICATIONS
// ============================

/**
 * Sélectionne la disponibilité du nom
 */
export const selectRoleNameAvailability = createSelector(
  selectRolesState,
  (state: RolesState) => state.nameAvailability
);

/**
 * Sélectionne la possibilité de suppression
 */
export const selectRoleCanDelete = createSelector(
  selectRolesState,
  (state: RolesState) => state.canDelete
);

/**
 * Sélectionne les résultats de validation
 */
export const selectRoleValidation = createSelector(
  selectRolesState,
  (state: RolesState) => state.validation
);

// ============================
// SÉLECTEURS UTILISATEURS PAR RÔLE
// ============================

/**
 * Sélectionne tous les utilisateurs par rôle
 */
export const selectUsersByRole = createSelector(
  selectRolesState,
  (state: RolesState) => state.usersByRole
);

/**
 * Sélectionne les utilisateurs d'un rôle spécifique
 */
export const selectUsersByRoleId = (roleId: string) =>
  createSelector(
    selectUsersByRole,
    (usersByRole) => usersByRole[roleId] || []
  );

// ============================
// SÉLECTEURS DÉRIVÉS ET UTILITAIRES
// ============================

/**
 * Sélectionne un rôle par son ID
 */
export const selectRoleById = (id: string) =>
  createSelector(
    selectAllRoles,
    (roles) => {
      return roles.find(r => r.id === id) || null;
    }
  );

/**
 * Sélectionne les rôles triés par nom
 */
export const selectRolesSortedByName = createSelector(
  selectAllRoles,
  (roles) => [...roles].sort((a, b) => a.nom.localeCompare(b.nom))
);

/**
 * Sélectionne les rôles avec le nombre d'utilisateurs
 */
export const selectRolesWithUserCount = createSelector(
  selectAllRoles,
  selectUtilisateursParRole,
  (roles, utilisateursParRole) =>
    roles.map(role => ({
      ...role,
      userCount: utilisateursParRole[role.id] || 0
    }))
);

/**
 * Sélectionne les rôles qui peuvent être supprimés (sans utilisateurs)
 */
export const selectDeletableRoles = createSelector(
  selectRolesWithUserCount,
  (rolesWithCount) => rolesWithCount.filter(role => role.userCount === 0)
);

/**
 * Sélectionne les rôles qui ne peuvent pas être supprimés (avec utilisateurs)
 */
export const selectNonDeletableRoles = createSelector(
  selectRolesWithUserCount,
  (rolesWithCount) => rolesWithCount.filter(role => role.userCount > 0)
);

/**
 * Vérifie si l'état des rôles est vide
 */
export const selectIsRolesEmpty = createSelector(
  selectAllRoles,
  selectRolesLoading,
  (roles, loading) => !loading && roles.length === 0
);

/**
 * Vérifie si des rôles sont en cours de chargement pour la première fois
 */
export const selectIsInitialLoading = createSelector(
  selectRolesLoading,
  selectAllRoles,
  (loading, roles) => loading && roles.length === 0
);

/**
 * Sélectionne les options de rôles pour les sélecteurs (format simplifié)
 */
export const selectRoleOptions = createSelector(
  selectAllRoles,
  (roles) => roles.map(role => ({
    value: role.id,
    label: role.nom,
    description: role.description
  }))
); 