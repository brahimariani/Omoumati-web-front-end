import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GrossessesState } from './grossesses.reducer';

/**
 * Sélecteur de la feature 'grossesses'
 */
export const selectGrossessesState = createFeatureSelector<GrossessesState>('grossesses');

/**
 * Sélecteur pour la liste des grossesses
 */
export const selectAllGrossesses = createSelector(
  selectGrossessesState,
  (state) => state?.grossesses || []
);

/**
 * Sélecteur pour la grossesse sélectionnée
 */
export const selectSelectedGrossesse = createSelector(
  selectGrossessesState,
  (state) => state?.selectedGrossesse || null
);

/**
 * Sélecteur pour l'ID de la grossesse sélectionnée
 */
export const selectSelectedGrossesseId = createSelector(
  selectGrossessesState,
  (state) => state?.selectedGrossesseId || null
);

/**
 * Sélecteur pour les grossesses par patiente
 */
export const selectGrossessesByPatient = createSelector(
  selectGrossessesState,
  (state) => state?.grossessesByPatient || []
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectGrossessesLoading = createSelector(
  selectGrossessesState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectGrossessesError = createSelector(
  selectGrossessesState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les informations de pagination
 */
export const selectGrossessesPagination = createSelector(
  selectGrossessesState,
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
export const selectGrossessesSearchTerm = createSelector(
  selectGrossessesState,
  (state) => state?.searchTerm || null
);

/**
 * Sélecteur pour les filtres actifs
 */
export const selectGrossessesFilters = createSelector(
  selectGrossessesState,
  (state) => state?.filters || {}
);

/**
 * Sélecteur pour vérifier s'il y a des grossesses
 */
export const selectHasGrossesses = createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses && grossesses.length > 0
);

/**
 * Sélecteur pour une grossesse par ID
 */
export const selectGrossesseById = (id: string) => createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.find(grossesse => grossesse.id === id) || null
);

/**
 * Sélecteur pour les grossesses désirées
 */
export const selectGrossessesDesired = createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.filter(grossesse => grossesse.estDesiree) || []
);

/**
 * Sélecteur pour les grossesses non désirées
 */
export const selectGrossessesUndesired = createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.filter(grossesse => !grossesse.estDesiree) || []
);

/**
 * Sélecteur pour les grossesses par terme prévu (dans une plage de dates)
 */
export const selectGrossessesByDueDateRange = (startDate: Date, endDate: Date) => createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.filter(grossesse => {
    const dueDate = new Date(grossesse.datePrevueAccouchment);
    return dueDate >= startDate && dueDate <= endDate;
  }) || []
);

/**
 * Sélecteur pour les grossesses en cours (terme non dépassé)
 */
export const selectGrossessesEnCours = createSelector(
  selectAllGrossesses,
  (grossesses) => {
    const today = new Date();
    return grossesses?.filter(grossesse => {
      const dueDate = new Date(grossesse.datePrevueAccouchment);
      return dueDate >= today;
    }) || [];
  }
);

/**
 * Sélecteur pour les grossesses à terme (proche de l'accouchement)
 */
export const selectGrossessesATerm = createSelector(
  selectAllGrossesses,
  (grossesses) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return grossesses?.filter(grossesse => {
      const dueDate = new Date(grossesse.datePrevueAccouchment);
      return dueDate >= today && dueDate <= nextWeek;
    }) || [];
  }
);

/**
 * Sélecteur pour les grossesses par parité
 */
export const selectGrossessesByParite = (parite: number) => createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.filter(grossesse => grossesse.parite === parite) || []
);

/**
 * Sélecteur pour les primigestes (première grossesse)
 */
export const selectPrimigestes = createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.filter(grossesse => grossesse.parite === 1) || []
);

/**
 * Sélecteur pour les multigestes (plusieurs grossesses)
 */
export const selectMultigestes = createSelector(
  selectAllGrossesses,
  (grossesses) => grossesses?.filter(grossesse => grossesse.parite > 1) || []
); 