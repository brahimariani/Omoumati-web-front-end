import { createReducer, on } from '@ngrx/store';
import { NaissancesActions } from './naissances.actions';
import { NaissanceResponse } from '../../core/models/naissance/naissance-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des naissances
 */
export interface NaissancesState {
  naissances: NaissanceResponse[];
  selectedNaissance: NaissanceResponse | null;
  selectedNaissanceId: string | null;
  naissancesByAccouchement: NaissanceResponse[];
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
    sexe?: string;
    estVivant?: boolean;
    poidsMin?: number;
    poidsMax?: number;
    accouchementId?: string;
  };
}

/**
 * État initial pour le reducer des naissances
 */
export const initialState: NaissancesState = {
  naissances: [],
  selectedNaissance: null,
  selectedNaissanceId: null,
  naissancesByAccouchement: [],
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
 * Reducer pour gérer les actions concernant les naissances
 */
export const naissancesReducer = createReducer(
  initialState,
  
  // Chargement de toutes les naissances
  on(NaissancesActions.loadNaissances, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(NaissancesActions.loadNaissancesSuccess, (state, { data }) => {
    const naissancesList = Array.isArray(data.content) ? data.content : 
                          Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      naissances: naissancesList,
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
  
  on(NaissancesActions.loadNaissancesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'une naissance spécifique
  on(NaissancesActions.loadNaissance, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NaissancesActions.loadNaissanceSuccess, (state, { data }) => ({
    ...state,
    selectedNaissance: data,
    selectedNaissanceId: data.id,
    loading: false,
    error: null
  })),
  
  on(NaissancesActions.loadNaissanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des naissances par accouchement
  on(NaissancesActions.loadNaissancesByAccouchement, (state, { accouchementId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      accouchementId
    }
  })),
  
  on(NaissancesActions.loadNaissancesByAccouchementSuccess, (state, { data }) => ({
    ...state,
    naissancesByAccouchement: data,
    loading: false,
    error: null
  })),
  
  on(NaissancesActions.loadNaissancesByAccouchementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche de naissances
  on(NaissancesActions.searchNaissances, (state, { searchTerm, page, size }) => ({
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
  
  on(NaissancesActions.searchNaissancesSuccess, (state, { data }) => {
    const naissancesList = Array.isArray(data.content) ? data.content : 
                          Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      naissances: naissancesList,
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
  
  on(NaissancesActions.searchNaissancesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'une naissance
  on(NaissancesActions.createNaissance, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NaissancesActions.createNaissanceSuccess, (state, { data }) => ({
    ...state,
    naissances: state.naissances.length < state.pagination.pageSize 
      ? [...state.naissances, data]
      : state.naissances,
    selectedNaissance: data,
    selectedNaissanceId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1,
      totalPages: Math.ceil((state.pagination.totalElements + 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(NaissancesActions.createNaissanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'une naissance
  on(NaissancesActions.updateNaissance, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NaissancesActions.updateNaissanceSuccess, (state, { data }) => ({
    ...state,
    naissances: state.naissances.map(naissance => 
      naissance.id === data.id ? data : naissance
    ),
    selectedNaissance: state.selectedNaissance?.id === data.id ? data : state.selectedNaissance,
    loading: false,
    error: null
  })),
  
  on(NaissancesActions.updateNaissanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'une naissance
  on(NaissancesActions.deleteNaissance, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NaissancesActions.deleteNaissanceSuccess, (state, { id }) => ({
    ...state,
    naissances: state.naissances.filter(naissance => naissance.id !== id),
    selectedNaissance: state.selectedNaissance?.id === id ? null : state.selectedNaissance,
    selectedNaissanceId: state.selectedNaissanceId === id ? null : state.selectedNaissanceId,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: Math.max(0, state.pagination.totalElements - 1),
      totalPages: Math.ceil(Math.max(0, state.pagination.totalElements - 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(NaissancesActions.deleteNaissanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par sexe
  on(NaissancesActions.filterBySexe, (state, { sexe }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      sexe
    },
    error: null
  })),
  
  on(NaissancesActions.filterBySexeSuccess, (state, { data }) => ({
    ...state,
    naissances: data,
    loading: false,
    error: null
  })),
  
  on(NaissancesActions.filterBySexeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par statut vivant
  on(NaissancesActions.filterByVivant, (state, { estVivant }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      estVivant
    },
    error: null
  })),
  
  on(NaissancesActions.filterByVivantSuccess, (state, { data }) => ({
    ...state,
    naissances: data,
    loading: false,
    error: null
  })),
  
  on(NaissancesActions.filterByVivantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par poids
  on(NaissancesActions.filterByPoids, (state, { poidsMin, poidsMax }) => ({
    ...state,
    loading: true,
    filters: {
      ...state.filters,
      poidsMin,
      poidsMax
    },
    error: null
  })),
  
  on(NaissancesActions.filterByPoidsSuccess, (state, { data }) => ({
    ...state,
    naissances: data,
    loading: false,
    error: null
  })),
  
  on(NaissancesActions.filterByPoidsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation de l'état
  on(NaissancesActions.resetNaissancesState, () => initialState),
  
  // Sélection d'une naissance
  on(NaissancesActions.selectNaissance, (state, { id }) => ({
    ...state,
    selectedNaissanceId: id,
    selectedNaissance: id ? state.naissances.find(n => n.id === id) || null : null
  }))
); 