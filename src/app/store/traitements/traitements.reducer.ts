import { createReducer, on } from '@ngrx/store';
import { TraitementResponse } from '../../core/models/traitement/traitement-response.model';
import { PageResponse } from '../../core/models/api-response.model';
import * as TraitementsActions from './traitements.actions';

/**
 * Interface pour l'état des traitements
 */
export interface TraitementsState {
  traitements: TraitementResponse[];
  selectedTraitement: TraitementResponse | null;
  selectedTraitementId: string | null;
  traitementsByConsultation: TraitementResponse[];
  traitementsActifs: TraitementResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  searchTerm: string | null;
  filters: {
    consultationId?: string;
    medicament?: string;
    posologie?: string;
    observation?: string;
    dateDebut?: Date;
    dateFin?: Date;
    status?: 'actif' | 'termine' | 'tous';
  };
  stats: {
    totalTraitements: number;
    traitementsActifs: number;
    traitementsTermines: number;
    medicamentsUniques: number;
    traitementParMedicament: { medicament: string; nombre: number; }[];
  } | null;
  interactions: {
    hasInteractions: boolean;
    interactions: {
      medicament1: string;
      medicament2: string;
      severite: 'faible' | 'modere' | 'severe';
      description: string;
    }[];
  } | null;
  suggestions: {
    medicament: string;
    posologie: string;
    duree: string;
    indication: string;
  }[];
  posologieValidation: {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } | null;
  exportData: {
    pdfBlob?: Blob;
    excelBlob?: Blob;
  };
}

/**
 * État initial pour le reducer des traitements
 */
export const initialState: TraitementsState = {
  traitements: [],
  selectedTraitement: null,
  selectedTraitementId: null,
  traitementsByConsultation: [],
  traitementsActifs: [],
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  },
  searchTerm: null,
  filters: {},
  stats: null,
  interactions: null,
  suggestions: [],
  posologieValidation: null,
  exportData: {}
};

/**
 * Reducer pour gérer les actions concernant les traitements
 */
export const traitementsReducer = createReducer(
  initialState,
  
  // Chargement de tous les traitements
  on(TraitementsActions.loadTraitements, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(TraitementsActions.loadTraitementsSuccess, (state, { data }) => {
    const traitementsList = Array.isArray(data.content) ? data.content : 
                           Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      traitements: traitementsList,
      loading: false,
      pagination: {
        totalElements,
        totalPages,
        currentPage,
        pageSize
      },
      error: null
    };
  }),
  
  on(TraitementsActions.loadTraitementsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'un traitement spécifique
  on(TraitementsActions.loadTraitement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.loadTraitementSuccess, (state, { data }) => ({
    ...state,
    selectedTraitement: data,
    selectedTraitementId: data.id,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.loadTraitementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des traitements par consultation
  on(TraitementsActions.loadTraitementsByConsultation, (state, { consultationId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      consultationId
    }
  })),
  
  on(TraitementsActions.loadTraitementsByConsultationSuccess, (state, { data }) => ({
    ...state,
    traitementsByConsultation: data,
    traitements: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.loadTraitementsByConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des traitements actifs
  on(TraitementsActions.loadTraitementsActifs, (state, { consultationId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      consultationId
    }
  })),
  
  on(TraitementsActions.loadTraitementsActifsSuccess, (state, { data }) => ({
    ...state,
    traitementsActifs: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.loadTraitementsActifsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'un traitement
  on(TraitementsActions.createTraitement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.createTraitementSuccess, (state, { data }) => ({
    ...state,
    traitements: [data, ...state.traitements],
    traitementsByConsultation: data.consultation.id === state.filters.consultationId 
      ? [data, ...state.traitementsByConsultation] 
      : state.traitementsByConsultation,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.createTraitementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'un traitement
  on(TraitementsActions.updateTraitement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.updateTraitementSuccess, (state, { data }) => {
    const updateTraitementInList = (list: TraitementResponse[]) =>
      list.map(traitement => traitement.id === data.id ? data : traitement);
    
    return {
      ...state,
      traitements: updateTraitementInList(state.traitements),
      traitementsByConsultation: updateTraitementInList(state.traitementsByConsultation),
      traitementsActifs: updateTraitementInList(state.traitementsActifs),
      selectedTraitement: state.selectedTraitement?.id === data.id ? data : state.selectedTraitement,
      loading: false,
      error: null
    };
  }),
  
  on(TraitementsActions.updateTraitementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'un traitement
  on(TraitementsActions.deleteTraitement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.deleteTraitementSuccess, (state, { id }) => {
    const filterTraitementFromList = (list: TraitementResponse[]) =>
      list.filter(traitement => traitement.id !== id);
    
    return {
      ...state,
      traitements: filterTraitementFromList(state.traitements),
      traitementsByConsultation: filterTraitementFromList(state.traitementsByConsultation),
      traitementsActifs: filterTraitementFromList(state.traitementsActifs),
      selectedTraitement: state.selectedTraitement?.id === id ? null : state.selectedTraitement,
      selectedTraitementId: state.selectedTraitementId === id ? null : state.selectedTraitementId,
      loading: false,
      error: null
    };
  }),
  
  on(TraitementsActions.deleteTraitementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Statistiques des traitements
  on(TraitementsActions.loadTraitementStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.loadTraitementStatsSuccess, (state, { data }) => ({
    ...state,
    stats: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.loadTraitementStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Interactions médicamenteuses
  on(TraitementsActions.checkInteractions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.checkInteractionsSuccess, (state, { data }) => ({
    ...state,
    interactions: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.checkInteractionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suggestions de traitements
  on(TraitementsActions.getTreatmentSuggestions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.getTreatmentSuggestionsSuccess, (state, { data }) => ({
    ...state,
    suggestions: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.getTreatmentSuggestionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Validation de posologie
  on(TraitementsActions.validatePosologie, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.validatePosologieSuccess, (state, { data }) => ({
    ...state,
    posologieValidation: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.validatePosologieFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par dates
  on(TraitementsActions.filterByDateRange, (state, { startDate, endDate }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      dateDebut: startDate,
      dateFin: endDate
    }
  })),
  
  on(TraitementsActions.filterByDateRangeSuccess, (state, { data }) => ({
    ...state,
    traitements: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.filterByDateRangeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par médicament
  on(TraitementsActions.filterByMedicament, (state, { medicament }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      medicament
    }
  })),
  
  on(TraitementsActions.filterByMedicamentSuccess, (state, { data }) => ({
    ...state,
    traitements: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.filterByMedicamentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par statut
  on(TraitementsActions.filterByStatus, (state, { status }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      status
    }
  })),
  
  on(TraitementsActions.filterByStatusSuccess, (state, { data }) => ({
    ...state,
    traitements: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.filterByStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Export de traitements
  on(TraitementsActions.exportTraitementsPdf, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.exportTraitementsPdfSuccess, (state, { blob }) => ({
    ...state,
    exportData: {
      ...state.exportData,
      pdfBlob: blob
    },
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.exportTraitementsPdfFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TraitementsActions.exportTraitementsExcel, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TraitementsActions.exportTraitementsExcelSuccess, (state, { blob }) => ({
    ...state,
    exportData: {
      ...state.exportData,
      excelBlob: blob
    },
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.exportTraitementsExcelFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Rafraîchir traitements pour une consultation
  on(TraitementsActions.refreshTraitementsForConsultation, (state, { consultationId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      consultationId
    }
  })),
  
  on(TraitementsActions.refreshTraitementsForConsultationSuccess, (state, { data }) => ({
    ...state,
    traitementsByConsultation: data,
    loading: false,
    error: null
  })),
  
  on(TraitementsActions.refreshTraitementsForConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Sélection d'un traitement
  on(TraitementsActions.selectTraitement, (state, { id }) => ({
    ...state,
    selectedTraitementId: id,
    selectedTraitement: id ? state.traitements.find(t => t.id === id) || null : null
  })),
  
  // Réinitialisation du cache
  on(TraitementsActions.clearCache, (state) => ({
    ...state,
    traitements: [],
    traitementsByConsultation: [],
    traitementsActifs: [],
    selectedTraitement: null,
    selectedTraitementId: null,
    error: null,
    pagination: {
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10
    }
  })),
  
  // Réinitialisation de l'état
  on(TraitementsActions.resetTraitementsState, (state) => ({
    ...initialState
  }))
); 