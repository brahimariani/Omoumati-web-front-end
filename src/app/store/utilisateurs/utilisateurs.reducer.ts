import { createReducer, on } from '@ngrx/store';
import { UtilisateursActions } from './utilisateurs.actions';
import { UtilisateurResponse } from '../../core/models/utilisateur/utilisateur.response.model';
import { StatutUtilisateur } from '../../core/models/utilisateur/statututilisateur.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des utilisateurs
 */
export interface UtilisateursState {
  utilisateurs: UtilisateurResponse[];
  selectedUtilisateur: UtilisateurResponse | null;
  selectedUtilisateurId: string | null;
  currentUserProfile: UtilisateurResponse | null;
  statistics: {
    total: number;
    actifs: number;
    inactifs: number;
    suspendus: number;
    parRole: { [key: string]: number };
    parCentre: { [key: string]: number };
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
  filters: {
    roleId?: string;
    statut?: StatutUtilisateur;
    centreId?: string;
  } | null;
  validation: {
    emailAvailable: boolean | null;
    validationErrors: string[] | null;
  };
  temporaryPassword: string | null;
}

/**
 * État initial des utilisateurs
 */
const initialState: UtilisateursState = {
  utilisateurs: [],
  selectedUtilisateur: null,
  selectedUtilisateurId: null,
  currentUserProfile: null,
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
  filters: null,
  validation: {
    emailAvailable: null,
    validationErrors: null
  },
  temporaryPassword: null
};

/**
 * Reducer pour les utilisateurs
 */
export const utilisateursReducer = createReducer(
  initialState,

  // ============================
  // CHARGEMENT DES UTILISATEURS
  // ============================
  
  on(UtilisateursActions.loadUtilisateurs, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.loadUtilisateursSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: data.content || [],
    pagination: {
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      pageSize: data.size || 10
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.loadUtilisateursFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // CHARGEMENT D'UN UTILISATEUR
  // ============================
  
  on(UtilisateursActions.loadUtilisateur, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.loadUtilisateurSuccess, (state, { data }) => ({
    ...state,
    selectedUtilisateur: data,
    selectedUtilisateurId: data.id,
    // Mettre à jour dans la liste si l'utilisateur existe
    utilisateurs: state.utilisateurs.map(user => 
      user.id === data.id ? data : user
    ),
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.loadUtilisateurFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // RECHERCHE D'UTILISATEURS
  // ============================
  
  on(UtilisateursActions.searchUtilisateurs, (state, { searchTerm }) => ({
    ...state,
    loading: true,
    error: null,
    searchTerm
  })),
  
  on(UtilisateursActions.searchUtilisateursSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: data.content || [],
    pagination: {
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      pageSize: data.size || 10
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.searchUtilisateursFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // CRÉATION D'UTILISATEUR
  // ============================
  
  on(UtilisateursActions.createUtilisateur, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.createUtilisateurSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: [data, ...state.utilisateurs],
    pagination: {
      ...state.pagination,
      totalElements: state.pagination.totalElements + 1
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.createUtilisateurFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // MISE À JOUR D'UTILISATEUR
  // ============================
  
  on(UtilisateursActions.updateUtilisateur, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.updateUtilisateurSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: state.utilisateurs.map(user => 
      user.id === data.id ? data : user
    ),
    selectedUtilisateur: state.selectedUtilisateurId === data.id ? data : state.selectedUtilisateur,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.updateUtilisateurFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // SUPPRESSION D'UTILISATEUR
  // ============================
  
  on(UtilisateursActions.deleteUtilisateur, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.deleteUtilisateurSuccess, (state, { id }) => ({
    ...state,
    utilisateurs: state.utilisateurs.filter(user => user.id !== id),
    selectedUtilisateur: state.selectedUtilisateurId === id ? null : state.selectedUtilisateur,
    selectedUtilisateurId: state.selectedUtilisateurId === id ? null : state.selectedUtilisateurId,
    pagination: {
      ...state.pagination,
      totalElements: Math.max(0, state.pagination.totalElements - 1)
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.deleteUtilisateurFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // FILTRAGE PAR RÔLE
  // ============================
  
  on(UtilisateursActions.filterByRole, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.filterByRoleSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: data.content || [],
    pagination: {
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      pageSize: data.size || 10
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.filterByRoleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // FILTRAGE PAR STATUT
  // ============================
  
  on(UtilisateursActions.filterByStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.filterByStatusSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: data.content || [],
    pagination: {
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      pageSize: data.size || 10
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.filterByStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // FILTRAGE PAR CENTRE
  // ============================
  
  on(UtilisateursActions.filterByCentre, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.filterByCentreSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: data.content || [],
    pagination: {
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      pageSize: data.size || 10
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.filterByCentreFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // FILTRAGE AVANCÉ
  // ============================
  
  on(UtilisateursActions.filterUtilisateurs, (state, { filters }) => ({
    ...state,
    loading: true,
    error: null,
    filters: filters.searchTerm ? { ...state.filters, ...filters } : filters
  })),
  
  on(UtilisateursActions.filterUtilisateursSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: data.content || [],
    pagination: {
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      pageSize: data.size || 10
    },
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.filterUtilisateursFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // GESTION DES STATUTS
  // ============================
  
  on(UtilisateursActions.toggleUserStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.toggleUserStatusSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: state.utilisateurs.map(user => 
      user.id === data.id ? data : user
    ),
    selectedUtilisateur: state.selectedUtilisateurId === data.id ? data : state.selectedUtilisateur,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.toggleUserStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Actions spécialisées de statut
  on(UtilisateursActions.activateUser, UtilisateursActions.suspendUser, UtilisateursActions.deactivateUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.activateUserSuccess, UtilisateursActions.suspendUserSuccess, UtilisateursActions.deactivateUserSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: state.utilisateurs.map(user => 
      user.id === data.id ? data : user
    ),
    selectedUtilisateur: state.selectedUtilisateurId === data.id ? data : state.selectedUtilisateur,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.activateUserFailure, UtilisateursActions.suspendUserFailure, UtilisateursActions.deactivateUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // GESTION DES MOTS DE PASSE
  // ============================
  
  on(UtilisateursActions.resetUserPassword, (state) => ({
    ...state,
    loading: true,
    error: null,
    temporaryPassword: null
  })),
  
  on(UtilisateursActions.resetUserPasswordSuccess, (state, { temporaryPassword }) => ({
    ...state,
    loading: false,
    error: null,
    temporaryPassword
  })),
  
  on(UtilisateursActions.resetUserPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    temporaryPassword: null
  })),
  
  on(UtilisateursActions.changePassword, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.changePasswordSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.changePasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // GESTION DU PROFIL
  // ============================
  
  on(UtilisateursActions.loadCurrentUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.loadCurrentUserProfileSuccess, (state, { data }) => ({
    ...state,
    currentUserProfile: data,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.loadCurrentUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(UtilisateursActions.updateCurrentUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.updateCurrentUserProfileSuccess, (state, { data }) => ({
    ...state,
    currentUserProfile: data,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.updateCurrentUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(UtilisateursActions.updateUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.updateUserProfileSuccess, (state, { data }) => ({
    ...state,
    utilisateurs: state.utilisateurs.map(user => 
      user.id === data.id ? data : user
    ),
    selectedUtilisateur: state.selectedUtilisateurId === data.id ? data : state.selectedUtilisateur,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // STATISTIQUES
  // ============================
  
  on(UtilisateursActions.loadUsersStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UtilisateursActions.loadUsersStatisticsSuccess, (state, { data }) => ({
    ...state,
    statistics: data,
    loading: false,
    error: null
  })),
  
  on(UtilisateursActions.loadUsersStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // VALIDATION
  // ============================
  
  on(UtilisateursActions.checkEmailAvailability, (state) => ({
    ...state,
    validation: {
      ...state.validation,
      emailAvailable: null
    }
  })),
  
  on(UtilisateursActions.checkEmailAvailabilitySuccess, (state, { available }) => ({
    ...state,
    validation: {
      ...state.validation,
      emailAvailable: available
    }
  })),
  
  on(UtilisateursActions.checkEmailAvailabilityFailure, (state, { error }) => ({
    ...state,
    error,
    validation: {
      ...state.validation,
      emailAvailable: null
    }
  })),
  
  on(UtilisateursActions.validateUserData, (state) => ({
    ...state,
    validation: {
      ...state.validation,
      validationErrors: null
    }
  })),
  
  on(UtilisateursActions.validateUserDataSuccess, (state, { valid, errors }) => ({
    ...state,
    validation: {
      ...state.validation,
      validationErrors: valid ? null : (errors || [])
    }
  })),
  
  on(UtilisateursActions.validateUserDataFailure, (state, { error }) => ({
    ...state,
    error,
    validation: {
      ...state.validation,
      validationErrors: null
    }
  })),

  // ============================
  // UTILITAIRES
  // ============================
  
  on(UtilisateursActions.resetUtilisateursState, () => initialState),
  
  on(UtilisateursActions.clearError, (state) => ({
    ...state,
    error: null
  })),
  
  on(UtilisateursActions.selectUtilisateur, (state, { id }) => ({
    ...state,
    selectedUtilisateurId: id,
    selectedUtilisateur: id ? state.utilisateurs.find(user => user.id === id) || null : null
  })),
  
  on(UtilisateursActions.setSearchTerm, (state, { searchTerm }) => ({
    ...state,
    searchTerm
  })),
  
  on(UtilisateursActions.setFilters, (state, { filters }) => ({
    ...state,
    filters
  }))
); 