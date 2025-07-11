import { createReducer, on } from '@ngrx/store';
import { RendezVousResponseDto } from '../../core/models/rendez-vous/rendez-vous-response.model';
import * as RendezVousActions from './rendez-vous.actions';

export interface RendezVousState {
  rendezVous: RendezVousResponseDto[];
  selectedRendezVous: RendezVousResponseDto | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: any;
  statistics: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    reported: number;
    parCentre: { [key: string]: number };
    parMois: { [key: string]: number };
    parStatut: { [key: string]: number };
  } | null;
  recentRendezVous: RendezVousResponseDto[];
  prochainRendezVous: RendezVousResponseDto[];
  rendezVousDuJour: RendezVousResponseDto[];
  conflitsHoraires: RendezVousResponseDto[];
}

export const initialState: RendezVousState = {
  rendezVous: [],
  selectedRendezVous: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  loading: false,
  error: null,
  statistics: null,
  recentRendezVous: [],
  prochainRendezVous: [],
  rendezVousDuJour: [],
  conflitsHoraires: []
};

export const rendezVousReducer = createReducer(
  initialState,

  // Chargement des rendez-vous
  on(RendezVousActions.loadRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Recherche des rendez-vous
  on(RendezVousActions.searchRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.searchRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.searchRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement d'un rendez-vous
  on(RendezVousActions.loadRendezVousById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByIdSuccess, (state, { rendezVous }) => ({
    ...state,
    selectedRendezVous: rendezVous,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Création d'un rendez-vous
  on(RendezVousActions.createRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.createRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: [rendezVous, ...state.rendezVous],
    totalElements: state.totalElements + 1,
    loading: false,
    error: null
  })),

  on(RendezVousActions.createRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Mise à jour d'un rendez-vous
  on(RendezVousActions.updateRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.updateRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: state.rendezVous.map(rv => 
      rv.id === rendezVous.id ? rendezVous : rv
    ),
    selectedRendezVous: state.selectedRendezVous?.id === rendezVous.id ? rendezVous : state.selectedRendezVous,
    loading: false,
    error: null
  })),

  on(RendezVousActions.updateRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Suppression d'un rendez-vous
  on(RendezVousActions.deleteRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.deleteRendezVousSuccess, (state, { id }) => ({
    ...state,
    rendezVous: state.rendezVous.filter(rv => rv.id !== id),
    selectedRendezVous: state.selectedRendezVous?.id === id ? null : state.selectedRendezVous,
    totalElements: Math.max(0, state.totalElements - 1),
    loading: false,
    error: null
  })),

  on(RendezVousActions.deleteRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Changement de statut
  on(RendezVousActions.changeStatutRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.changeStatutRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: state.rendezVous.map(rv => 
      rv.id === rendezVous.id ? rendezVous : rv
    ),
    selectedRendezVous: state.selectedRendezVous?.id === rendezVous.id ? rendezVous : state.selectedRendezVous,
    loading: false,
    error: null
  })),

  on(RendezVousActions.changeStatutRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Actions spécialisées pour les statuts (confirmer, annuler, reporter)
  on(RendezVousActions.confirmerRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.annulerRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.reporterRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // Chargement par statut
  on(RendezVousActions.loadRendezVousByStatut, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByStatutSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByStatutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par patiente
  on(RendezVousActions.loadRendezVousByPatiente, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByPatienteSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByPatienteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par centre
  on(RendezVousActions.loadRendezVousByCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByCentreSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par date
  on(RendezVousActions.loadRendezVousByDate, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByDateSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByDateFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement par plage de dates
  on(RendezVousActions.loadRendezVousByDateRange, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByDateRangeSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVous: rendezVous.content,
    totalElements: rendezVous.totalElements,
    totalPages: rendezVous.totalPages,
    currentPage: rendezVous.number,
    pageSize: rendezVous.size,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousByDateRangeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Statistiques
  on(RendezVousActions.loadRendezVousStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousStatisticsSuccess, (state, { statistics }) => ({
    ...state,
    statistics,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Rendez-vous récents
  on(RendezVousActions.loadRecentRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRecentRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    recentRendezVous: rendezVous,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRecentRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Prochains rendez-vous
  on(RendezVousActions.loadProchainRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadProchainRendezVousSuccess, (state, { rendezVous }) => ({
    ...state,
    prochainRendezVous: rendezVous,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadProchainRendezVousFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Rendez-vous du jour
  on(RendezVousActions.loadRendezVousDuJour, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.loadRendezVousDuJourSuccess, (state, { rendezVous }) => ({
    ...state,
    rendezVousDuJour: rendezVous,
    loading: false,
    error: null
  })),

  on(RendezVousActions.loadRendezVousDuJourFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Vérification des conflits d'horaires
  on(RendezVousActions.checkConflitsHoraires, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RendezVousActions.checkConflitsHorairesSuccess, (state, { conflits }) => ({
    ...state,
    conflitsHoraires: conflits,
    loading: false,
    error: null
  })),

  on(RendezVousActions.checkConflitsHorairesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Actions utilitaires
  on(RendezVousActions.clearRendezVous, (state) => ({
    ...state,
    rendezVous: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0
  })),

  on(RendezVousActions.clearSelectedRendezVous, (state) => ({
    ...state,
    selectedRendezVous: null
  })),

  on(RendezVousActions.setSelectedRendezVous, (state, { rendezVous }) => ({
    ...state,
    selectedRendezVous: rendezVous
  })),

  on(RendezVousActions.setRendezVousLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(RendezVousActions.setRendezVousError, (state, { error }) => ({
    ...state,
    error
  })),

  on(RendezVousActions.clearRendezVousError, (state) => ({
    ...state,
    error: null
  })),

  on(RendezVousActions.refreshRendezVous, (state) => ({
    ...state,
    loading: true,
    error: null
  }))
);