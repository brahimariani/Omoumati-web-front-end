import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UtilisateurRequest } from '../../core/models/utilisateur/utlisateur.request.model';
import { UtilisateurResponse } from '../../core/models/utilisateur/utilisateur.response.model';
import { UtilisateurUpdateProfileRequest } from '../../core/models/utilisateur/utilisateur-update-profile.model';
import { PasswordChangeRequest } from '../../core/models/login/change-password-request.model';
import { StatutUtilisateur } from '../../core/models/utilisateur/statututilisateur.model';
import { ApiResponse, PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des utilisateurs
 */
export const UtilisateursActions = createActionGroup({
  source: 'Utilisateurs',
  events: {
    // Chargement de tous les utilisateurs
    'Load Utilisateurs': props<{ page?: number; size?: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Utilisateurs Success': props<{ data: PageResponse<UtilisateurResponse> }>(),
    'Load Utilisateurs Failure': props<{ error: string }>(),
    
    // Chargement d'un utilisateur spécifique
    'Load Utilisateur': props<{ id: string }>(),
    'Load Utilisateur Success': props<{ data: UtilisateurResponse }>(),
    'Load Utilisateur Failure': props<{ error: string }>(),
    
    // Recherche d'utilisateurs
    'Search Utilisateurs': props<{ searchTerm: string; page?: number; size?: number }>(),
    'Search Utilisateurs Success': props<{ data: PageResponse<UtilisateurResponse> }>(),
    'Search Utilisateurs Failure': props<{ error: string }>(),
    
    // Création d'un utilisateur
    'Create Utilisateur': props<{ request: UtilisateurRequest }>(),
    'Create Utilisateur Success': props<{ data: UtilisateurResponse }>(),
    'Create Utilisateur Failure': props<{ error: string }>(),
    
    // Mise à jour d'un utilisateur
    'Update Utilisateur': props<{ id: string; request: UtilisateurRequest }>(),
    'Update Utilisateur Success': props<{ data: UtilisateurResponse }>(),
    'Update Utilisateur Failure': props<{ error: string }>(),
    
    // Suppression d'un utilisateur
    'Delete Utilisateur': props<{ id: string }>(),
    'Delete Utilisateur Success': props<{ id: string }>(),
    'Delete Utilisateur Failure': props<{ error: string }>(),
    
    // Filtrage par rôle
    'Filter By Role': props<{ roleId: string; page?: number; size?: number }>(),
    'Filter By Role Success': props<{ data: PageResponse<UtilisateurResponse> }>(),
    'Filter By Role Failure': props<{ error: string }>(),
    
    // Filtrage par statut
    'Filter By Status': props<{ statut: StatutUtilisateur; page?: number; size?: number }>(),
    'Filter By Status Success': props<{ data: PageResponse<UtilisateurResponse> }>(),
    'Filter By Status Failure': props<{ error: string }>(),
    
    // Filtrage par centre
    'Filter By Centre': props<{ centreId: string; page?: number; size?: number }>(),
    'Filter By Centre Success': props<{ data: PageResponse<UtilisateurResponse> }>(),
    'Filter By Centre Failure': props<{ error: string }>(),
    
    // Filtrage avancé
    'Filter Utilisateurs': props<{ 
      filters: {
        searchTerm?: string;
        roleId?: string;
        statut?: StatutUtilisateur;
        centreId?: string;
        dateCreationDebut?: string;
        dateCreationFin?: string;
      };
      page?: number; 
      size?: number;
    }>(),
    'Filter Utilisateurs Success': props<{ data: PageResponse<UtilisateurResponse> }>(),
    'Filter Utilisateurs Failure': props<{ error: string }>(),
    
    // Changement de statut
    'Toggle User Status': props<{ userId: string; newStatus: StatutUtilisateur }>(),
    'Toggle User Status Success': props<{ data: UtilisateurResponse }>(),
    'Toggle User Status Failure': props<{ error: string }>(),
    
    // Actions spécialisées de statut
    'Activate User': props<{ userId: string }>(),
    'Activate User Success': props<{ data: UtilisateurResponse }>(),
    'Activate User Failure': props<{ error: string }>(),
    
    'Suspend User': props<{ userId: string }>(),
    'Suspend User Success': props<{ data: UtilisateurResponse }>(),
    'Suspend User Failure': props<{ error: string }>(),
    
    'Deactivate User': props<{ userId: string }>(),
    'Deactivate User Success': props<{ data: UtilisateurResponse }>(),
    'Deactivate User Failure': props<{ error: string }>(),
    
    // Réinitialisation de mot de passe
    'Reset User Password': props<{ userId: string; newPassword?: string }>(),
    'Reset User Password Success': props<{ userId: string; temporaryPassword: string }>(),
    'Reset User Password Failure': props<{ error: string }>(),
    
    // Changement de mot de passe
    'Change Password': props<{ userId: string; passwordData: PasswordChangeRequest }>(),
    'Change Password Success': emptyProps(),
    'Change Password Failure': props<{ error: string }>(),
    
    // Gestion du profil
    'Load Current User Profile': emptyProps(),
    'Load Current User Profile Success': props<{ data: UtilisateurResponse }>(),
    'Load Current User Profile Failure': props<{ error: string }>(),
    
    'Update Current User Profile': props<{ userData: UtilisateurUpdateProfileRequest }>(),
    'Update Current User Profile Success': props<{ data: UtilisateurResponse }>(),
    'Update Current User Profile Failure': props<{ error: string }>(),
    
    'Update User Profile': props<{ userId: string; userData: UtilisateurUpdateProfileRequest }>(),
    'Update User Profile Success': props<{ data: UtilisateurResponse }>(),
    'Update User Profile Failure': props<{ error: string }>(),
    
    // Statistiques
    'Load Users Statistics': emptyProps(),
    'Load Users Statistics Success': props<{ 
      data: {
        total: number;
        actifs: number;
        inactifs: number;
        suspendus: number;
        parRole: { [key: string]: number };
        parCentre: { [key: string]: number };
      }
    }>(),
    'Load Users Statistics Failure': props<{ error: string }>(),
    
    // Validation
    'Check Email Availability': props<{ email: string; excludeUserId?: string }>(),
    'Check Email Availability Success': props<{ available: boolean }>(),
    'Check Email Availability Failure': props<{ error: string }>(),
    
    'Validate User Data': props<{ userData: UtilisateurRequest; isUpdate?: boolean }>(),
    'Validate User Data Success': props<{ valid: boolean; errors?: string[] }>(),
    'Validate User Data Failure': props<{ error: string }>(),
    
    // Utilitaires
    'Reset Utilisateurs State': emptyProps(),
    'Clear Error': emptyProps(),
    'Select Utilisateur': props<{ id: string | null }>(),
    'Set Search Term': props<{ searchTerm: string | null }>(),
    'Set Filters': props<{ 
      filters: {
        roleId?: string;
        statut?: StatutUtilisateur;
        centreId?: string;
      } | null;
    }>()
  }
});