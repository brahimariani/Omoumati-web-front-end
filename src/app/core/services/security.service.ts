import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { AuthService } from './auth.service';

export interface SecurityConfig {
  allowedRoles?: string[];
  requiredRole?: string;
  requireAuth?: boolean;
  allowAnonymous?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  constructor(
    private authService: AuthService,
    private store: Store
  ) {}

  /**
   * Vérifie si l'utilisateur peut accéder à une ressource
   */
  canAccess(config: SecurityConfig): Observable<boolean> {
    return this.store.select(selectCurrentUser).pipe(
      map(user => {
        // Permettre l'accès anonyme si configuré
        if (config.allowAnonymous) {
          return true;
        }

        // Vérifier l'authentification si requise
        if (config.requireAuth !== false && !user) {
          return false;
        }

        // Si pas d'utilisateur mais pas d'auth requise
        if (!user) {
          return true;
        }

        // Vérifier les rôles spécifiques
        if (config.requiredRole) {
          return this.authService.hasRole(config.requiredRole);
        }

        if (config.allowedRoles && config.allowedRoles.length > 0) {
          return config.allowedRoles.some(role => this.authService.hasRole(role));
        }

        // Par défaut, autoriser si connecté
        return true;
      })
    );
  }

  /**
   * Vérifie si l'utilisateur peut modifier une ressource
   */
  canEdit(resourceOwnerId?: string): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    }

    // Admin peut tout modifier
    if (this.authService.hasRole('ADMIN')) {
      return true;
    }

    // Docteur peut modifier les ressources médicales
    if (this.authService.hasRole('DOCTOR')) {
      return true;
    }

    // TODO: Ajouter la vérification du propriétaire quand getCurrentUser sera disponible
    // if (resourceOwnerId && currentUser.id === resourceOwnerId) {
    //   return true;
    // }

    return false;
  }

  /**
   * Vérifie si l'utilisateur peut supprimer une ressource
   */
  canDelete(resourceOwnerId?: string): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    }

    // Seuls les admin peuvent supprimer par défaut
    return this.authService.hasRole('ADMIN');
    
    // TODO: Ajouter la vérification du propriétaire quand getCurrentUser sera disponible
    // || (resourceOwnerId && currentUser.id === resourceOwnerId);
  }

  /**
   * Obtient les permissions pour l'interface utilisateur
   */
  getUIPermissions(): Observable<{
    canCreatePatient: boolean;
    canEditPatient: boolean;
    canDeletePatient: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
  }> {
    return this.store.select(selectCurrentUser).pipe(
      map(user => {
        if (!user) {
          return {
            canCreatePatient: false,
            canEditPatient: false,
            canDeletePatient: false,
            canViewReports: false,
            canManageUsers: false,
            canManageSettings: false
          };
        }

        const isAdmin = this.authService.hasRole('ADMIN');
        const isDoctor = this.authService.hasRole('DOCTOR');
        const isNurse = this.authService.hasRole('NURSE');

        return {
          canCreatePatient: isAdmin || isDoctor,
          canEditPatient: isAdmin || isDoctor,
          canDeletePatient: isAdmin,
          canViewReports: isAdmin || isDoctor || isNurse,
          canManageUsers: isAdmin,
          canManageSettings: isAdmin
        };
      })
    );
  }
} 