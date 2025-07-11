import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UtilisateursState } from './utilisateurs.reducer';
import { StatutUtilisateur } from '../../core/models/utilisateur/statututilisateur.model';

/**
 * Sélecteur de la feature 'utilisateurs'
 */
export const selectUtilisateursState = createFeatureSelector<UtilisateursState>('utilisateurs');

// ============================
// SÉLECTEURS DE BASE
// ============================

/**
 * Sélectionne tous les utilisateurs
 */
export const selectAllUtilisateurs = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.utilisateurs
);

/**
 * Sélectionne l'utilisateur sélectionné
 */
export const selectSelectedUtilisateur = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.selectedUtilisateur
);

/**
 * Sélectionne l'ID de l'utilisateur sélectionné
 */
export const selectSelectedUtilisateurId = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.selectedUtilisateurId
);

/**
 * Sélectionne le profil de l'utilisateur connecté
 */
export const selectCurrentUserProfile = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.currentUserProfile
);

/**
 * Sélectionne l'état de chargement
 */
export const selectUtilisateursLoading = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.loading
);

/**
 * Sélectionne l'erreur courante
 */
export const selectUtilisateursError = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.error
);

// ============================
// SÉLECTEURS DE PAGINATION
// ============================

/**
 * Sélectionne les informations de pagination
 */
export const selectUtilisateursPagination = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.pagination
);

/**
 * Sélectionne le nombre total d'utilisateurs
 */
export const selectUtilisateursTotalElements = createSelector(
  selectUtilisateursPagination,
  (pagination) => pagination.totalElements
);

/**
 * Sélectionne le nombre total de pages
 */
export const selectUtilisateursTotalPages = createSelector(
  selectUtilisateursPagination,
  (pagination) => pagination.totalPages
);

/**
 * Sélectionne la page courante
 */
export const selectUtilisateursCurrentPage = createSelector(
  selectUtilisateursPagination,
  (pagination) => pagination.currentPage
);

/**
 * Sélectionne la taille de page
 */
export const selectUtilisateursPageSize = createSelector(
  selectUtilisateursPagination,
  (pagination) => pagination.pageSize
);

// ============================
// SÉLECTEURS DE RECHERCHE ET FILTRAGE
// ============================

/**
 * Sélectionne le terme de recherche
 */
export const selectUtilisateursSearchTerm = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.searchTerm
);

/**
 * Sélectionne les filtres actifs
 */
export const selectUtilisateursFilters = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.filters
);

/**
 * Vérifie si des filtres sont actifs
 */
export const selectHasActiveFilters = createSelector(
  selectUtilisateursFilters,
  selectUtilisateursSearchTerm,
  (filters, searchTerm) => {
    return !!(
      searchTerm ||
      (filters && (filters.roleId || filters.statut || filters.centreId))
    );
  }
);

// ============================
// SÉLECTEURS DE STATISTIQUES
// ============================

/**
 * Sélectionne les statistiques des utilisateurs
 */
export const selectUtilisateursStatistics = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.statistics
);

/**
 * Sélectionne le nombre total d'utilisateurs (depuis les statistiques)
 */
export const selectUtilisateursStatsTotal = createSelector(
  selectUtilisateursStatistics,
  (stats) => stats?.total || 0
);

/**
 * Sélectionne le nombre d'utilisateurs actifs
 */
export const selectUtilisateursStatsActifs = createSelector(
  selectUtilisateursStatistics,
  (stats) => stats?.actifs || 0
);

/**
 * Sélectionne le nombre d'utilisateurs inactifs
 */
export const selectUtilisateursStatsInactifs = createSelector(
  selectUtilisateursStatistics,
  (stats) => stats?.inactifs || 0
);

/**
 * Sélectionne le nombre d'utilisateurs suspendus
 */
export const selectUtilisateursStatsSuspendus = createSelector(
  selectUtilisateursStatistics,
  (stats) => stats?.suspendus || 0
);

/**
 * Sélectionne la répartition par rôle
 */
export const selectUtilisateursStatsParRole = createSelector(
  selectUtilisateursStatistics,
  (stats) => stats?.parRole || {}
);

/**
 * Sélectionne la répartition par centre
 */
export const selectUtilisateursStatsParCentre = createSelector(
  selectUtilisateursStatistics,
  (stats) => stats?.parCentre || {}
);

// ============================
// SÉLECTEURS DE VALIDATION
// ============================

/**
 * Sélectionne l'état de validation
 */
export const selectUtilisateursValidation = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.validation
);

/**
 * Sélectionne la disponibilité de l'email
 */
export const selectEmailAvailability = createSelector(
  selectUtilisateursValidation,
  (validation) => validation.emailAvailable
);

/**
 * Sélectionne les erreurs de validation
 */
export const selectValidationErrors = createSelector(
  selectUtilisateursValidation,
  (validation) => validation.validationErrors
);

/**
 * Vérifie si la validation est en cours
 */
export const selectIsValidating = createSelector(
  selectEmailAvailability,
  selectValidationErrors,
  (emailAvailable, validationErrors) => {
    return emailAvailable === null && validationErrors === null;
  }
);

// ============================
// SÉLECTEURS SPÉCIALISÉS
// ============================

/**
 * Sélectionne le mot de passe temporaire
 */
export const selectTemporaryPassword = createSelector(
  selectUtilisateursState,
  (state: UtilisateursState) => state.temporaryPassword
);

/**
 * Sélectionne les utilisateurs par statut
 */
export const selectUtilisateursByStatus = (statut: StatutUtilisateur) =>
  createSelector(
    selectAllUtilisateurs,
    (utilisateurs) => utilisateurs.filter(user => user.statut === statut)
  );

/**
 * Sélectionne les utilisateurs actifs
 */
export const selectUtilisateursActifs = createSelector(
  selectAllUtilisateurs,
  (utilisateurs) => utilisateurs.filter(user => user.statut === StatutUtilisateur.ACTIF)
);

/**
 * Sélectionne les utilisateurs inactifs
 */
export const selectUtilisateursInactifs = createSelector(
  selectAllUtilisateurs,
  (utilisateurs) => utilisateurs.filter(user => user.statut === StatutUtilisateur.INACTIF)
);

/**
 * Sélectionne les utilisateurs suspendus
 */
export const selectUtilisateursSuspendus = createSelector(
  selectAllUtilisateurs,
  (utilisateurs) => utilisateurs.filter(user => user.statut === StatutUtilisateur.SUSPENDU)
);

/**
 * Sélectionne les utilisateurs par rôle
 */
export const selectUtilisateursByRole = (roleId: string) =>
  createSelector(
    selectAllUtilisateurs,
    (utilisateurs) => utilisateurs.filter(user => user.role?.id === roleId)
  );


/**
 * Sélectionne un utilisateur par ID
 */
export const selectUtilisateurById = (id: string) =>
  createSelector(
    selectAllUtilisateurs,
    (utilisateurs) => utilisateurs.find(user => user.id === id) || null
  );

// ============================
// SÉLECTEURS DE PERFORMANCE
// ============================

/**
 * Vérifie si la liste est vide
 */
export const selectIsUtilisateursListEmpty = createSelector(
  selectAllUtilisateurs,
  (utilisateurs) => utilisateurs.length === 0
);

/**
 * Compte le nombre d'utilisateurs chargés
 */
export const selectUtilisateursCount = createSelector(
  selectAllUtilisateurs,
  (utilisateurs) => utilisateurs.length
);

/**
 * Vérifie si plus de pages sont disponibles
 */
export const selectHasMorePages = createSelector(
  selectUtilisateursCurrentPage,
  selectUtilisateursTotalPages,
  (currentPage, totalPages) => currentPage < totalPages - 1
);

/**
 * Vérifie si c'est la première page
 */
export const selectIsFirstPage = createSelector(
  selectUtilisateursCurrentPage,
  (currentPage) => currentPage === 0
);

/**
 * Vérifie si c'est la dernière page
 */
export const selectIsLastPage = createSelector(
  selectUtilisateursCurrentPage,
  selectUtilisateursTotalPages,
  (currentPage, totalPages) => currentPage === totalPages - 1
);

// ============================
// SÉLECTEURS COMPOSÉS
// ============================

/**
 * Sélectionne l'état complet pour l'affichage de la liste
 */
export const selectUtilisateursListState = createSelector(
  selectAllUtilisateurs,
  selectUtilisateursLoading,
  selectUtilisateursError,
  selectUtilisateursPagination,
  selectUtilisateursSearchTerm,
  selectUtilisateursFilters,
  (utilisateurs, loading, error, pagination, searchTerm, filters) => ({
    utilisateurs,
    loading,
    error,
    pagination,
    searchTerm,
    filters,
    isEmpty: utilisateurs.length === 0,
    hasFilters: !!(searchTerm || (filters && (filters.roleId || filters.statut || filters.centreId)))
  })
);

/**
 * Sélectionne l'état complet pour le dashboard
 */
export const selectUtilisateursDashboardState = createSelector(
  selectUtilisateursStatistics,
  selectUtilisateursLoading,
  selectUtilisateursError,
  selectUtilisateursCount,
  (statistics, loading, error, count) => ({
    statistics,
    loading,
    error,
    loadedCount: count,
    hasData: !!statistics
  })
);

/**
 * Sélectionne les données pour les formulaires
 */
export const selectUtilisateursFormState = createSelector(
  selectSelectedUtilisateur,
  selectUtilisateursLoading,
  selectUtilisateursError,
  selectUtilisateursValidation,
  (selectedUtilisateur, loading, error, validation) => ({
    utilisateur: selectedUtilisateur,
    loading,
    error,
    validation,
    isEditing: !!selectedUtilisateur
  })
); 