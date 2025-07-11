import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReferencesState } from './references.reducer';

// Feature selector
export const selectReferencesState = createFeatureSelector<ReferencesState>('references');

// Selectors de base
export const selectReferences = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.references
);

export const selectSelectedReference = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.selectedReference
);

export const selectReferencesLoading = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.loading
);

export const selectReferencesError = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.error
);

// Selectors de pagination
export const selectReferencesTotalElements = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.totalElements
);

export const selectReferencesTotalPages = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.totalPages
);

export const selectReferencesCurrentPage = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.currentPage
);

export const selectReferencesPageSize = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.pageSize
);

// Selectors de statistiques
export const selectReferencesStatistics = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.statistics
);

export const selectRecentReferences = createSelector(
  selectReferencesState,
  (state: ReferencesState) => state.recentReferences
);

// Selectors composés
export const selectReferencesWithPagination = createSelector(
  selectReferences,
  selectReferencesTotalElements,
  selectReferencesTotalPages,
  selectReferencesCurrentPage,
  selectReferencesPageSize,
  (references, totalElements, totalPages, currentPage, pageSize) => ({
    references,
    totalElements,
    totalPages,
    currentPage,
    pageSize
  })
);

export const selectReferencesLoadingState = createSelector(
  selectReferencesLoading,
  selectReferencesError,
  (loading, error) => ({
    loading,
    error
  })
);

// Selectors par statut
export const selectReferencesByStatut = (statut: string) => createSelector(
  selectReferences,
  (references) => references.filter(ref => ref.statut === statut)
);

// Selectors par centre
export const selectReferencesByCentreOrigine = (centreId: string) => createSelector(
  selectReferences,
  (references) => references.filter(ref => ref.centreOrigine.id === centreId)
);

export const selectReferencesByCentreDestination = (centreId: string) => createSelector(
  selectReferences,
  (references) => references.filter(ref => ref.centreDestination.id === centreId)
);

// Selectors par patiente
export const selectReferencesByPatiente = (patienteId: string) => createSelector(
  selectReferences,
  (references) => references.filter(ref => ref.patiente.id === patienteId)
);

// Selector pour une référence par ID
export const selectReferenceById = (id: string) => createSelector(
  selectReferences,
  (references) => references.find(ref => ref.id === id)
);

// Selectors de comptage
export const selectReferencesCount = createSelector(
  selectReferences,
  (references) => references.length
);

export const selectReferencesCountByStatut = createSelector(
  selectReferences,
  (references) => {
    const counts = {
      ACCEPTED: 0,
      REJECTED: 0,
      REPORTED: 0
    };
    
    references.forEach(ref => {
      if (counts.hasOwnProperty(ref.statut)) {
        counts[ref.statut as keyof typeof counts]++;
      }
    });
    
    return counts;
  }
);

// Selector pour vérifier si des données existent
export const selectHasReferences = createSelector(
  selectReferences,
  (references) => references.length > 0
);

// Selector pour les références récentes (dernières 24h)
export const selectRecentReferencesToday = createSelector(
  selectReferences,
  (references) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    return references.filter(ref => 
      new Date(ref.createdAt) >= yesterday
    );
  }
);

// Selector pour les références par mois
export const selectReferencesByMonth = createSelector(
  selectReferences,
  (references) => {
    const referencesByMonth: { [key: string]: number } = {};
    
    references.forEach(ref => {
      const date = new Date(ref.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      referencesByMonth[monthKey] = (referencesByMonth[monthKey] || 0) + 1;
    });
    
    return referencesByMonth;
  }
); 