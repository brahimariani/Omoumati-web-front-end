import { createReducer, on } from '@ngrx/store';
import { AccouchementsActions } from './accouchements.actions';
import { AccouchementResponse } from '../../core/models/accouchement/accouchement-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des accouchements
 */
export interface AccouchementsState {
  accouchements: AccouchementResponse[];
  selectedAccouchement: AccouchementResponse | null;
  selectedAccouchementId: string | null;
  accouchementsByPatient: AccouchementResponse[];
  accouchementsByGrossesse: AccouchementResponse[];
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
    modaliteExtraction?: string;
    assisstanceQualifiee?: boolean;
    startDate?: Date;
    endDate?: Date;
    patientId?: string;
    grossesseId?: string;
  };
}

/**
 * État initial pour le reducer des accouchements
 */
export const initialState: AccouchementsState = {
  accouchements: [],
  selectedAccouchement: null,
  selectedAccouchementId: null,
  accouchementsByPatient: [],
  accouchementsByGrossesse: [],
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  },
  searchTerm: null,
  filters: {}
};

/**
 * Reducer pour gérer les actions concernant les accouchements
 */
export const accouchementsReducer = createReducer(
  initialState,
  
  // Chargement de tous les accouchements
  on(AccouchementsActions.loadAccouchements, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(AccouchementsActions.loadAccouchementsSuccess, (state, { data }) => {
    const accouchementsList = Array.isArray(data.content) ? data.content : 
                             Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      accouchements: accouchementsList,
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
  
  on(AccouchementsActions.loadAccouchementsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'un accouchement spécifique
  on(AccouchementsActions.loadAccouchement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AccouchementsActions.loadAccouchementSuccess, (state, { data }) => ({
    ...state,
    selectedAccouchement: data,
    selectedAccouchementId: data.id,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.loadAccouchementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des accouchements par patiente
  on(AccouchementsActions.loadAccouchementsByPatient, (state, { patientId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      patientId
    }
  })),
  
  on(AccouchementsActions.loadAccouchementsByPatientSuccess, (state, { data }) => ({
    ...state,
    accouchementsByPatient: data,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.loadAccouchementsByPatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des accouchements par grossesse
  on(AccouchementsActions.loadAccouchementsByGrossesse, (state, { grossesseId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      grossesseId
    }
  })),
  
  on(AccouchementsActions.loadAccouchementsByGrossesseSuccess, (state, { data }) => ({
    ...state,
    accouchementsByGrossesse: data,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.loadAccouchementsByGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche d'accouchements
  on(AccouchementsActions.searchAccouchements, (state, { searchTerm, page, size }) => ({
    ...state,
    loading: true,
    searchTerm,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    },
    error: null
  })),
  
  on(AccouchementsActions.searchAccouchementsSuccess, (state, { data }) => {
    const accouchementsList = Array.isArray(data.content) ? data.content : 
                             Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      accouchements: accouchementsList,
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
  
  on(AccouchementsActions.searchAccouchementsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'un accouchement
  on(AccouchementsActions.createAccouchement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AccouchementsActions.createAccouchementSuccess, (state, { data }) => ({
    ...state,
    accouchements: state.accouchements.length < state.pagination.pageSize 
      ? [...state.accouchements, data]
      : state.accouchements,
    selectedAccouchement: data,
    selectedAccouchementId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1,
      totalPages: Math.ceil((state.pagination.totalElements + 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(AccouchementsActions.createAccouchementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'un accouchement
  on(AccouchementsActions.updateAccouchement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AccouchementsActions.updateAccouchementSuccess, (state, { data }) => ({
    ...state,
    accouchements: state.accouchements.map(accouchement => 
      accouchement.id === data.id ? data : accouchement
    ),
    selectedAccouchement: state.selectedAccouchement?.id === data.id ? data : state.selectedAccouchement,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.updateAccouchementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'un accouchement
  on(AccouchementsActions.deleteAccouchement, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AccouchementsActions.deleteAccouchementSuccess, (state, { id }) => ({
    ...state,
    accouchements: state.accouchements.filter(accouchement => accouchement.id !== id),
    selectedAccouchement: state.selectedAccouchement?.id === id ? null : state.selectedAccouchement,
    selectedAccouchementId: state.selectedAccouchementId === id ? null : state.selectedAccouchementId,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: Math.max(0, state.pagination.totalElements - 1),
      totalPages: Math.ceil(Math.max(0, state.pagination.totalElements - 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(AccouchementsActions.deleteAccouchementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par modalité d'extraction
  on(AccouchementsActions.filterByModalite, (state, { modaliteExtraction }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      modaliteExtraction
    },
    error: null
  })),
  
  on(AccouchementsActions.filterByModaliteSuccess, (state, { data }) => ({
    ...state,
    accouchements: data,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.filterByModaliteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par assistance qualifiée
  on(AccouchementsActions.filterByAssistance, (state, { assisstanceQualifiee }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      assisstanceQualifiee
    },
    error: null
  })),
  
  on(AccouchementsActions.filterByAssistanceSuccess, (state, { data }) => ({
    ...state,
    accouchements: data,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.filterByAssistanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par date d'accouchement
  on(AccouchementsActions.filterByDate, (state, { startDate, endDate }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      startDate,
      endDate
    },
    error: null
  })),
  
  on(AccouchementsActions.filterByDateSuccess, (state, { data }) => ({
    ...state,
    accouchements: data,
    loading: false,
    error: null
  })),
  
  on(AccouchementsActions.filterByDateFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation de l'état
  on(AccouchementsActions.resetAccouchementsState, () => initialState),
  
  // Sélection d'un accouchement
  on(AccouchementsActions.selectAccouchement, (state, { id }) => ({
    ...state,
    selectedAccouchementId: id,
    selectedAccouchement: id ? state.accouchements.find(a => a.id === id) || null : null
  }))
); 