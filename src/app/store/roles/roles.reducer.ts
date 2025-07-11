import { createReducer, on } from '@ngrx/store';
import { RolesActions } from './roles.actions';
import { RoleResponse } from '../../core/models/role/role.response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Interface pour l'état des rôles
 */
export interface RolesState {
  roles: RoleResponse[];
  allRoles: RoleResponse[]; // Pour les sélecteurs sans pagination
  selectedRole: RoleResponse | null;
  selectedRoleId: string | null;
  usersByRole: { [roleId: string]: any[] };
  statistics: {
    total: number;
    utilisateursParRole: { [key: string]: number };
    rolesLesUtilises: Array<{ nom: string; count: number }>;
  } | null;
  nameAvailability: { available: boolean } | null;
  canDelete: { canDelete: boolean; reason?: string } | null;
  validation: { valid: boolean; errors?: string[] } | null;
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
 * État initial des rôles
 */
export const initialRolesState: RolesState = {
  roles: [],
  allRoles: [],
  selectedRole: null,
  selectedRoleId: null,
  usersByRole: {},
  statistics: null,
  nameAvailability: null,
  canDelete: null,
  validation: null,
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
 * Reducer pour la gestion des rôles
 */
export const rolesReducer = createReducer(
  initialRolesState,

  // ============================
  // CHARGEMENT DES RÔLES
  // ============================

  // Chargement de tous les rôles avec pagination
  on(RolesActions.loadRoles, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.loadRolesSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    roles: data.content,
    pagination: {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.number,
      pageSize: data.size
    },
    error: null
  })),

  on(RolesActions.loadRolesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement de tous les rôles (simple)
  on(RolesActions.loadAllRolesSimple, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.loadAllRolesSimpleSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    allRoles: data,
    error: null
  })),

  on(RolesActions.loadAllRolesSimpleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Chargement d'un rôle spécifique
  on(RolesActions.loadRole, (state, { id }) => ({
    ...state,
    loading: true,
    selectedRoleId: id,
    error: null
  })),

  on(RolesActions.loadRoleSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    selectedRole: data,
    error: null
  })),

  on(RolesActions.loadRoleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    selectedRole: null,
    error
  })),

  // ============================
  // RECHERCHE DE RÔLES
  // ============================

  on(RolesActions.searchRoles, (state, { searchTerm }) => ({
    ...state,
    loading: true,
    searchTerm,
    error: null
  })),

  on(RolesActions.searchRolesSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    roles: data.content,
    pagination: {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.number,
      pageSize: data.size
    },
    error: null
  })),

  on(RolesActions.searchRolesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // CRÉATION DE RÔLE
  // ============================

  on(RolesActions.createRole, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.createRoleSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    roles: [...state.roles, data],
    allRoles: [...state.allRoles, data],
    error: null
  })),

  on(RolesActions.createRoleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // MISE À JOUR DE RÔLE
  // ============================

  on(RolesActions.updateRole, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.updateRoleSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    roles: state.roles.map(role => role.id === data.id ? data : role),
    allRoles: state.allRoles.map(role => role.id === data.id ? data : role),
    selectedRole: state.selectedRole?.id === data.id ? data : state.selectedRole,
    error: null
  })),

  on(RolesActions.updateRoleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // SUPPRESSION DE RÔLE
  // ============================

  on(RolesActions.deleteRole, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.deleteRoleSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    roles: state.roles.filter(role => role.id !== id),
    allRoles: state.allRoles.filter(role => role.id !== id),
    selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
    selectedRoleId: state.selectedRoleId === id ? null : state.selectedRoleId,
    error: null
  })),

  on(RolesActions.deleteRoleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // VÉRIFICATIONS
  // ============================

  on(RolesActions.checkRoleNameAvailability, (state) => ({
    ...state,
    nameAvailability: null
  })),

  on(RolesActions.checkRoleNameAvailabilitySuccess, (state, { available }) => ({
    ...state,
    nameAvailability: { available }
  })),

  on(RolesActions.checkRoleNameAvailabilityFailure, (state, { error }) => ({
    ...state,
    nameAvailability: null,
    error
  })),

  on(RolesActions.checkRoleCanDelete, (state) => ({
    ...state,
    canDelete: null
  })),

  on(RolesActions.checkRoleCanDeleteSuccess, (state, { canDelete, reason }) => ({
    ...state,
    canDelete: { canDelete, reason }
  })),

  on(RolesActions.checkRoleCanDeleteFailure, (state, { error }) => ({
    ...state,
    canDelete: null,
    error
  })),

  // ============================
  // STATISTIQUES
  // ============================

  on(RolesActions.loadRolesStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.loadRolesStatisticsSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    statistics: data,
    error: null
  })),

  on(RolesActions.loadRolesStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // UTILISATEURS PAR RÔLE
  // ============================

  on(RolesActions.loadUsersByRole, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RolesActions.loadUsersByRoleSuccess, (state, { roleId, data }) => ({
    ...state,
    loading: false,
    usersByRole: {
      ...state.usersByRole,
      [roleId]: data.content
    },
    error: null
  })),

  on(RolesActions.loadUsersByRoleFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ============================
  // VALIDATION
  // ============================

  on(RolesActions.validateRoleData, (state) => ({
    ...state,
    validation: null
  })),

  on(RolesActions.validateRoleDataSuccess, (state, { valid, errors }) => ({
    ...state,
    validation: { valid, errors }
  })),

  on(RolesActions.validateRoleDataFailure, (state, { error }) => ({
    ...state,
    validation: null,
    error
  })),

  // ============================
  // UTILITAIRES
  // ============================

  on(RolesActions.selectRole, (state, { id }) => ({
    ...state,
    selectedRoleId: id
  })),

  on(RolesActions.setSearchTerm, (state, { searchTerm }) => ({
    ...state,
    searchTerm
  })),

  on(RolesActions.clearError, (state) => ({
    ...state,
    error: null
  })),

  on(RolesActions.resetRolesState, () => initialRolesState)
); 