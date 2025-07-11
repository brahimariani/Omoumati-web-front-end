import { createReducer, on } from '@ngrx/store';
import { ExamenBiologiqueResponse } from '../../core/models/examen_biologique/examen-biologique-response.model';
import { ActeBiologiqueRequest } from '../../core/models/examen_biologique/acte_biologique/acte-biologique-request.model';
import { ActeBiologiqueResponse } from '../../core/models/examen_biologique/acte_biologique/acte-biologique-response.model';
import * as ExamensBiologiquesActions from './examens-biologiques.actions';

// ===== INTERFACE D'ÉTAT =====

export interface ExamensBiologiquesState {
  // Données principales
  examens: ExamenBiologiqueResponse[];
  selectedExamen: ExamenBiologiqueResponse | null;
  
  // Données spécialisées
  examensByConsultation: { [consultationId: string]: ExamenBiologiqueResponse[] };
  examensRecents: ExamenBiologiqueResponse[];
  examensAvecAnomalies: ExamenBiologiqueResponse[];
  examensByActeType: { [nomActe: string]: ExamenBiologiqueResponse[] };
  
  // Actes biologiques
  actesBiologiquesStandards: ActeBiologiqueRequest[];
  analysesValeurs: { 
    [examenId: string]: {
      acte: ActeBiologiqueResponse;
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
    nomActe?: string;
    dateDebut?: Date;
    dateFin?: Date;
    statutAnalyse?: 'normal' | 'anormal' | 'critique';
    searchTerm?: string;
  };
  
  // Statistiques
  statistiques: {
    total: number;
    nombreActes: number;
    nombreAnomalies: number;
    repartitionActes: { [key: string]: number };
    tendancesValeurs: { [key: string]: number[] };
  } | null;
  
  // États de l'interface
  loading: boolean;
  loadingExamen: boolean;
  loadingAnalyse: boolean;
  loadingStatistiques: boolean;
  error: string | null;
  
  // Recherche
  searchResults: ExamenBiologiqueResponse[];
  searchTerm: string;
  searchLoading: boolean;
  
  // Export
  exportLoading: boolean;
  exportUrl: string | null;
}

// ===== ÉTAT INITIAL =====

export const initialState: ExamensBiologiquesState = {
  // Données principales
  examens: [],
  selectedExamen: null,
  
  // Données spécialisées
  examensByConsultation: {},
  examensRecents: [],
  examensAvecAnomalies: [],
  examensByActeType: {},
  
  // Actes biologiques
  actesBiologiquesStandards: [],
  analysesValeurs: {},
  
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

export const examensBiologiquesReducer = createReducer(
  initialState,

  // ===== ACTIONS CRUD DE BASE =====

  // Charger tous les examens biologiques
  on(ExamensBiologiquesActions.loadExamensBiologiques, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensBiologiquesSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    examens: response.data || [],
    
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensBiologiquesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger un examen biologique par ID
  on(ExamensBiologiquesActions.loadExamenBiologique, (state) => ({
    ...state,
    loadingExamen: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamenBiologiqueSuccess, (state, { examen }) => ({
    ...state,
    loadingExamen: false,
    selectedExamen: examen,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamenBiologiqueFailure, (state, { error }) => ({
    ...state,
    loadingExamen: false,
    error
  })),

  // Créer un examen biologique
  on(ExamensBiologiquesActions.createExamenBiologique, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.createExamenBiologiqueSuccess, (state, { examen }) => ({
    ...state,
    loading: false,
    examens: [examen, ...state.examens],
    selectedExamen: examen,
    error: null
  })),

  on(ExamensBiologiquesActions.createExamenBiologiqueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Mettre à jour un examen biologique
  on(ExamensBiologiquesActions.updateExamenBiologique, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.updateExamenBiologiqueSuccess, (state, { examen }) => ({
    ...state,
    loading: false,
    examens: state.examens.map(e => e.id === examen.id ? examen : e),
    selectedExamen: state.selectedExamen?.id === examen.id ? examen : state.selectedExamen,
    error: null
  })),

  on(ExamensBiologiquesActions.updateExamenBiologiqueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Supprimer un examen biologique
  on(ExamensBiologiquesActions.deleteExamenBiologique, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.deleteExamenBiologiqueSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    examens: state.examens.filter(e => e.id !== id),
    selectedExamen: state.selectedExamen?.id === id ? null : state.selectedExamen,
    error: null
  })),

  on(ExamensBiologiquesActions.deleteExamenBiologiqueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== ACTIONS DE RECHERCHE SPÉCIALISÉES =====

  // Charger les examens par consultation
  on(ExamensBiologiquesActions.loadExamensByConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensByConsultationSuccess, (state, { examens, consultationId }) => ({
    ...state,
    loading: false,
    examensByConsultation: {
      ...state.examensByConsultation,
      [consultationId]: examens
    },
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensByConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger les examens récents
  on(ExamensBiologiquesActions.loadExamensRecents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensRecentsSuccess, (state, { examens }) => ({
    ...state,
    loading: false,
    examensRecents: examens,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensRecentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger les examens par type d'acte
  on(ExamensBiologiquesActions.loadExamensByActeType, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensByActeTypeSuccess, (state, { examens, nomActe }) => ({
    ...state,
    loading: false,
    examensByActeType: {
      ...state.examensByActeType,
      [nomActe]: examens
    },
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensByActeTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Charger les examens avec anomalies
  on(ExamensBiologiquesActions.loadExamensAvecAnomalies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensAvecAnomaliesSuccess, (state, { examens }) => ({
    ...state,
    loading: false,
    examensAvecAnomalies: examens,
    error: null
  })),

  on(ExamensBiologiquesActions.loadExamensAvecAnomaliesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Rechercher des examens
  on(ExamensBiologiquesActions.searchExamens, (state, { searchTerm }) => ({
    ...state,
    searchLoading: true,
    searchTerm,
    error: null
  })),

  on(ExamensBiologiquesActions.searchExamensSuccess, (state, { response }) => ({
    ...state,
    searchLoading: false,
    searchResults: response.data || [],
    error: null
  })),

  on(ExamensBiologiquesActions.searchExamensFailure, (state, { error }) => ({
    ...state,
    searchLoading: false,
    error
  })),

  // ===== ACTIONS SPÉCIALISÉES POUR LES ACTES BIOLOGIQUES =====

  // Charger les actes biologiques standards
  on(ExamensBiologiquesActions.loadActesBiologiquesStandards, (state) => state),

  on(ExamensBiologiquesActions.loadActesBiologiquesStandardsSuccess, (state, { actes }) => ({
    ...state,
    actesBiologiquesStandards: actes
  })),

  // Analyser les valeurs biologiques
  on(ExamensBiologiquesActions.analyserValeursBiologiques, (state) => ({
    ...state,
    loadingAnalyse: true,
    error: null
  })),

  on(ExamensBiologiquesActions.analyserValeursBiologiquesSuccess, (state, { examenId, analyses }) => ({
    ...state,
    loadingAnalyse: false,
    analysesValeurs: {
      ...state.analysesValeurs,
      [examenId]: analyses
    },
    error: null
  })),

  on(ExamensBiologiquesActions.analyserValeursBiologiquesFailure, (state, { error }) => ({
    ...state,
    loadingAnalyse: false,
    error
  })),

  // ===== ACTIONS DE GESTION D'ÉTAT =====

  // Sélectionner un examen
  on(ExamensBiologiquesActions.selectExamen, (state, { id }) => ({
    ...state,
    selectedExamen: state.examens.find(e => e.id === id) || null
  })),

  // Désélectionner l'examen
  on(ExamensBiologiquesActions.deselectExamen, (state) => ({
    ...state,
    selectedExamen: null
  })),

  // Définir les filtres
  on(ExamensBiologiquesActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  // Réinitialiser les filtres
  on(ExamensBiologiquesActions.resetFilters, (state) => ({
    ...state,
    filters: {}
  })),

  // Définir la pagination
  on(ExamensBiologiquesActions.setPagination, (state, { page, size }) => ({
    ...state,
    pagination: { ...state.pagination, page, size }
  })),

  // Définir le tri
  on(ExamensBiologiquesActions.setSorting, (state, { sortBy, sortDir }) => ({
    ...state,
    sorting: { sortBy, sortDir }
  })),

  // ===== ACTIONS DE STATISTIQUES =====

  // Charger les statistiques
  on(ExamensBiologiquesActions.loadStatistiques, (state) => ({
    ...state,
    loadingStatistiques: true,
    error: null
  })),

  on(ExamensBiologiquesActions.loadStatistiquesSuccess, (state, { statistiques }) => ({
    ...state,
    loadingStatistiques: false,
    statistiques,
    error: null
  })),

  on(ExamensBiologiquesActions.loadStatistiquesFailure, (state, { error }) => ({
    ...state,
    loadingStatistiques: false,
    error
  })),

  // ===== ACTIONS UTILITAIRES =====

  // Vider le cache
  on(ExamensBiologiquesActions.clearCache, (state) => ({
    ...state,
    examens: [],
    examensByConsultation: {},
    examensRecents: [],
    examensAvecAnomalies: [],
    examensByActeType: {},
    analysesValeurs: {},
    searchResults: [],
    selectedExamen: null
  })),

  // Actualiser le cache pour une consultation
  on(ExamensBiologiquesActions.refreshCacheForConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.refreshCacheForConsultationSuccess, (state, { examens, consultationId }) => ({
    ...state,
    loading: false,
    examensByConsultation: {
      ...state.examensByConsultation,
      [consultationId]: examens
    },
    error: null
  })),

  on(ExamensBiologiquesActions.refreshCacheForConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Réinitialiser l'erreur
  on(ExamensBiologiquesActions.resetError, (state) => ({
    ...state,
    error: null
  })),

  // Réinitialiser le chargement
  on(ExamensBiologiquesActions.resetLoading, (state) => ({
    ...state,
    loading: false,
    loadingExamen: false,
    loadingAnalyse: false,
    loadingStatistiques: false,
    searchLoading: false,
    exportLoading: false
  })),

  // Export des examens
  on(ExamensBiologiquesActions.exportExamens, (state) => ({
    ...state,
    exportLoading: true,
    error: null
  })),

  on(ExamensBiologiquesActions.exportExamensSuccess, (state, { fileUrl }) => ({
    ...state,
    exportLoading: false,
    exportUrl: fileUrl,
    error: null
  })),

  on(ExamensBiologiquesActions.exportExamensFailure, (state, { error }) => ({
    ...state,
    exportLoading: false,
    error
  }))
); 