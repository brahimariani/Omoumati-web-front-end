import { createReducer, on } from '@ngrx/store';
import { ConsultationsActions } from './consultations.actions';
import { ConsultationResponse } from '../../core/models/consultation/consultation-response.model';

/**
 * Interface pour l'état des consultations
 */
export interface ConsultationsState {
  consultations: ConsultationResponse[];
  selectedConsultation: ConsultationResponse | null;
  selectedConsultationId: string | null;
  consultationsByGrossesse: ConsultationResponse[];
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
    grossesseId?: string;
    dateDebut?: Date;
    dateFin?: Date;
    observation?: string;
  };
  stats: {
    totalConsultations: number;
    consultationsParMois: { mois: string; nombre: number; }[];
    derniereConsultation?: ConsultationResponse;
    prochaineConsultationPrevue?: Date;
  } | null;
  consultationDue: {
    isDue: boolean;
    daysSinceLastConsultation: number;
    recommendedDate: Date;
    lastConsultation?: ConsultationResponse;
  } | null;
  templates: {
    id: string;
    nom: string;
    observation: string;
    typeConsultation: 'routine' | 'urgence' | 'controle';
  }[];
  exportData: {
    pdfBlob?: Blob;
    excelBlob?: Blob;
  };
}

/**
 * État initial pour le reducer des consultations
 */
export const initialState: ConsultationsState = {
  consultations: [],
  selectedConsultation: null,
  selectedConsultationId: null,
  consultationsByGrossesse: [],
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
  consultationDue: null,
  templates: [],
  exportData: {}
};

/**
 * Reducer pour gérer les actions concernant les consultations
 */
export const consultationsReducer = createReducer(
  initialState,
  
  // Chargement de toutes les consultations
  on(ConsultationsActions.loadConsultations, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(ConsultationsActions.loadConsultationsSuccess, (state, { data }) => {
    const consultationsList = Array.isArray(data.content) ? data.content : 
                             Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      consultations: consultationsList,
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
  
  on(ConsultationsActions.loadConsultationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'une consultation spécifique
  on(ConsultationsActions.loadConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationSuccess, (state, { data }) => ({
    ...state,
    selectedConsultation: data,
    selectedConsultationId: data.id,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des consultations par grossesse
  on(ConsultationsActions.loadConsultationsByGrossesse, (state, { grossesseId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      grossesseId
    }
  })),
  
  on(ConsultationsActions.loadConsultationsByGrossesseSuccess, (state, { data }) => ({
    ...state,
    consultationsByGrossesse: data,
    consultations: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationsByGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche de consultations
  on(ConsultationsActions.searchConsultations, (state, { grossesseId, dateDebut, dateFin, observation, page, size }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      grossesseId,
      dateDebut,
      dateFin,
      observation
    },
    pagination: {
      ...state.pagination,
      currentPage: page || 0,
      pageSize: size || 10
    }
  })),
  
  on(ConsultationsActions.searchConsultationsSuccess, (state, { data }) => {
    const consultationsList = Array.isArray(data.content) ? data.content : 
                             Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      consultations: consultationsList,
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
  
  on(ConsultationsActions.searchConsultationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'une consultation
  on(ConsultationsActions.createConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.createConsultationSuccess, (state, { data }) => ({
    ...state,
    consultations: [...state.consultations, data],
    selectedConsultation: data,
    selectedConsultationId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1
    },
    error: null
  })),
  
  on(ConsultationsActions.createConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'une consultation
  on(ConsultationsActions.updateConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.updateConsultationSuccess, (state, { data }) => ({
    ...state,
    consultations: state.consultations.map(consultation => 
      consultation.id === data.id ? data : consultation
    ),
    consultationsByGrossesse: state.consultationsByGrossesse.map(consultation => 
      consultation.id === data.id ? data : consultation
    ),
    selectedConsultation: state.selectedConsultationId === data.id ? data : state.selectedConsultation,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.updateConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'une consultation
  on(ConsultationsActions.deleteConsultation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.deleteConsultationSuccess, (state, { id }) => ({
    ...state,
    consultations: state.consultations.filter(consultation => consultation.id !== id),
    consultationsByGrossesse: state.consultationsByGrossesse.filter(consultation => consultation.id !== id),
    selectedConsultation: state.selectedConsultationId === id ? null : state.selectedConsultation,
    selectedConsultationId: state.selectedConsultationId === id ? null : state.selectedConsultationId,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: Math.max(0, state.pagination.totalElements - 1),
      totalPages: Math.ceil(Math.max(0, state.pagination.totalElements - 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(ConsultationsActions.deleteConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Statistiques des consultations
  on(ConsultationsActions.loadConsultationStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationStatsSuccess, (state, { data }) => ({
    ...state,
    stats: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Vérification des consultations dues
  on(ConsultationsActions.checkConsultationDue, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.checkConsultationDueSuccess, (state, { data }) => ({
    ...state,
    consultationDue: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.checkConsultationDueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Modèles de consultation
  on(ConsultationsActions.loadConsultationTemplates, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationTemplatesSuccess, (state, { data }) => ({
    ...state,
    templates: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.loadConsultationTemplatesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Créer consultation depuis modèle
  on(ConsultationsActions.createConsultationFromTemplate, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.createConsultationFromTemplateSuccess, (state, { data }) => ({
    ...state,
    consultations: [...state.consultations, data],
    selectedConsultation: data,
    selectedConsultationId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1
    },
    error: null
  })),
  
  on(ConsultationsActions.createConsultationFromTemplateFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Export PDF
  on(ConsultationsActions.exportConsultationsPdf, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.exportConsultationsPdfSuccess, (state, { blob }) => ({
    ...state,
    exportData: {
      ...state.exportData,
      pdfBlob: blob
    },
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.exportConsultationsPdfFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Export Excel
  on(ConsultationsActions.exportConsultationsExcel, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.exportConsultationsExcelSuccess, (state, { blob }) => ({
    ...state,
    exportData: {
      ...state.exportData,
      excelBlob: blob
    },
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.exportConsultationsExcelFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par date
  on(ConsultationsActions.filterByDateRange, (state, { startDate, endDate }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      dateDebut: startDate,
      dateFin: endDate
    }
  })),
  
  on(ConsultationsActions.filterByDateRangeSuccess, (state, { data }) => ({
    ...state,
    consultations: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.filterByDateRangeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par observation
  on(ConsultationsActions.filterByObservation, (state, { observation }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      observation
    }
  })),
  
  on(ConsultationsActions.filterByObservationSuccess, (state, { data }) => ({
    ...state,
    consultations: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.filterByObservationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation du cache
  on(ConsultationsActions.clearCache, (state) => ({
    ...state,
    consultations: [],
    consultationsByGrossesse: [],
    selectedConsultation: null,
    selectedConsultationId: null
  })),
  
  // Rafraîchir consultations pour une grossesse
  on(ConsultationsActions.refreshConsultationsForGrossesse, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConsultationsActions.refreshConsultationsForGrossesseSuccess, (state, { data }) => ({
    ...state,
    consultationsByGrossesse: data,
    loading: false,
    error: null
  })),
  
  on(ConsultationsActions.refreshConsultationsForGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation de l'état
  on(ConsultationsActions.resetConsultationsState, () => initialState),
  
  // Sélection d'une consultation
  on(ConsultationsActions.selectConsultation, (state, { id }) => ({
    ...state,
    selectedConsultationId: id,
    selectedConsultation: id ? state.consultations.find(c => c.id === id) || null : null
  }))
); 