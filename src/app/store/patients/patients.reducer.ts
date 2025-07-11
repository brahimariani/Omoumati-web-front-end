import { createReducer, on } from '@ngrx/store';
import { PatientsActions } from './patients.actions';
import { PatienteResponse } from '../../core/models/patiente/patiente.response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des patientes
 */
export interface PatientsState {
  patients: PatienteResponse[];
  selectedPatient: PatienteResponse | null;
  selectedPatientId: string | null;
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  searchTerm: string | null;
}

/**
 * État initial pour le reducer des patientes
 */
export const initialState: PatientsState = {
  patients: [],
  selectedPatient: null,
  selectedPatientId: null,
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  },
  searchTerm: null
};

/**
 * Reducer pour gérer les actions concernant les patientes
 */
export const patientsReducer = createReducer(
  initialState,
  
  // Chargement de toutes les patientes
  on(PatientsActions.loadPatients, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(PatientsActions.loadPatientsSuccess, (state, { data }) => {
    // Vérifier si data.content existe, sinon utiliser data directement si c'est un tableau
    const patientsList = Array.isArray(data.content) ? data.content : 
                        Array.isArray(data) ? data : [];
    
    // Vérifier si les données de pagination existent
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    console.log('Données après traitement reducer:', {
      patientsList,
      pagination: {
        totalElements,
        totalPages,
        currentPage,
        pageSize
      }
    });
    
    return {
      ...state,
      patients: patientsList,
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
  
  on(PatientsActions.loadPatientsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'une patiente spécifique
  on(PatientsActions.loadPatient, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PatientsActions.loadPatientSuccess, (state, { data }) => ({
    ...state,
    selectedPatient: data,
    selectedPatientId: data.id,
    loading: false,
    error: null
  })),
  
  on(PatientsActions.loadPatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche de patientes
  on(PatientsActions.searchPatients, (state, { searchTerm, page, size }) => ({
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
  
  on(PatientsActions.searchPatientsSuccess, (state, { data }) => {
    // Vérifier si data.content existe, sinon utiliser data directement si c'est un tableau
    const patientsList = Array.isArray(data.content) ? data.content : 
                        Array.isArray(data) ? data : [];
    
    // Vérifier si les données de pagination existent
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      patients: patientsList,
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
  
  on(PatientsActions.searchPatientsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'une patiente
  on(PatientsActions.createPatient, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PatientsActions.createPatientSuccess, (state, { data }) => ({
    ...state,
    // Ajouter la nouvelle patiente à la liste si elle n'est pas déjà pleine
    patients: state.patients.length < state.pagination.pageSize 
      ? [...state.patients, data]
      : state.patients,
    selectedPatient: data,
    selectedPatientId: data.id,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1,
      totalPages: Math.ceil((state.pagination.totalElements + 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(PatientsActions.createPatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'une patiente
  on(PatientsActions.updatePatient, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PatientsActions.updatePatientSuccess, (state, { data }) => ({
    ...state,
    patients: state.patients.map(patient => 
      patient.id === data.id ? data : patient
    ),
    selectedPatient: data,
    loading: false,
    error: null
  })),
  
  on(PatientsActions.updatePatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'une patiente
  on(PatientsActions.deletePatient, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PatientsActions.deletePatientSuccess, (state, { id }) => ({
    ...state,
    patients: state.patients.filter(patient => patient.id !== id),
    selectedPatient: state.selectedPatient && state.selectedPatient.id === id ? null : state.selectedPatient,
    selectedPatientId: state.selectedPatientId === id ? null : state.selectedPatientId,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements - 1,
      totalPages: Math.ceil((state.pagination.totalElements - 1) / state.pagination.pageSize)
    },
    error: null
  })),
  
  on(PatientsActions.deletePatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Filtrage par groupe sanguin
  on(PatientsActions.filterByBloodType, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PatientsActions.filterByBloodTypeSuccess, (state, { data }) => ({
    ...state,
    patients: data,
    loading: false,
    pagination: {
      ...state.pagination,
      totalElements: data.length,
      totalPages: 1,
      currentPage: 0
    },
    error: null
  })),
  
  on(PatientsActions.filterByBloodTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Sélection d'une patiente
  on(PatientsActions.selectPatient, (state, { id }) => ({
    ...state,
    selectedPatientId: id,
    selectedPatient: id ? state.patients.find(patient => patient.id === id) || null : null
  })),
  
  // Réinitialisation de l'état
  on(PatientsActions.resetPatientsState, () => initialState)
); 