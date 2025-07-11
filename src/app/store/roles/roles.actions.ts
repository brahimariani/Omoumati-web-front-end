import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RoleRequest } from '../../core/models/role/role.request.model';
import { RoleResponse } from '../../core/models/role/role.response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des rôles
 */
export const RolesActions = createActionGroup({
  source: 'Roles',
  events: {
    // Chargement de tous les rôles
    'Load Roles': props<{ page?: number; size?: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Roles Success': props<{ data: PageResponse<RoleResponse> }>(),
    'Load Roles Failure': props<{ error: string }>(),
    
    // Chargement de tous les rôles (simple, sans pagination)
    'Load All Roles Simple': emptyProps(),
    'Load All Roles Simple Success': props<{ data: RoleResponse[] }>(),
    'Load All Roles Simple Failure': props<{ error: string }>(),
    
    // Chargement d'un rôle spécifique
    'Load Role': props<{ id: string }>(),
    'Load Role Success': props<{ data: RoleResponse }>(),
    'Load Role Failure': props<{ error: string }>(),
    
    // Recherche de rôles
    'Search Roles': props<{ searchTerm: string; page?: number; size?: number }>(),
    'Search Roles Success': props<{ data: PageResponse<RoleResponse> }>(),
    'Search Roles Failure': props<{ error: string }>(),
    
    // Création d'un rôle
    'Create Role': props<{ request: RoleRequest }>(),
    'Create Role Success': props<{ data: RoleResponse }>(),
    'Create Role Failure': props<{ error: string }>(),
    
    // Mise à jour d'un rôle
    'Update Role': props<{ id: string; request: RoleRequest }>(),
    'Update Role Success': props<{ data: RoleResponse }>(),
    'Update Role Failure': props<{ error: string }>(),
    
    // Suppression d'un rôle
    'Delete Role': props<{ id: string }>(),
    'Delete Role Success': props<{ id: string }>(),
    'Delete Role Failure': props<{ error: string }>(),
    
    // Vérification de disponibilité du nom
    'Check Role Name Availability': props<{ nom: string; excludeRoleId?: string }>(),
    'Check Role Name Availability Success': props<{ available: boolean }>(),
    'Check Role Name Availability Failure': props<{ error: string }>(),
    
    // Vérification de possibilité de suppression
    'Check Role Can Delete': props<{ id: string }>(),
    'Check Role Can Delete Success': props<{ canDelete: boolean; reason?: string }>(),
    'Check Role Can Delete Failure': props<{ error: string }>(),
    
    // Statistiques des rôles
    'Load Roles Statistics': emptyProps(),
    'Load Roles Statistics Success': props<{ 
      data: {
        total: number;
        utilisateursParRole: { [key: string]: number };
        rolesLesUtilises: Array<{ nom: string; count: number }>;
      }
    }>(),
    'Load Roles Statistics Failure': props<{ error: string }>(),
    
    // Utilisateurs par rôle
    'Load Users By Role': props<{ roleId: string; page?: number; size?: number }>(),
    'Load Users By Role Success': props<{ roleId: string; data: PageResponse<any> }>(),
    'Load Users By Role Failure': props<{ error: string }>(),
    
    // Utilitaires
    'Reset Roles State': emptyProps(),
    'Clear Error': emptyProps(),
    'Select Role': props<{ id: string | null }>(),
    'Set Search Term': props<{ searchTerm: string | null }>(),
    
    // Actions de validation
    'Validate Role Data': props<{ roleData: RoleRequest; isUpdate?: boolean }>(),
    'Validate Role Data Success': props<{ valid: boolean; errors?: string[] }>(),
    'Validate Role Data Failure': props<{ error: string }>()
  }
}); 