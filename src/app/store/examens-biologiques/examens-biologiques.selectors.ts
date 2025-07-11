import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamensBiologiquesState } from './examens-biologiques.reducer';
import { ExamenBiologiqueResponse } from '../../core/models/examen_biologique/examen-biologique-response.model';

// ===== SÉLECTEUR DE FEATURE =====

export const selectExamensBiologiquesState = createFeatureSelector<ExamensBiologiquesState>('examens-biologiques');

// ===== SÉLECTEURS DE BASE =====

/**
 * Sélectionner tous les examens biologiques
 */
export const selectAllExamensBiologiques = createSelector(
  selectExamensBiologiquesState,
  (state) => state.examens
);

/**
 * Sélectionner l'examen biologique sélectionné
 */
export const selectSelectedExamenBiologique = createSelector(
  selectExamensBiologiquesState,
  (state) => state.selectedExamen
);

/**
 * Sélectionner l'état de chargement
 */
export const selectExamensBiologiquesLoading = createSelector(
  selectExamensBiologiquesState,
  (state) => state.loading
);

/**
 * Sélectionner l'état de chargement d'un examen
 */
export const selectExamenBiologiqueLoading = createSelector(
  selectExamensBiologiquesState,
  (state) => state.loadingExamen
);

/**
 * Sélectionner l'état de chargement d'analyse
 */
export const selectAnalyseLoading = createSelector(
  selectExamensBiologiquesState,
  (state) => state.loadingAnalyse
);

/**
 * Sélectionner l'erreur
 */
export const selectExamensBiologiquesError = createSelector(
  selectExamensBiologiquesState,
  (state) => state.error
);

// ===== SÉLECTEURS DE DONNÉES SPÉCIALISÉES =====

/**
 * Sélectionner les examens biologiques par consultation
 */
export const selectExamensByConsultation = (consultationId: string) => createSelector(
  selectExamensBiologiquesState,
  (state) => state.examensByConsultation[consultationId] || []
);

/**
 * Sélectionner les examens biologiques récents
 */
export const selectExamensRecents = createSelector(
  selectExamensBiologiquesState,
  (state) => state.examensRecents
);

/**
 * Sélectionner les examens biologiques avec anomalies
 */
export const selectExamensAvecAnomalies = createSelector(
  selectExamensBiologiquesState,
  (state) => state.examensAvecAnomalies
);

/**
 * Sélectionner les examens biologiques par type d'acte
 */
export const selectExamensByActeType = (nomActe: string) => createSelector(
  selectExamensBiologiquesState,
  (state) => state.examensByActeType[nomActe] || []
);

// ===== SÉLECTEURS POUR LES ACTES BIOLOGIQUES =====

/**
 * Sélectionner les actes biologiques standards
 */
export const selectActesBiologiquesStandards = createSelector(
  selectExamensBiologiquesState,
  (state) => state.actesBiologiquesStandards
);

/**
 * Sélectionner les analyses de valeurs biologiques
 */
export const selectAnalysesValeurs = createSelector(
  selectExamensBiologiquesState,
  (state) => state.analysesValeurs
);

/**
 * Sélectionner l'analyse d'un examen spécifique
 */
export const selectAnalyseByExamenId = (examenId: string) => createSelector(
  selectAnalysesValeurs,
  (analyses) => analyses[examenId] || []
);

/**
 * Sélectionner les actes avec anomalies d'un examen
 */
export const selectActesAvecAnomalies = (examenId: string) => createSelector(
  selectAnalyseByExamenId(examenId),
  (analyses) => analyses.filter(a => a.statut !== 'normal')
);

/**
 * Sélectionner les actes critiques d'un examen
 */
export const selectActesCritiques = (examenId: string) => createSelector(
  selectAnalyseByExamenId(examenId),
  (analyses) => analyses.filter(a => a.statut === 'critique')
);

// ===== SÉLECTEURS DE PAGINATION ET TRI =====

/**
 * Sélectionner la pagination
 */
export const selectPagination = createSelector(
  selectExamensBiologiquesState,
  (state) => state.pagination
);

/**
 * Sélectionner le tri
 */
export const selectSorting = createSelector(
  selectExamensBiologiquesState,
  (state) => state.sorting
);

/**
 * Sélectionner les filtres
 */
export const selectFilters = createSelector(
  selectExamensBiologiquesState,
  (state) => state.filters
);

// ===== SÉLECTEURS DE RECHERCHE =====

/**
 * Sélectionner les résultats de recherche
 */
export const selectSearchResults = createSelector(
  selectExamensBiologiquesState,
  (state) => state.searchResults
);

/**
 * Sélectionner le terme de recherche
 */
export const selectSearchTerm = createSelector(
  selectExamensBiologiquesState,
  (state) => state.searchTerm
);

/**
 * Sélectionner l'état de chargement de recherche
 */
export const selectSearchLoading = createSelector(
  selectExamensBiologiquesState,
  (state) => state.searchLoading
);

// ===== SÉLECTEURS DE STATISTIQUES =====

/**
 * Sélectionner les statistiques
 */
export const selectStatistiques = createSelector(
  selectExamensBiologiquesState,
  (state) => state.statistiques
);

/**
 * Sélectionner l'état de chargement des statistiques
 */
export const selectStatistiquesLoading = createSelector(
  selectExamensBiologiquesState,
  (state) => state.loadingStatistiques
);

/**
 * Sélectionner le nombre total d'examens
 */
export const selectTotalExamens = createSelector(
  selectStatistiques,
  (stats) => stats?.total || 0
);

/**
 * Sélectionner le nombre total d'actes
 */
export const selectTotalActes = createSelector(
  selectStatistiques,
  (stats) => stats?.nombreActes || 0
);

/**
 * Sélectionner le nombre d'anomalies
 */
export const selectNombreAnomalies = createSelector(
  selectStatistiques,
  (stats) => stats?.nombreAnomalies || 0
);

/**
 * Sélectionner la répartition des actes
 */
export const selectRepartitionActes = createSelector(
  selectStatistiques,
  (stats) => stats?.repartitionActes || {}
);

// ===== SÉLECTEURS CALCULÉS =====

/**
 * Sélectionner le nombre d'examens par consultation
 */
export const selectNombreExamensByConsultation = (consultationId: string) => createSelector(
  selectExamensByConsultation(consultationId),
  (examens) => examens.length
);

/**
 * Sélectionner si une consultation a des examens
 */
export const selectHasExamensForConsultation = (consultationId: string) => createSelector(
  selectExamensByConsultation(consultationId),
  (examens) => examens.length > 0
);

/**
 * Sélectionner les examens avec anomalies pour une consultation
 */
export const selectExamensAvecAnomaliesForConsultation = (consultationId: string) => createSelector(
  selectExamensByConsultation(consultationId),
  selectAnalysesValeurs,
  (examens, analyses) => examens.filter(examen => {
    const analyseExamen = analyses[examen.id];
    return analyseExamen && analyseExamen.some(a => a.statut !== 'normal');
  })
);

/**
 * Sélectionner les examens critiques pour une consultation
 */
export const selectExamensCritiquesForConsultation = (consultationId: string) => createSelector(
  selectExamensByConsultation(consultationId),
  selectAnalysesValeurs,
  (examens, analyses) => examens.filter(examen => {
    const analyseExamen = analyses[examen.id];
    return analyseExamen && analyseExamen.some(a => a.statut === 'critique');
  })
);

/**
 * Sélectionner les actes les plus fréquents
 */
export const selectActesLesPlusFrequents = createSelector(
  selectRepartitionActes,
  (repartition) => {
    return Object.entries(repartition)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nom, count]) => ({ nom, count }));
  }
);

/**
 * Sélectionner un examen par ID
 */
export const selectExamenById = (id: string) => createSelector(
  selectAllExamensBiologiques,
  (examens) => examens.find(examen => examen.id === id)
);

/**
 * Sélectionner les examens filtrés
 */
export const selectExamensFiltered = createSelector(
  selectAllExamensBiologiques,
  selectFilters,
  (examens, filters) => {
    let filteredExamens = [...examens];

    // Filtrer par terme de recherche
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredExamens = filteredExamens.filter(examen =>
        examen.observation?.toLowerCase().includes(searchTerm) ||
        examen.actesBiologiques.some(acte => 
          acte.nom.toLowerCase().includes(searchTerm) ||
          acte.valeur.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Filtrer par consultation
    if (filters.consultationId) {
      // Ce filtre sera géré par selectExamensByConsultation
    }

    // Filtrer par type d'acte
    if (filters.nomActe) {
      filteredExamens = filteredExamens.filter(examen =>
        examen.actesBiologiques.some(acte => 
          acte.nom.toLowerCase().includes(filters.nomActe!.toLowerCase())
        )
      );
    }

    // Filtrer par statut d'analyse
    if (filters.statutAnalyse) {
      // Ce filtre nécessiterait l'accès aux analyses, à implémenter si nécessaire
    }

    return filteredExamens;
  }
);

/**
 * Sélectionner les examens triés
 */
export const selectExamensSorted = createSelector(
  selectExamensFiltered,
  selectSorting,
  (examens, sorting) => {
    const sortedExamens = [...examens];
    
    sortedExamens.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sorting.sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'observation':
          aValue = a.observation || '';
          bValue = b.observation || '';
          break;
        case 'nombreActes':
          aValue = a.actesBiologiques.length;
          bValue = b.actesBiologiques.length;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) {
        return sorting.sortDir === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sorting.sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedExamens;
  }
);

/**
 * Sélectionner les examens paginés
 */
export const selectExamensPaginated = createSelector(
  selectExamensSorted,
  selectPagination,
  (examens, pagination) => {
    const startIndex = pagination.page * pagination.size;
    const endIndex = startIndex + pagination.size;
    return examens.slice(startIndex, endIndex);
  }
);

// ===== SÉLECTEURS D'EXPORT =====

/**
 * Sélectionner l'état de chargement d'export
 */
export const selectExportLoading = createSelector(
  selectExamensBiologiquesState,
  (state) => state.exportLoading
);

/**
 * Sélectionner l'URL d'export
 */
export const selectExportUrl = createSelector(
  selectExamensBiologiquesState,
  (state) => state.exportUrl
);

// ===== SÉLECTEURS COMPOSÉS =====

/**
 * Sélectionner le résumé d'une consultation
 */
export const selectConsultationSummary = (consultationId: string) => createSelector(
  selectExamensByConsultation(consultationId),
  selectAnalysesValeurs,
  (examens, analyses) => {
    const totalExamens = examens.length;
    const totalActes = examens.reduce((sum, examen) => sum + examen.actesBiologiques.length, 0);
    
    let examensAvecAnomalies = 0;
    let examensCritiques = 0;
    
    examens.forEach(examen => {
      const analyseExamen = analyses[examen.id];
      if (analyseExamen) {
        const hasAnomalies = analyseExamen.some(a => a.statut !== 'normal');
        const hasCritiques = analyseExamen.some(a => a.statut === 'critique');
        
        if (hasAnomalies) examensAvecAnomalies++;
        if (hasCritiques) examensCritiques++;
      }
    });

    return {
      totalExamens,
      totalActes,
      examensAvecAnomalies,
      examensCritiques,
      pourcentageAnomalies: totalExamens > 0 ? (examensAvecAnomalies / totalExamens) * 100 : 0
    };
  }
); 