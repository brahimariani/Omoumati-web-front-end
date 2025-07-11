import { createReducer, on } from '@ngrx/store';
import { ExamenEchographiqueResponse } from '../../core/models/examen_echographique/examen-echographique-response.model';
import { ImageEchographiqueResponse } from '../../core/models/examen_echographique/image_echographique/image-echographique-response.model';
import * as ExamensEchographiquesActions from './examens-echographiques.actions';

// ===== INTERFACE D'ÉTAT =====

export interface ExamensEchographiquesState {
  // Données principales
  examens: ExamenEchographiqueResponse[];
  selectedExamen: ExamenEchographiqueResponse | null;
  
  // Données spécialisées
  examensByConsultation: { [consultationId: string]: ExamenEchographiqueResponse[] };
  examensRecents: ExamenEchographiqueResponse[];
  examensAvecAnomalies: ExamenEchographiqueResponse[];
  examensByTrimestre: { [trimestre: string]: ExamenEchographiqueResponse[] };
  
  // Images échographiques
  imagesByExamen: { [examenId: string]: ImageEchographiqueResponse[] };
  
  // Analyses des mesures
  analysesMesures: { 
    [examenId: string]: {
      mesure: string;
      valeur: string | number;
      statut: 'normal' | 'anormal' | 'critique';
      interpretation: string;
    }[]
  };
  
  // Pagination et tri
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  
  sorting: {
    sortBy: string;
    sortDir: 'asc' | 'desc';
  };
  
  // Filtres
  filters: {
    consultationId?: string;
    trimestre?: 1 | 2 | 3;
    dateDebut?: Date;
    dateFin?: Date;
    statutAnalyse?: 'normal' | 'anormal' | 'critique';
    searchTerm?: string;
    avecImages?: boolean;
    typeExamen?: string;
  };
  
  // Statistiques
  statistiques: {
    total: number;
    nombreImages: number;
    nombreAnomalies: number;
    repartitionTrimestres: { [key: string]: number };
    mesuresMoyennes: { [key: string]: number };
  } | null;
  
  // États de l'interface
  loading: boolean;
  loadingExamen: boolean;
  loadingAnalyse: boolean;
  loadingImages: boolean;
  loadingStatistiques: boolean;
  error: string | null;
  
  // Recherche
  searchResults: ExamenEchographiqueResponse[];
  searchTerm: string;
  searchLoading: boolean;
  
  // Export
  exportLoading: boolean;
  exportUrl: string | null;
}

// ===== ÉTAT INITIAL =====

export const initialState: ExamensEchographiquesState = {
  // Données principales
  examens: [],
  selectedExamen: null,
  
  // Données spécialisées
  examensByConsultation: {},
  examensRecents: [],
  examensAvecAnomalies: [],
  examensByTrimestre: {},
  
  // Images échographiques
  imagesByExamen: {},
  
  // Analyses des mesures
  analysesMesures: {},
  
  // Pagination et tri
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  },
  
  sorting: {
    sortBy: 'id',
    sortDir: 'desc'
  },
  
  // Filtres
  filters: {},
  
  // Statistiques
  statistiques: null,
  
  // États de l'interface
  loading: false,
  loadingExamen: false,
  loadingAnalyse: false,
  loadingImages: false,
  loadingStatistiques: false,
  error: null,
  
  // Recherche
  searchResults: [],
  searchTerm: '',
  searchLoading: false,
  
  // Export
  exportLoading: false,
  exportUrl: null
};

// ===== REDUCER =====

export const examensEchographiquesReducer = createReducer(
  initialState,

  // ===== ACTIONS CRUD DE BASE =====

  // Charger tous les examens échographiques
  on(ExamensEchographiquesActions.loadExamensEchographiques, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensEchographiquesSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    examens: response.data || [],
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensEchographiquesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger un examen échographique par ID
  on(ExamensEchographiquesActions.loadExamenEchographique, (state) => ({
    ...state,
    loadingExamen: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamenEchographiqueSuccess, (state, { examen }) => ({
    ...state,
    loadingExamen: false,
    selectedExamen: examen,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamenEchographiqueFailure, (state, { error }) => ({
    ...state,
    loadingExamen: false,
    error
  })),

  // Créer un examen échographique
  on(ExamensEchographiquesActions.createExamenEchographique, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.createExamenEchographiqueSuccess, (state, { examen }) => ({
    ...state,
    loading: false,
    examens: [examen, ...state.examens],
    selectedExamen: examen,
    error: null
  })),

  on(ExamensEchographiquesActions.createExamenEchographiqueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Mettre à jour un examen échographique
  on(ExamensEchographiquesActions.updateExamenEchographique, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.updateExamenEchographiqueSuccess, (state, { examen }) => ({
    ...state,
    loading: false,
    examens: state.examens.map(e => e.id === examen.id ? examen : e),
    selectedExamen: state.selectedExamen?.id === examen.id ? examen : state.selectedExamen,
    error: null
  })),

  on(ExamensEchographiquesActions.updateExamenEchographiqueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Supprimer un examen échographique
  on(ExamensEchographiquesActions.deleteExamenEchographique, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.deleteExamenEchographiqueSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    examens: state.examens.filter(e => e.id !== id),
    selectedExamen: state.selectedExamen?.id === id ? null : state.selectedExamen,
    // Supprimer aussi les images associées
    imagesByExamen: Object.keys(state.imagesByExamen).reduce((acc, key) => {
      if (key !== id) {
        acc[key] = state.imagesByExamen[key];
      }
      return acc;
    }, {} as { [key: string]: ImageEchographiqueResponse[] }),
    error: null
  })),

  on(ExamensEchographiquesActions.deleteExamenEchographiqueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== ACTIONS DE RECHERCHE SPÉCIALISÉES =====

  // Charger les examens par consultation
  on(ExamensEchographiquesActions.loadExamensByConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensByConsultationSuccess, (state, { examens, consultationId }) => {
    console.log('📦 Reducer: Stockage des examens échographiques pour consultationId:', consultationId, 'Nombre d\'examens:', examens.length);
    return {
      ...state,
      loading: false,
      examensByConsultation: {
        ...state.examensByConsultation,
        [consultationId]: examens
      },
      error: null
    };
  }),

  on(ExamensEchographiquesActions.loadExamensByConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger les examens récents
  on(ExamensEchographiquesActions.loadExamensRecents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensRecentsSuccess, (state, { examens }) => ({
    ...state,
    loading: false,
    examensRecents: examens,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensRecentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger les examens par trimestre
  on(ExamensEchographiquesActions.loadExamensByTrimestre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensByTrimestreSuccess, (state, { examens, trimestre }) => ({
    ...state,
    loading: false,
    examensByTrimestre: {
      ...state.examensByTrimestre,
      [trimestre]: examens
    },
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensByTrimestreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger les examens avec anomalies
  on(ExamensEchographiquesActions.loadExamensAvecAnomalies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensAvecAnomaliesSuccess, (state, { examens }) => ({
    ...state,
    loading: false,
    examensAvecAnomalies: examens,
    error: null
  })),

  on(ExamensEchographiquesActions.loadExamensAvecAnomaliesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Rechercher des examens
  on(ExamensEchographiquesActions.searchExamens, (state, { searchTerm }) => ({
    ...state,
    searchLoading: true,
    searchTerm,
    error: null
  })),

  on(ExamensEchographiquesActions.searchExamensSuccess, (state, { response }) => ({
    ...state,
    searchLoading: false,
    searchResults: response.data || [],
    error: null
  })),

  on(ExamensEchographiquesActions.searchExamensFailure, (state, { error }) => ({
    ...state,
    searchLoading: false,
    error
  })),

  // ===== ACTIONS SPÉCIALISÉES POUR LES MESURES ÉCHOGRAPHIQUES =====

  // Analyser les mesures échographiques
  on(ExamensEchographiquesActions.analyserMesuresEchographiques, (state) => ({
    ...state,
    loadingAnalyse: true,
    error: null
  })),

  on(ExamensEchographiquesActions.analyserMesuresEchographiquesSuccess, (state, { examenId, analyses }) => ({
    ...state,
    loadingAnalyse: false,
    analysesMesures: {
      ...state.analysesMesures,
      [examenId]: analyses
    },
    error: null
  })),

  on(ExamensEchographiquesActions.analyserMesuresEchographiquesFailure, (state, { error }) => ({
    ...state,
    loadingAnalyse: false,
    error
  })),

  // ===== ACTIONS POUR LA GESTION DES IMAGES =====

  // Charger les images d'un examen
  on(ExamensEchographiquesActions.loadImagesExamen, (state) => ({
    ...state,
    loadingImages: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadImagesExamenSuccess, (state, { examenId, images }) => ({
    ...state,
    loadingImages: false,
    imagesByExamen: {
      ...state.imagesByExamen,
      [examenId]: images
    },
    error: null
  })),

  on(ExamensEchographiquesActions.loadImagesExamenFailure, (state, { error }) => ({
    ...state,
    loadingImages: false,
    error
  })),

  // Ajouter une image
  on(ExamensEchographiquesActions.ajouterImage, (state) => ({
    ...state,
    loadingImages: true,
    error: null
  })),

  on(ExamensEchographiquesActions.ajouterImageSuccess, (state, { examenId, image }) => ({
    ...state,
    loadingImages: false,
    imagesByExamen: {
      ...state.imagesByExamen,
      [examenId]: [...(state.imagesByExamen[examenId] || []), image]
    },
    error: null
  })),

  on(ExamensEchographiquesActions.ajouterImageFailure, (state, { error }) => ({
    ...state,
    loadingImages: false,
    error
  })),

  // Supprimer une image
  on(ExamensEchographiquesActions.supprimerImage, (state) => ({
    ...state,
    loadingImages: true,
    error: null
  })),

  on(ExamensEchographiquesActions.supprimerImageSuccess, (state, { examenId, imageId }) => ({
    ...state,
    loadingImages: false,
    imagesByExamen: {
      ...state.imagesByExamen,
      [examenId]: (state.imagesByExamen[examenId] || []).filter(img => img.id !== imageId)
    },
    error: null
  })),

  on(ExamensEchographiquesActions.supprimerImageFailure, (state, { error }) => ({
    ...state,
    loadingImages: false,
    error
  })),

  // Upload d'une image
  on(ExamensEchographiquesActions.uploadImage, (state) => ({
    ...state,
    loadingImages: true,
    error: null
  })),

  on(ExamensEchographiquesActions.uploadImageSuccess, (state, { examenId, image }) => ({
    ...state,
    loadingImages: false,
    imagesByExamen: {
      ...state.imagesByExamen,
      [examenId]: [...(state.imagesByExamen[examenId] || []), image]
    },
    error: null
  })),

  on(ExamensEchographiquesActions.uploadImageFailure, (state, { error }) => ({
    ...state,
    loadingImages: false,
    error
  })),

  // ===== ACTIONS DE GESTION D'ÉTAT =====

  // Sélectionner un examen
  on(ExamensEchographiquesActions.selectExamen, (state, { id }) => ({
    ...state,
    selectedExamen: state.examens.find(e => e.id === id) || null
  })),

  // Désélectionner l'examen
  on(ExamensEchographiquesActions.deselectExamen, (state) => ({
    ...state,
    selectedExamen: null
  })),

  // Définir les filtres
  on(ExamensEchographiquesActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  // Réinitialiser les filtres
  on(ExamensEchographiquesActions.resetFilters, (state) => ({
    ...state,
    filters: {}
  })),

  // Définir la pagination
  on(ExamensEchographiquesActions.setPagination, (state, { page, size }) => ({
    ...state,
    pagination: { ...state.pagination, page, size }
  })),

  // Définir le tri
  on(ExamensEchographiquesActions.setSorting, (state, { sortBy, sortDir }) => ({
    ...state,
    sorting: { sortBy, sortDir }
  })),

  // ===== ACTIONS DE STATISTIQUES =====

  // Charger les statistiques
  on(ExamensEchographiquesActions.loadStatistiques, (state) => ({
    ...state,
    loadingStatistiques: true,
    error: null
  })),

  on(ExamensEchographiquesActions.loadStatistiquesSuccess, (state, { statistiques }) => ({
    ...state,
    loadingStatistiques: false,
    statistiques,
    error: null
  })),

  on(ExamensEchographiquesActions.loadStatistiquesFailure, (state, { error }) => ({
    ...state,
    loadingStatistiques: false,
    error
  })),

  // ===== ACTIONS UTILITAIRES =====

  // Vider le cache
  on(ExamensEchographiquesActions.clearCache, (state) => ({
    ...state,
    examens: [],
    examensByConsultation: {},
    examensRecents: [],
    examensAvecAnomalies: [],
    examensByTrimestre: {},
    imagesByExamen: {},
    analysesMesures: {},
    searchResults: [],
    selectedExamen: null
  })),

  // Actualiser le cache pour une consultation
  on(ExamensEchographiquesActions.refreshCacheForConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.refreshCacheForConsultationSuccess, (state, { examens, consultationId }) => ({
    ...state,
    loading: false,
    examensByConsultation: {
      ...state.examensByConsultation,
      [consultationId]: examens
    },
    error: null
  })),

  on(ExamensEchographiquesActions.refreshCacheForConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Réinitialiser l'erreur
  on(ExamensEchographiquesActions.resetError, (state) => ({
    ...state,
    error: null
  })),

  // Réinitialiser le chargement
  on(ExamensEchographiquesActions.resetLoading, (state) => ({
    ...state,
    loading: false,
    loadingExamen: false,
    loadingAnalyse: false,
    loadingImages: false,
    loadingStatistiques: false,
    searchLoading: false,
    exportLoading: false
  })),

  // Export des examens
  on(ExamensEchographiquesActions.exportExamens, (state) => ({
    ...state,
    exportLoading: true,
    error: null
  })),

  on(ExamensEchographiquesActions.exportExamensSuccess, (state, { fileUrl }) => ({
    ...state,
    exportLoading: false,
    exportUrl: fileUrl,
    error: null
  })),

  on(ExamensEchographiquesActions.exportExamensFailure, (state, { error }) => ({
    ...state,
    exportLoading: false,
    error
  }))
);