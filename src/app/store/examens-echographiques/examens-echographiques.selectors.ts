import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamensEchographiquesState } from './examens-echographiques.reducer';
import { ExamenEchographiqueResponse } from '../../core/models/examen_echographique/examen-echographique-response.model';

// ===== SÉLECTEUR DE FEATURE =====

export const selectExamensEchographiquesState = createFeatureSelector<ExamensEchographiquesState>('examens-echographiques');

// ===== SÉLECTEURS DE BASE =====

/**
 * Sélectionner tous les examens échographiques
 */
export const selectAllExamensEchographiques = createSelector(
  selectExamensEchographiquesState,
  (state) => state.examens
);

/**
 * Sélectionner l'examen échographique sélectionné
 */
export const selectSelectedExamenEchographique = createSelector(
  selectExamensEchographiquesState,
  (state) => state.selectedExamen
);

/**
 * Sélectionner les examens échographiques récents
 */
export const selectExamensEchographiquesRecents = createSelector(
  selectExamensEchographiquesState,
  (state) => state.examensRecents
);

/**
 * Sélectionner les examens échographiques avec anomalies
 */
export const selectExamensEchographiquesAvecAnomalies = createSelector(
  selectExamensEchographiquesState,
  (state) => state.examensAvecAnomalies
);

// ===== SÉLECTEURS DE RECHERCHE =====

/**
 * Sélectionner les résultats de recherche
 */
export const selectSearchResults = createSelector(
  selectExamensEchographiquesState,
  (state) => state.searchResults
);

/**
 * Sélectionner le terme de recherche actuel
 */
export const selectSearchTerm = createSelector(
  selectExamensEchographiquesState,
  (state) => state.searchTerm
);

/**
 * Sélectionner les examens échographiques par consultation
 */
export const selectExamensByConsultation = (consultationId: string) => createSelector(
  selectExamensEchographiquesState,
  (state) => {
    const examens = state.examensByConsultation[consultationId] || [];
    console.log('🎯 Sélecteur: Examens pour consultationId:', consultationId, 'Nombre:', examens.length, 'State:', state.examensByConsultation);
    return examens;
  }
);

/**
 * Sélectionner les examens échographiques par trimestre
 */
export const selectExamensByTrimestre = (trimestre: 1 | 2 | 3) => createSelector(
  selectExamensEchographiquesState,
  (state) => state.examensByTrimestre[trimestre] || []
);

// ===== SÉLECTEURS POUR LES IMAGES =====

/**
 * Sélectionner les images par examen
 */
export const selectImagesByExamen = (examenId: string) => createSelector(
  selectExamensEchographiquesState,
  (state) => state.imagesByExamen[examenId] || []
);

/**
 * Sélectionner toutes les images
 */
export const selectAllImages = createSelector(
  selectExamensEchographiquesState,
  (state) => {
    const allImages = [];
    for (const examenId in state.imagesByExamen) {
      allImages.push(...state.imagesByExamen[examenId]);
    }
    return allImages;
  }
);

/**
 * Sélectionner le nombre total d'images
 */
export const selectTotalImagesCount = createSelector(
  selectAllImages,
  (images) => images.length
);

// ===== SÉLECTEURS POUR LES ANALYSES =====

/**
 * Sélectionner les analyses de mesures par examen
 */
export const selectAnalysesMesuresByExamen = (examenId: string) => createSelector(
  selectExamensEchographiquesState,
  (state) => state.analysesMesures[examenId] || []
);

/**
 * Sélectionner les analyses avec anomalies
 */
export const selectAnalysesAvecAnomalies = createSelector(
  selectExamensEchographiquesState,
  (state) => {
    const analysesAvecAnomalies = [];
    for (const examenId in state.analysesMesures) {
      const analyses = state.analysesMesures[examenId];
      const anomalies = analyses.filter(a => a.statut === 'anormal' || a.statut === 'critique');
      if (anomalies.length > 0) {
        analysesAvecAnomalies.push({ examenId, analyses: anomalies });
      }
    }
    return analysesAvecAnomalies;
  }
);

/**
 * Sélectionner les analyses critiques
 */
export const selectAnalysesCritiques = createSelector(
  selectExamensEchographiquesState,
  (state) => {
    const analysesCritiques = [];
    for (const examenId in state.analysesMesures) {
      const analyses = state.analysesMesures[examenId];
      const critiques = analyses.filter(a => a.statut === 'critique');
      if (critiques.length > 0) {
        analysesCritiques.push({ examenId, analyses: critiques });
      }
    }
    return analysesCritiques;
  }
);

// ===== SÉLECTEURS D'ÉTAT =====

/**
 * Sélectionner l'état de chargement
 */
export const selectExamensEchographiquesLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.loading
);

/**
 * Sélectionner l'état de chargement d'un examen
 */
export const selectExamenEchographiqueLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.loadingExamen
);

/**
 * Sélectionner l'état de chargement des analyses
 */
export const selectAnalysesLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.loadingAnalyse
);

/**
 * Sélectionner l'état de chargement des images
 */
export const selectImagesLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.loadingImages
);

/**
 * Sélectionner l'état de chargement des statistiques
 */
export const selectStatistiquesLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.loadingStatistiques
);

/**
 * Sélectionner l'état de chargement de la recherche
 */
export const selectSearchLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.searchLoading
);

/**
 * Sélectionner l'état de chargement de l'export
 */
export const selectExportLoading = createSelector(
  selectExamensEchographiquesState,
  (state) => state.exportLoading
);

/**
 * Sélectionner l'erreur
 */
export const selectExamensEchographiquesError = createSelector(
  selectExamensEchographiquesState,
  (state) => state.error
);

// ===== SÉLECTEURS DE PAGINATION ET TRI =====

/**
 * Sélectionner la pagination
 */
export const selectPagination = createSelector(
  selectExamensEchographiquesState,
  (state) => state.pagination
);

/**
 * Sélectionner le tri
 */
export const selectSorting = createSelector(
  selectExamensEchographiquesState,
  (state) => state.sorting
);

/**
 * Sélectionner les filtres
 */
export const selectFilters = createSelector(
  selectExamensEchographiquesState,
  (state) => state.filters
);

// ===== SÉLECTEURS DE STATISTIQUES =====

/**
 * Sélectionner les statistiques
 */
export const selectStatistiques = createSelector(
  selectExamensEchographiquesState,
  (state) => state.statistiques
);

/**
 * Sélectionner l'URL d'export
 */
export const selectExportUrl = createSelector(
  selectExamensEchographiquesState,
  (state) => state.exportUrl
);

// ===== SÉLECTEURS COMPOSÉS =====

/**
 * Sélectionner les examens échographiques avec leurs images
 */
export const selectExamensAvecImages = createSelector(
  selectAllExamensEchographiques,
  selectExamensEchographiquesState,
  (examens, state) => {
    return examens.map(examen => ({
      ...examen,
      images: state.imagesByExamen[examen.id] || []
    }));
  }
);

/**
 * Sélectionner les examens échographiques avec leurs analyses
 */
export const selectExamensAvecAnalyses = createSelector(
  selectAllExamensEchographiques,
  selectExamensEchographiquesState,
  (examens, state) => {
    return examens.map(examen => ({
      ...examen,
      analyses: state.analysesMesures[examen.id] || []
    }));
  }
);

/**
 * Sélectionner un examen échographique par ID avec ses images et analyses
 */
export const selectExamenCompletById = (id: string) => createSelector(
  selectAllExamensEchographiques,
  selectExamensEchographiquesState,
  (examens, state) => {
    const examen = examens.find(e => e.id === id);
    if (!examen) return null;
    
    return {
      ...examen,
      images: state.imagesByExamen[id] || [],
      analyses: state.analysesMesures[id] || []
    };
  }
);

/**
 * Sélectionner les examens échographiques filtrés
 */
export const selectExamensEchographiquesFiltres = createSelector(
  selectAllExamensEchographiques,
  selectFilters,
  (examens, filters) => {
    let examensFilters = [...examens];

    // Filtrer par consultation
    if (filters.consultationId) {
      examensFilters = examensFilters.filter(e => 
        e.id === filters.consultationId // Adapter selon la structure du modèle
      );
    }

    // Filtrer par trimestre
    if (filters.trimestre) {
      // Logique de filtrage par trimestre basée sur l'âge gestationnel
      // À adapter selon la logique métier
    }

    // Filtrer par terme de recherche
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      examensFilters = examensFilters.filter(e =>
        e.observation?.toLowerCase().includes(term) ||
        e.placenta?.toLowerCase().includes(term) ||
        e.liquideAmniotique?.toLowerCase().includes(term)
      );
    }

    // Filtrer par présence d'images
    if (filters.avecImages !== undefined) {
      examensFilters = examensFilters.filter(e => {
        const hasImages = (e.images && e.images.length > 0);
        return filters.avecImages ? hasImages : !hasImages;
      });
    }

    return examensFilters;
  }
);

/**
 * Sélectionner le nombre total d'examens échographiques
 */
export const selectTotalExamensCount = createSelector(
  selectAllExamensEchographiques,
  (examens) => examens.length
);

/**
 * Sélectionner le nombre d'examens avec anomalies
 */
export const selectExamensAvecAnomaliesCount = createSelector(
  selectExamensEchographiquesAvecAnomalies,
  (examens) => examens.length
);



/**
 * Sélectionner les examens échographiques triés
 */
export const selectExamensEchographiquesTries = createSelector(
  selectAllExamensEchographiques,
  selectSorting,
  (examens, sorting) => {
    const examensTriés = [...examens];
    
    examensTriés.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sorting.sortBy) {
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'nbEmbryons':
          valueA = a.nbEmbryons;
          valueB = b.nbEmbryons;
          break;
        case 'observation':
          valueA = a.observation || '';
          valueB = b.observation || '';
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) {
        return sorting.sortDir === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sorting.sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return examensTriés;
  }
);