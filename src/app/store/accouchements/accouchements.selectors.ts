import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccouchementsState } from './accouchements.reducer';

/**
 * Sélecteur de la feature 'accouchements'
 */
export const selectAccouchementsState = createFeatureSelector<AccouchementsState>('accouchements');

/**
 * Sélecteur pour la liste des accouchements
 */
export const selectAllAccouchements = createSelector(
  selectAccouchementsState,
  (state) => state?.accouchements || []
);

/**
 * Sélecteur pour l'accouchement sélectionné
 */
export const selectSelectedAccouchement = createSelector(
  selectAccouchementsState,
  (state) => state?.selectedAccouchement || null
);

/**
 * Sélecteur pour l'ID de l'accouchement sélectionné
 */
export const selectSelectedAccouchementId = createSelector(
  selectAccouchementsState,
  (state) => state?.selectedAccouchementId || null
);

/**
 * Sélecteur pour les accouchements par patiente
 */
export const selectAccouchementsByPatient = createSelector(
  selectAccouchementsState,
  (state) => state?.accouchementsByPatient || []
);

/**
 * Sélecteur pour les accouchements par grossesse
 */
export const selectAccouchementsByGrossesse = createSelector(
  selectAccouchementsState,
  (state) => state?.accouchementsByGrossesse || []
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectAccouchementsLoading = createSelector(
  selectAccouchementsState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectAccouchementsError = createSelector(
  selectAccouchementsState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les informations de pagination
 */
export const selectAccouchementsPagination = createSelector(
  selectAccouchementsState,
  (state) => state?.pagination || {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  }
);

/**
 * Sélecteur pour le terme de recherche actuel
 */
export const selectAccouchementsSearchTerm = createSelector(
  selectAccouchementsState,
  (state) => state?.searchTerm || null
);

/**
 * Sélecteur pour les filtres actifs
 */
export const selectAccouchementsFilters = createSelector(
  selectAccouchementsState,
  (state) => state?.filters || {}
);

/**
 * Sélecteur pour vérifier s'il y a des accouchements
 */
export const selectHasAccouchements = createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements && accouchements.length > 0
);

/**
 * Sélecteur pour un accouchement par ID
 */
export const selectAccouchementById = (id: string) => createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements?.find(accouchement => accouchement.id === id) || null
);

/**
 * Sélecteur pour les accouchements avec assistance qualifiée
 */
export const selectAccouchementsWithAssistance = createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements?.filter(accouchement => accouchement.assisstanceQualifiee) || []
);

/**
 * Sélecteur pour les accouchements sans assistance qualifiée
 */
export const selectAccouchementsWithoutAssistance = createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements?.filter(accouchement => !accouchement.assisstanceQualifiee) || []
);

/**
 * Sélecteur pour les accouchements par modalité d'extraction
 */
export const selectAccouchementsByModalite = (modalite: string) => createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements?.filter(accouchement => accouchement.modaliteExtraction === modalite) || []
);

/**
 * Sélecteur pour les accouchements par lieu
 */
export const selectAccouchementsByLieu = (lieu: string) => createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements?.filter(accouchement => accouchement.lieu === lieu) || []
);

/**
 * Sélecteur pour les accouchements dans une plage de dates
 */
export const selectAccouchementsByDateRange = (startDate: Date, endDate: Date) => createSelector(
  selectAllAccouchements,
  (accouchements) => accouchements?.filter(accouchement => {
    const accouchementDate = new Date(accouchement.date);
    return accouchementDate >= startDate && accouchementDate <= endDate;
  }) || []
);

/**
 * Sélecteur pour les accouchements récents (dernière semaine)
 */
export const selectAccouchementsRecents = createSelector(
  selectAllAccouchements,
  (accouchements) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return accouchements?.filter(accouchement => {
      const accouchementDate = new Date(accouchement.date);
      return accouchementDate >= oneWeekAgo;
    }) || [];
  }
);

/**
 * Sélecteur pour les accouchements d'aujourd'hui
 */
export const selectAccouchementsToday = createSelector(
  selectAllAccouchements,
  (accouchements) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return accouchements?.filter(accouchement => {
      const accouchementDate = new Date(accouchement.date);
      return accouchementDate >= today && accouchementDate < tomorrow;
    }) || [];
  }
); 