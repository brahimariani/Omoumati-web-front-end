import { createReducer, on } from '@ngrx/store';
import { ReferenceResponse } from '../../core/models/reference/reference-response.model';
import * as ReferencesActions from './references.actions';

export interface ReferencesState {
  references: ReferenceResponse[];
  selectedReference: ReferenceResponse | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: any;
  statistics: {
    total: number;
    accepted: number;
    rejected: number;
    reported: number;
    parCentre: { [key: string]: number };
    parMois: { [key: string]: number };
  } | null;
  recentReferences: ReferenceResponse[];
}

export const initialState: ReferencesState = {
  references: [],
  selectedReference: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  loading: false,
  error: null,
  statistics: null,
  recentReferences: []
};

export const referencesReducer = createReducer(
  initialState,

  // Chargement des références
  on(ReferencesActions.loadReferences, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadReferencesSuccess, (state, { references }) => ({
    ...state,
    references: references.content,
    totalElements: references.totalElements,
    totalPages: references.totalPages,
    currentPage: references.number,
    pageSize: references.size,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadReferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Recherche des références
  on(ReferencesActions.searchReferences, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.searchReferencesSuccess, (state, { references }) => ({
    ...state,
    references: references.content,
    totalElements: references.totalElements,
    totalPages: references.totalPages,
    currentPage: references.number,
    pageSize: references.size,
    loading: false,
    error: null
  })),

  on(ReferencesActions.searchReferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement d'une référence
  on(ReferencesActions.loadReference, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadReferenceSuccess, (state, { reference }) => ({
    ...state,
    selectedReference: reference,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadReferenceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Création d'une référence
  on(ReferencesActions.createReference, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.createReferenceSuccess, (state, { reference }) => ({
    ...state,
    references: [reference, ...state.references],
    totalElements: state.totalElements + 1,
    loading: false,
    error: null
  })),

  on(ReferencesActions.createReferenceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Mise à jour d'une référence
  on(ReferencesActions.updateReference, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.updateReferenceSuccess, (state, { reference }) => ({
    ...state,
    references: state.references.map(r => r.id === reference.id ? reference : r),
    selectedReference: state.selectedReference?.id === reference.id ? reference : state.selectedReference,
    loading: false,
    error: null
  })),

  on(ReferencesActions.updateReferenceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Suppression d'une référence
  on(ReferencesActions.deleteReference, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.deleteReferenceSuccess, (state, { id }) => ({
    ...state,
    references: state.references.filter(r => r.id !== id),
    selectedReference: state.selectedReference?.id === id ? null : state.selectedReference,
    totalElements: Math.max(0, state.totalElements - 1),
    loading: false,
    error: null
  })),

  on(ReferencesActions.deleteReferenceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Changement de statut
  on(ReferencesActions.changeStatutReference, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.changeStatutReferenceSuccess, (state, { reference }) => ({
    ...state,
    references: state.references.map(r => r.id === reference.id ? reference : r),
    selectedReference: state.selectedReference?.id === reference.id ? reference : state.selectedReference,
    loading: false,
    error: null
  })),

  on(ReferencesActions.changeStatutReferenceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par statut
  on(ReferencesActions.loadReferencesByStatut, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadReferencesByStatutSuccess, (state, { references }) => ({
    ...state,
    references: references.content,
    totalElements: references.totalElements,
    totalPages: references.totalPages,
    currentPage: references.number,
    pageSize: references.size,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadReferencesByStatutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par patiente
  on(ReferencesActions.loadReferencesByPatiente, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadReferencesByPatienteSuccess, (state, { references }) => ({
    ...state,
    references: references.content,
    totalElements: references.totalElements,
    totalPages: references.totalPages,
    currentPage: references.number,
    pageSize: references.size,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadReferencesByPatienteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par centre
  on(ReferencesActions.loadReferencesByCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadReferencesByCentreSuccess, (state, { references }) => ({
    ...state,
    references: references.content,
    totalElements: references.totalElements,
    totalPages: references.totalPages,
    currentPage: references.number,
    pageSize: references.size,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadReferencesByCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Statistiques
  on(ReferencesActions.loadReferencesStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadReferencesStatisticsSuccess, (state, { statistics }) => ({
    ...state,
    statistics,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadReferencesStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Références récentes
  on(ReferencesActions.loadRecentReferences, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReferencesActions.loadRecentReferencesSuccess, (state, { references }) => ({
    ...state,
    recentReferences: references,
    loading: false,
    error: null
  })),

  on(ReferencesActions.loadRecentReferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Actions utilitaires
  on(ReferencesActions.clearReferences, (state) => ({
    ...state,
    references: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0
  })),

  on(ReferencesActions.clearSelectedReference, (state) => ({
    ...state,
    selectedReference: null
  })),

  on(ReferencesActions.setSelectedReference, (state, { reference }) => ({
    ...state,
    selectedReference: reference
  })),

  on(ReferencesActions.setReferencesLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(ReferencesActions.setReferencesError, (state, { error }) => ({
    ...state,
    error
  })),

  on(ReferencesActions.clearReferencesError, (state) => ({
    ...state,
    error: null
  }))
); 