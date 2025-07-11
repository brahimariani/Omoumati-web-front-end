import { createReducer, on } from '@ngrx/store';
import { GrossessesActions } from './grossesses.actions';
import { GrossesseResponse } from '../../core/models/grossesse/grossesse-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des grossesses
 */
export interface GrossessesState {
  grossesses: GrossesseResponse[];
  selectedGrossesse: GrossesseResponse | null;
  selectedGrossesseId: string | null;
  grossessesByPatient: GrossesseResponse[];
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
    estDesiree?: boolean;
    startDate?: Date;
    endDate?: Date;
    patientId?: string;
  };
}

/**
 * État initial pour le reducer des grossesses
 */
export const initialState: GrossessesState = {
  grossesses: [],
  selectedGrossesse: null,
  selectedGrossesseId: null,
  grossessesByPatient: [],
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
 * Reducer pour gérer les actions concernant les grossesses
 */
export const grossessesReducer = createReducer(
  initialState,
  
  // Chargement de toutes les grossesses
  on(GrossessesActions.loadGrossesses, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(GrossessesActions.loadGrossessesSuccess, (state, { data }) => {
    const grossessesList = Array.isArray(data.content) ? data.content : 
                          Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      grossesses: grossessesList,
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
  
  on(GrossessesActions.loadGrossessesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'une grossesse spécifique
  on(GrossessesActions.loadGrossesse, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(GrossessesActions.loadGrossesseSuccess, (state, { data }) => ({
    ...state,
    selectedGrossesse: data,
    selectedGrossesseId: data.id,
    loading: false,
    error: null
  })),
  
  on(GrossessesActions.loadGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des grossesses par patiente
  on(GrossessesActions.loadGrossessesByPatient, (state, { patientId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      patientId
    }
  })),
  
  on(GrossessesActions.loadGrossessesByPatientSuccess, (state, { data }) => ({
    ...state,
    grossessesByPatient: data,
    loading: false,
    error: null
  })),
  
  on(GrossessesActions.loadGrossessesByPatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche de grossesses
  on(GrossessesActions.searchGrossesses, (state, { searchTerm, page, size }) => ({
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
  
  on(GrossessesActions.searchGrossessesSuccess, (state, { data }) => {
    const grossessesList = Array.isArray(data.content) ? data.content : 
                          Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      grossesses: grossessesList,
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
  
  on(GrossessesActions.searchGrossessesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'une grossesse
  on(GrossessesActions.createGrossesse, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(GrossessesActions.createGrossesseSuccess, (state, { data }) => ({
    ...state,
    grossesses: state.grossesses.length < state.pagination.pageSize 
      ? [...state.grossesses, data]
      : state.grossesses,
    selectedGrossesse: data,
    selectedGrossesseId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1,
      totalPages: Math.ceil((state.pagination.totalElements + 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(GrossessesActions.createGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'une grossesse
  on(GrossessesActions.updateGrossesse, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(GrossessesActions.updateGrossesseSuccess, (state, { data }) => ({
    ...state,
    grossesses: state.grossesses.map(grossesse => 
      grossesse.id === data.id ? data : grossesse
    ),
    selectedGrossesse: state.selectedGrossesse?.id === data.id ? data : state.selectedGrossesse,
    loading: false,
    error: null
  })),
  
  on(GrossessesActions.updateGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'une grossesse
  on(GrossessesActions.deleteGrossesse, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(GrossessesActions.deleteGrossesseSuccess, (state, { id }) => ({
    ...state,
    grossesses: state.grossesses.filter(grossesse => grossesse.id !== id),
    selectedGrossesse: state.selectedGrossesse?.id === id ? null : state.selectedGrossesse,
    selectedGrossesseId: state.selectedGrossesseId === id ? null : state.selectedGrossesseId,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: Math.max(0, state.pagination.totalElements - 1),
      totalPages: Math.ceil(Math.max(0, state.pagination.totalElements - 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(GrossessesActions.deleteGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par statut
  on(GrossessesActions.filterByStatus, (state, { estDesiree }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      estDesiree
    },
    error: null
  })),
  
  on(GrossessesActions.filterByStatusSuccess, (state, { data }) => ({
    ...state,
    grossesses: data,
    loading: false,
    error: null
  })),
  
  on(GrossessesActions.filterByStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par date d'accouchement prévue
  on(GrossessesActions.filterByDueDate, (state, { startDate, endDate }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      startDate,
      endDate
    },
    error: null
  })),
  
  on(GrossessesActions.filterByDueDateSuccess, (state, { data }) => ({
    ...state,
    grossesses: data,
    loading: false,
    error: null
  })),
  
  on(GrossessesActions.filterByDueDateFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation de l'état
  on(GrossessesActions.resetGrossessesState, () => initialState),
  
  // Sélection d'une grossesse
  on(GrossessesActions.selectGrossesse, (state, { id }) => ({
    ...state,
    selectedGrossesseId: id,
    selectedGrossesse: id ? state.grossesses.find(g => g.id === id) || null : null
  }))
); 