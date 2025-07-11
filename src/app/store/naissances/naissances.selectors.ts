import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NaissancesState } from './naissances.reducer';

/**
 * Sélecteur de la feature 'naissances'
 */
export const selectNaissancesState = createFeatureSelector<NaissancesState>('naissances');

/**
 * Sélecteur pour la liste des naissances
 */
export const selectAllNaissances = createSelector(
  selectNaissancesState,
  (state) => state?.naissances || []
);

/**
 * Sélecteur pour la naissance sélectionnée
 */
export const selectSelectedNaissance = createSelector(
  selectNaissancesState,
  (state) => state?.selectedNaissance || null
);

/**
 * Sélecteur pour l'ID de la naissance sélectionnée
 */
export const selectSelectedNaissanceId = createSelector(
  selectNaissancesState,
  (state) => state?.selectedNaissanceId || null
);

/**
 * Sélecteur pour les naissances par accouchement
 */
export const selectNaissancesByAccouchement = createSelector(
  selectNaissancesState,
  (state) => state?.naissancesByAccouchement || []
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectNaissancesLoading = createSelector(
  selectNaissancesState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectNaissancesError = createSelector(
  selectNaissancesState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les informations de pagination
 */
export const selectNaissancesPagination = createSelector(
  selectNaissancesState,
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
export const selectNaissancesSearchTerm = createSelector(
  selectNaissancesState,
  (state) => state?.searchTerm || null
);

/**
 * Sélecteur pour les filtres actifs
 */
export const selectNaissancesFilters = createSelector(
  selectNaissancesState,
  (state) => state?.filters || {}
);

/**
 * Sélecteur pour vérifier s'il y a des naissances
 */
export const selectHasNaissances = createSelector(
  selectAllNaissances,
  (naissances) => naissances && naissances.length > 0
);

/**
 * Sélecteur pour une naissance par ID
 */
export const selectNaissanceById = (id: string) => createSelector(
  selectAllNaissances,
  (naissances) => naissances?.find(naissance => naissance.id === id) || null
);

/**
 * Sélecteur pour les naissances vivantes
 */
export const selectNaissancesVivantes = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => naissance.estVivant) || []
);

/**
 * Sélecteur pour les naissances décédées
 */
export const selectNaissancesDecedees = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => !naissance.estVivant) || []
);

/**
 * Sélecteur pour les naissances par sexe
 */
export const selectNaissancesBySexe = (sexe: string) => createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => naissance.sexe === sexe) || []
);

/**
 * Sélecteur pour les naissances masculines
 */
export const selectNaissancesMasculines = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => naissance.sexe === 'M') || []
);

/**
 * Sélecteur pour les naissances féminines
 */
export const selectNaissancesFeminines = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => naissance.sexe === 'F') || []
);

/**
 * Sélecteur pour les naissances par plage de poids
 */
export const selectNaissancesByPoidsRange = (poidsMin: number, poidsMax: number) => createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => 
    naissance.poids >= poidsMin && naissance.poids <= poidsMax
  ) || []
);

/**
 * Sélecteur pour les naissances de faible poids (< 2500g)
 */
export const selectNaissancesFaiblePoids = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => naissance.poids < 2500) || []
);

/**
 * Sélecteur pour les naissances de poids normal (2500g - 4000g)
 */
export const selectNaissancesPoidsNormal = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => 
    naissance.poids >= 2500 && naissance.poids <= 4000
  ) || []
);

/**
 * Sélecteur pour les naissances de poids élevé (> 4000g)
 */
export const selectNaissancesPoidsEleve = createSelector(
  selectAllNaissances,
  (naissances) => naissances?.filter(naissance => naissance.poids > 4000) || []
);

/**
 * Sélecteur pour le poids moyen des naissances
 */
export const selectPoidsMoyenNaissances = createSelector(
  selectAllNaissances,
  (naissances) => {
    if (!naissances || naissances.length === 0) return 0;
    const totalPoids = naissances.reduce((sum, naissance) => sum + naissance.poids, 0);
    return totalPoids / naissances.length;
  }
); 