import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CentresState } from './centres.reducer';

/**
 * Sélecteur pour l'état des centres
 */
export const selectCentresState = createFeatureSelector<CentresState>('centres');

/**
 * Sélecteurs pour les données principales
 */
export const selectAllCentres = createSelector(
  selectCentresState,
  (state: CentresState) => state.centres
);

export const selectSelectedCentre = createSelector(
  selectCentresState,
  (state: CentresState) => state.selectedCentre
);

export const selectSelectedCentreId = createSelector(
  selectCentresState,
  (state: CentresState) => state.selectedCentreId
);

export const selectMyCentres = createSelector(
  selectCentresState,
  (state: CentresState) => state.myCentres
);

export const selectCentreTypes = createSelector(
  selectCentresState,
  (state: CentresState) => state.types
);

export const selectCentresStatistics = createSelector(
  selectCentresState,
  (state: CentresState) => state.statistics
);

/**
 * Sélecteurs pour l'état de chargement et erreurs
 */
export const selectCentresLoading = createSelector(
  selectCentresState,
  (state: CentresState) => state.loading
);

export const selectCentresError = createSelector(
  selectCentresState,
  (state: CentresState) => state.error
);

/**
 * Sélecteurs pour la pagination
 */
export const selectCentresPagination = createSelector(
  selectCentresState,
  (state: CentresState) => state.pagination
);

export const selectCurrentPage = createSelector(
  selectCentresPagination,
  (pagination) => pagination.currentPage
);

export const selectPageSize = createSelector(
  selectCentresPagination,
  (pagination) => pagination.pageSize
);

export const selectTotalElements = createSelector(
  selectCentresPagination,
  (pagination) => pagination.totalElements
);

export const selectTotalPages = createSelector(
  selectCentresPagination,
  (pagination) => pagination.totalPages
);

/**
 * Sélecteurs pour les filtres et recherche
 */
export const selectSearchTerm = createSelector(
  selectCentresState,
  (state: CentresState) => state.searchTerm
);

export const selectCurrentFilter = createSelector(
  selectCentresState,
  (state: CentresState) => state.currentFilter
);

/**
 * Sélecteurs dérivés et utilitaires
 */

// Sélecteur pour vérifier s'il y a des centres
export const selectHasCentres = createSelector(
  selectAllCentres,
  (centres) => centres.length > 0
);

// Sélecteur pour obtenir le nombre total de centres
export const selectCentresCount = createSelector(
  selectAllCentres,
  (centres) => centres.length
);

// Sélecteur pour vérifier si une recherche est active
export const selectIsSearchActive = createSelector(
  selectSearchTerm,
  (searchTerm) => searchTerm !== null && searchTerm.trim().length > 0
);

// Sélecteur pour vérifier si un filtre est actif
export const selectIsFilterActive = createSelector(
  selectCurrentFilter,
  (filter) => filter !== null && filter.type !== undefined
);

// Sélecteur pour obtenir les centres par type spécifique
export const selectCentresByType = (type: string) => createSelector(
  selectAllCentres,
  (centres) => centres.filter(centre => centre.type === type)
);

// Sélecteur pour obtenir un centre par ID
export const selectCentreById = (id: string) => createSelector(
  selectAllCentres,
  (centres) => centres.find(centre => centre.id === id) || null
);

// Sélecteur pour vérifier si un centre est sélectionné
export const selectIsCentreSelected = createSelector(
  selectSelectedCentreId,
  (selectedId) => selectedId !== null
);

// Sélecteur pour obtenir les centres actifs uniquement
export const selectActiveCentres = createSelector(
  selectAllCentres,
  (centres) => centres.filter(centre => {
    // Assumant qu'il y a un champ 'actif' - à ajuster selon le modèle réel
    return (centre as any).actif === true;
  })
);

// Sélecteur pour obtenir les centres inactifs uniquement
export const selectInactiveCentres = createSelector(
  selectAllCentres,
  (centres) => centres.filter(centre => {
    // Assumant qu'il y a un champ 'actif' - à ajuster selon le modèle réel
    return (centre as any).actif === false;
  })
);



// Sélecteur pour les informations de pagination formatées
export const selectPaginationInfo = createSelector(
  selectCentresPagination,
  (pagination) => ({
    ...pagination,
    hasNextPage: pagination.currentPage < pagination.totalPages - 1,
    hasPreviousPage: pagination.currentPage > 0,
    startIndex: pagination.currentPage * pagination.pageSize + 1,
    endIndex: Math.min(
      (pagination.currentPage + 1) * pagination.pageSize,
      pagination.totalElements
    )
  })
);

// Sélecteur pour l'état de chargement global (utile pour l'UI)
export const selectIsLoading = createSelector(
  selectCentresLoading,
  (loading) => loading
);

// Sélecteur pour vérifier s'il y a des erreurs
export const selectHasError = createSelector(
  selectCentresError,
  (error) => error !== null
);

// Sélecteur pour obtenir les statistiques formatées
export const selectFormattedStatistics = createSelector(
  selectCentresStatistics,
  (statistics) => {
    if (!statistics) return null;
    
    return {
      ...statistics,
      activationRate: statistics.total > 0 
        ? Math.round((statistics.actifs / statistics.total) * 100) 
        : 0,
      inactivationRate: statistics.total > 0 
        ? Math.round((statistics.inactifs / statistics.total) * 100) 
        : 0
    };
  }
); 