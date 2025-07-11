import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ComplicationsState } from './complications.reducer';

/**
 * Sélecteur de la feature 'complications'
 */
export const selectComplicationsState = createFeatureSelector<ComplicationsState>('complications');

/**
 * Sélecteur pour la liste des complications
 */
export const selectAllComplications = createSelector(
  selectComplicationsState,
  (state) => state?.complications || []
);

/**
 * Sélecteur pour la complication sélectionnée
 */
export const selectSelectedComplication = createSelector(
  selectComplicationsState,
  (state) => state?.selectedComplication || null
);

/**
 * Sélecteur pour l'ID de la complication sélectionnée
 */
export const selectSelectedComplicationId = createSelector(
  selectComplicationsState,
  (state) => state?.selectedComplicationId || null
);

/**
 * Sélecteur pour les complications par grossesse
 */
export const selectComplicationsByGrossesse = createSelector(
  selectComplicationsState,
  (state) => state?.complicationsByGrossesse || []
);

/**
 * Sélecteur pour les complications par accouchement
 */
export const selectComplicationsByAccouchement = createSelector(
  selectComplicationsState,
  (state) => state?.complicationsByAccouchement || []
);

/**
 * Sélecteur pour les complications par naissance
 */
export const selectComplicationsByNaissance = createSelector(
  selectComplicationsState,
  (state) => state?.complicationsByNaissance || []
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectComplicationsLoading = createSelector(
  selectComplicationsState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectComplicationsError = createSelector(
  selectComplicationsState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les filtres actifs
 */
export const selectComplicationsFilters = createSelector(
  selectComplicationsState,
  (state) => state?.filters || {}
);

/**
 * Sélecteur pour une complication par ID
 */
export const selectComplicationById = (id: string) => createSelector(
  selectAllComplications,
  (complications) => complications?.find(complication => complication.id === id) || null
);

/**
 * Sélecteur pour le nombre total de complications
 */
export const selectComplicationsCount = createSelector(
  selectAllComplications,
  (complications) => complications?.length || 0
);

/**
 * Sélecteur pour vérifier si des données sont chargées
 */
export const selectHasComplicationsData = createSelector(
  selectAllComplications,
  selectComplicationsLoading,
  (complications, loading) => complications.length > 0 && !loading
);

/**
 * Sélecteur pour vérifier si l'état est vide (pas de données et pas de chargement)
 */
export const selectIsComplicationsEmpty = createSelector(
  selectAllComplications,
  selectComplicationsLoading,
  (complications, loading) => complications.length === 0 && !loading
); 