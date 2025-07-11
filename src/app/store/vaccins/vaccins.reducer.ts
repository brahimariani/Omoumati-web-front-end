import { createReducer, on } from '@ngrx/store';
import { VaccinsActions } from './vaccins.actions';
import { VaccinResponseDto } from '../../core/models/vaccin/vaccin-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des vaccins
 */
export interface VaccinsState {
  vaccins: VaccinResponseDto[];
  selectedVaccin: VaccinResponseDto | null;
  selectedVaccinId: string | null;
  vaccinsByPatient: VaccinResponseDto[];
  vaccinsByNaissance: VaccinResponseDto[];
  vaccinsManquants: string[];
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
    nom?: string;
    startDate?: Date;
    endDate?: Date;
    patientId?: string;
    naissanceId?: string;
  };
}

/**
 * État initial pour le reducer des vaccins
 */
export const initialState: VaccinsState = {
  vaccins: [],
  selectedVaccin: null,
  selectedVaccinId: null,
  vaccinsByPatient: [],
  vaccinsByNaissance: [],
  vaccinsManquants: [],
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
 * Reducer pour gérer les actions concernant les vaccins
 */
export const vaccinsReducer = createReducer(
  initialState,
  
  // Chargement de tous les vaccins
  on(VaccinsActions.loadVaccins, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(VaccinsActions.loadVaccinsSuccess, (state, { data }) => {
    const vaccinsList = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      vaccins: vaccinsList,
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
  
  on(VaccinsActions.loadVaccinsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'un vaccin spécifique
  on(VaccinsActions.loadVaccin, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.loadVaccinSuccess, (state, { data }) => ({
    ...state,
    selectedVaccin: data,
    selectedVaccinId: data.id,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.loadVaccinFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des vaccins par patiente
  on(VaccinsActions.loadVaccinsByPatient, (state, { patientId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      patientId
    }
  })),
  
  on(VaccinsActions.loadVaccinsByPatientSuccess, (state, { data }) => ({
    ...state,
    vaccinsByPatient: data,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.loadVaccinsByPatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des vaccins par naissance
  on(VaccinsActions.loadVaccinsByNaissance, (state, { naissanceId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      naissanceId
    }
  })),
  
  on(VaccinsActions.loadVaccinsByNaissanceSuccess, (state, { data }) => ({
    ...state,
    vaccinsByNaissance: data,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.loadVaccinsByNaissanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche de vaccins
  on(VaccinsActions.searchVaccins, (state, { searchTerm, page, size }) => ({
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
  
  on(VaccinsActions.searchVaccinsSuccess, (state, { data }) => {
    const vaccinsList = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      vaccins: vaccinsList,
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
  
  on(VaccinsActions.searchVaccinsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'un vaccin
  on(VaccinsActions.createVaccin, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.createVaccinSuccess, (state, { data }) => ({
    ...state,
    vaccins: [...state.vaccins, data],
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.createVaccinFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'un vaccin
  on(VaccinsActions.updateVaccin, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.updateVaccinSuccess, (state, { data }) => ({
    ...state,
    vaccins: state.vaccins.map(vaccin => 
      vaccin.id === data.id ? data : vaccin
    ),
    selectedVaccin: state.selectedVaccinId === data.id ? data : state.selectedVaccin,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.updateVaccinFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'un vaccin
  on(VaccinsActions.deleteVaccin, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.deleteVaccinSuccess, (state, { id }) => ({
    ...state,
    vaccins: state.vaccins.filter(vaccin => vaccin.id !== id),
    selectedVaccin: state.selectedVaccinId === id ? null : state.selectedVaccin,
    selectedVaccinId: state.selectedVaccinId === id ? null : state.selectedVaccinId,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.deleteVaccinFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par nom
  on(VaccinsActions.filterByNom, (state, { nom }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      nom
    }
  })),
  
  on(VaccinsActions.filterByNomSuccess, (state, { data }) => ({
    ...state,
    vaccins: data,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.filterByNomFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par date
  on(VaccinsActions.filterByDate, (state, { startDate, endDate }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      startDate,
      endDate
    }
  })),
  
  on(VaccinsActions.filterByDateSuccess, (state, { data }) => ({
    ...state,
    vaccins: data,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.filterByDateFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des vaccins manquants
  on(VaccinsActions.loadVaccinsManquants, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.loadVaccinsManquantsSuccess, (state, { data }) => ({
    ...state,
    vaccinsManquants: data,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.loadVaccinsManquantsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Marquer comme administré
  on(VaccinsActions.marquerCommeAdministre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.marquerCommeAdministreSuccess, (state, { data }) => ({
    ...state,
    vaccins: state.vaccins.map(vaccin => 
      vaccin.id === data.id ? data : vaccin
    ),
    selectedVaccin: state.selectedVaccinId === data.id ? data : state.selectedVaccin,
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.marquerCommeAdministreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Générer calendrier vaccinal
  on(VaccinsActions.genererCalendrier, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VaccinsActions.genererCalendrierSuccess, (state, { data }) => ({
    ...state,
    vaccins: [...state.vaccins, ...data],
    loading: false,
    error: null
  })),
  
  on(VaccinsActions.genererCalendrierFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation de l'état
  on(VaccinsActions.resetVaccinsState, () => initialState),
  
  // Sélection d'un vaccin
  on(VaccinsActions.selectVaccin, (state, { id }) => ({
    ...state,
    selectedVaccinId: id,
    selectedVaccin: id ? state.vaccins.find(vaccin => vaccin.id === id) || null : null
  }))
); 