import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TraitementsState } from './traitements.reducer';

/**
 * Feature selector pour l'état des traitements
 */
export const selectTraitementsState = createFeatureSelector<TraitementsState>('traitements');

/**
 * Selectors de base pour l'état des traitements
 */
export const selectAllTraitements = createSelector(
  selectTraitementsState,
  (state) => state.traitements
);

export const selectSelectedTraitement = createSelector(
  selectTraitementsState,
  (state) => state.selectedTraitement
);

export const selectSelectedTraitementId = createSelector(
  selectTraitementsState,
  (state) => state.selectedTraitementId
);

export const selectTraitementsByConsultation = createSelector(
  selectTraitementsState,
  (state) => state.traitementsByConsultation
);

export const selectTraitementsActifs = createSelector(
  selectTraitementsState,
  (state) => state.traitementsActifs
);

export const selectTraitementsLoading = createSelector(
  selectTraitementsState,
  (state) => state.loading
);

export const selectTraitementsError = createSelector(
  selectTraitementsState,
  (state) => state.error
);

/**
 * Selectors pour la pagination
 */
export const selectTraitementsPagination = createSelector(
  selectTraitementsState,
  (state) => state.pagination
);

export const selectTraitementsTotalElements = createSelector(
  selectTraitementsPagination,
  (pagination) => pagination.totalElements
);

export const selectTraitementsTotalPages = createSelector(
  selectTraitementsPagination,
  (pagination) => pagination.totalPages
);

export const selectTraitementsCurrentPage = createSelector(
  selectTraitementsPagination,
  (pagination) => pagination.currentPage
);

export const selectTraitementsPageSize = createSelector(
  selectTraitementsPagination,
  (pagination) => pagination.pageSize
);

/**
 * Selectors pour les filtres et recherche
 */
export const selectTraitementsFilters = createSelector(
  selectTraitementsState,
  (state) => state.filters
);

export const selectTraitementsSearchTerm = createSelector(
  selectTraitementsState,
  (state) => state.searchTerm
);

export const selectCurrentConsultationId = createSelector(
  selectTraitementsFilters,
  (filters) => filters.consultationId
);

export const selectCurrentMedicamentFilter = createSelector(
  selectTraitementsFilters,
  (filters) => filters.medicament
);

export const selectCurrentDateRangeFilter = createSelector(
  selectTraitementsFilters,
  (filters) => ({
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin
  })
);

export const selectCurrentStatusFilter = createSelector(
  selectTraitementsFilters,
  (filters) => filters.status
);

/**
 * Selectors pour les statistiques
 */
export const selectTraitementsStats = createSelector(
  selectTraitementsState,
  (state) => state.stats
);

export const selectTotalTraitements = createSelector(
  selectTraitementsStats,
  (stats) => stats?.totalTraitements || 0
);

export const selectTraitementsActifsCount = createSelector(
  selectTraitementsStats,
  (stats) => stats?.traitementsActifs || 0
);

export const selectTraitementsTerminesCount = createSelector(
  selectTraitementsStats,
  (stats) => stats?.traitementsTermines || 0
);

export const selectMedicamentsUniques = createSelector(
  selectTraitementsStats,
  (stats) => stats?.medicamentsUniques || 0
);

export const selectTraitementParMedicament = createSelector(
  selectTraitementsStats,
  (stats) => stats?.traitementParMedicament || []
);

/**
 * Selectors pour les interactions médicamenteuses
 */
export const selectInteractions = createSelector(
  selectTraitementsState,
  (state) => state.interactions
);

export const selectHasInteractions = createSelector(
  selectInteractions,
  (interactions) => interactions?.hasInteractions || false
);

export const selectInteractionsList = createSelector(
  selectInteractions,
  (interactions) => interactions?.interactions || []
);

export const selectSevereInteractions = createSelector(
  selectInteractionsList,
  (interactions) => interactions.filter(i => i.severite === 'severe')
);

export const selectModerateInteractions = createSelector(
  selectInteractionsList,
  (interactions) => interactions.filter(i => i.severite === 'modere')
);

/**
 * Selectors pour les suggestions et validation
 */
export const selectTreatmentSuggestions = createSelector(
  selectTraitementsState,
  (state) => state.suggestions
);

export const selectPosologieValidation = createSelector(
  selectTraitementsState,
  (state) => state.posologieValidation
);

export const selectPosologieIsValid = createSelector(
  selectPosologieValidation,
  (validation) => validation?.isValid || false
);

export const selectPosologieWarnings = createSelector(
  selectPosologieValidation,
  (validation) => validation?.warnings || []
);

export const selectPosologieRecommendations = createSelector(
  selectPosologieValidation,
  (validation) => validation?.recommendations || []
);

/**
 * Selectors pour l'export
 */
export const selectExportData = createSelector(
  selectTraitementsState,
  (state) => state.exportData
);

export const selectPdfBlob = createSelector(
  selectExportData,
  (exportData) => exportData.pdfBlob
);

export const selectExcelBlob = createSelector(
  selectExportData,
  (exportData) => exportData.excelBlob
);

/**
 * Selectors composés et utilitaires
 */

// Traitements groupés par médicament
export const selectTraitementsGroupedByMedicament = createSelector(
  selectAllTraitements,
  (traitements) => {
    const grouped = traitements.reduce((acc, traitement) => {
      const medicament = traitement.medicament;
      if (!acc[medicament]) {
        acc[medicament] = [];
      }
      acc[medicament].push(traitement);
      return acc;
    }, {} as Record<string, typeof traitements>);
    
    return Object.entries(grouped).map(([medicament, traitements]) => ({
      medicament,
      traitements,
      count: traitements.length
    }));
  }
);

// Traitements actifs pour une consultation spécifique
export const selectTraitementsActifsForConsultation = (consultationId: string) =>
  createSelector(
    selectTraitementsActifs,
    (traitementsActifs) => 
      traitementsActifs.filter(t => t.consultation.id === consultationId)
  );

// Traitements terminés récemment (derniers 30 jours)
export const selectRecentTerminatedTraitements = createSelector(
  selectAllTraitements,
  (traitements) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    
    return traitements.filter(t => {
      const dateFin = new Date(t.dateFin);
      return dateFin >= thirtyDaysAgo && dateFin <= today;
    });
  }
);

// Traitements par période spécifique
export const selectTraitementsInPeriod = (startDate: Date, endDate: Date) =>
  createSelector(
    selectAllTraitements,
    (traitements) => 
      traitements.filter(t => {
        const dateDebut = new Date(t.dateDebut);
        const dateFin = new Date(t.dateFin);
        return (dateDebut >= startDate && dateDebut <= endDate) ||
               (dateFin >= startDate && dateFin <= endDate) ||
               (dateDebut <= startDate && dateFin >= endDate);
      })
  );

// Recherche de traitement par ID
export const selectTraitementById = (id: string) =>
  createSelector(
    selectAllTraitements,
    (traitements) => traitements.find(t => t.id === id) || null
  );

// Médicaments uniques dans la liste actuelle
export const selectUniqueMedicaments = createSelector(
  selectAllTraitements,
  (traitements) => {
    const medicaments = new Set(traitements.map(t => t.medicament));
    return Array.from(medicaments).sort();
  }
);

// Posologies uniques dans la liste actuelle
export const selectUniquePosologies = createSelector(
  selectAllTraitements,
  (traitements) => {
    const posologies = new Set(traitements.map(t => t.posologie));
    return Array.from(posologies).sort();
  }
);

// Vérifier si il y a des traitements en cours
export const selectHasActiveTraitements = createSelector(
  selectTraitementsActifs,
  (traitementsActifs) => traitementsActifs.length > 0
);

// Vérifier si il y a des erreurs de validation
export const selectHasValidationErrors = createSelector(
  selectPosologieValidation,
  (validation) => validation ? !validation.isValid : false
);

// Compter les avertissements de validation
export const selectValidationWarningsCount = createSelector(
  selectPosologieWarnings,
  (warnings) => warnings.length
);

// Traitements nécessitant attention (interactions, avertissements, etc.)
export const selectTraitementsNeedingAttention = createSelector(
  selectHasInteractions,
  selectHasValidationErrors,
  selectSevereInteractions,
  (hasInteractions, hasValidationErrors, severeInteractions) => ({
    hasInteractions,
    hasValidationErrors,
    severeInteractionsCount: severeInteractions.length,
    needsAttention: hasInteractions || hasValidationErrors
  })
);

// État général de l'interface utilisateur
export const selectTraitementsUIState = createSelector(
  selectTraitementsLoading,
  selectTraitementsError,
  selectHasActiveTraitements,
  selectTraitementsNeedingAttention,
  (loading, error, hasActiveTraitements, attention) => ({
    loading,
    error,
    hasActiveTraitements,
    needsAttention: attention.needsAttention,
    isEmpty: !loading && !error && !hasActiveTraitements
  })
); 