import { createReducer, on } from '@ngrx/store';
import { CentresActions } from './centres.actions';
import { CentreResponse } from '../../core/models/centre/centre.response.model';
import { TypeCentre } from '../../core/models/centre/typecentre.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des centres
 */
export interface CentresState {
  centres: CentreResponse[];
  selectedCentre: CentreResponse | null;
  selectedCentreId: string | null;
  myCentres: CentreResponse[];
  types: TypeCentre[];
  statistics: {
    total: number;
    actifs: number;
    inactifs: number;
    parType: { [key in TypeCentre]: number };
  } | null;
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  searchTerm: string | null;
  currentFilter: {
    type?: TypeCentre;
  } | null;
}

/**
 * État initial pour le reducer des centres
 */
export const initialState: CentresState = {
  centres: [],
  selectedCentre: null,
  selectedCentreId: null,
  myCentres: [],
  types: [],
  statistics: null,
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  },
  searchTerm: null,
  currentFilter: null
};

/**
 * Reducer pour gérer les actions concernant les centres
 */
export const centresReducer = createReducer(
  initialState,
  
  // Chargement de tous les centres
  on(CentresActions.loadCentres, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(CentresActions.loadCentresSuccess, (state, { data }) => {
    const centresList = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      centres: centresList,
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
  
  on(CentresActions.loadCentresFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'un centre spécifique
  on(CentresActions.loadCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.loadCentreSuccess, (state, { data }) => ({
    ...state,
    selectedCentre: data,
    selectedCentreId: data.id,
    loading: false,
    error: null
  })),
  
  on(CentresActions.loadCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche de centres
  on(CentresActions.searchCentres, (state, { searchTerm, page, size }) => ({
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
  
  on(CentresActions.searchCentresSuccess, (state, { data }) => {
    const centresList = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      centres: centresList,
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
  
  on(CentresActions.searchCentresFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'un centre
  on(CentresActions.createCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.createCentreSuccess, (state, { data }) => ({
    ...state,
    centres: state.centres.length < state.pagination.pageSize 
      ? [...state.centres, data]
      : state.centres,
    selectedCentre: data,
    selectedCentreId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1,
      totalPages: Math.ceil((state.pagination.totalElements + 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(CentresActions.createCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'un centre
  on(CentresActions.updateCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.updateCentreSuccess, (state, { data }) => ({
    ...state,
    centres: state.centres.map(centre => 
      centre.id === data.id ? data : centre
    ),
    selectedCentre: state.selectedCentre?.id === data.id ? data : state.selectedCentre,
    loading: false,
    error: null
  })),
  
  on(CentresActions.updateCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'un centre
  on(CentresActions.deleteCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.deleteCentreSuccess, (state, { id }) => ({
    ...state,
    centres: state.centres.filter(centre => centre.id !== id),
    selectedCentre: state.selectedCentre?.id === id ? null : state.selectedCentre,
    selectedCentreId: state.selectedCentreId === id ? null : state.selectedCentreId,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: Math.max(0, state.pagination.totalElements - 1),
      totalPages: Math.ceil(Math.max(0, state.pagination.totalElements - 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(CentresActions.deleteCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par type
  on(CentresActions.filterByType, (state, { centreType, page, size }) => ({
    ...state,
    loading: true,
    currentFilter: { type: centreType },
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    },
    error: null
  })),
  
  on(CentresActions.filterByTypeSuccess, (state, { data }) => {
    const centresList = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      centres: centresList,
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
  
  on(CentresActions.filterByTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des centres de l'utilisateur
  on(CentresActions.loadMyCentres, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.loadMyCentresSuccess, (state, { data }) => ({
    ...state,
    myCentres: data,
    loading: false,
    error: null
  })),
  
  on(CentresActions.loadMyCentresFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des statistiques
  on(CentresActions.loadStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.loadStatisticsSuccess, (state, { data }) => ({
    ...state,
    statistics: data,
    loading: false,
    error: null
  })),
  
  on(CentresActions.loadStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Changement de statut
  on(CentresActions.toggleCentreStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.toggleCentreStatusSuccess, (state, { data }) => ({
    ...state,
    centres: state.centres.map(centre => 
      centre.id === data.id ? data : centre
    ),
    selectedCentre: state.selectedCentre?.id === data.id ? data : state.selectedCentre,
    loading: false,
    error: null
  })),
  
  on(CentresActions.toggleCentreStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des types
  on(CentresActions.loadTypes, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CentresActions.loadTypesSuccess, (state, { data }) => ({
    ...state,
    types: data,
    loading: false,
    error: null
  })),
  
  on(CentresActions.loadTypesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Sélection d'un centre
  on(CentresActions.selectCentre, (state, { id }) => ({
    ...state,
    selectedCentreId: id,
    selectedCentre: id ? state.centres.find(centre => centre.id === id) || null : null
  })),
  
  // Nettoyage des erreurs
  on(CentresActions.clearError, (state) => ({
    ...state,
    error: null
  })),
  
  // Réinitialisation de l'état
  on(CentresActions.resetCentresState, () => initialState)
); 