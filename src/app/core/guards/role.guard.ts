import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard pour protéger les routes basées sur les rôles utilisateur
 * Vérifie si l'utilisateur possède le rôle requis pour accéder à une route
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  /**
   * Vérifie si l'utilisateur possède le rôle requis pour accéder à une route
   * @param route Route activée
   * @returns true si l'utilisateur possède le rôle requis, sinon redirige vers la page d'accès refusé
   */
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | boolean | UrlTree {
    // Récupère le rôle requis depuis les données de route (format unique)
    const requiredRole = route.data['role'] as string;
    // Récupère les rôles requis depuis les données de route (format tableau)
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRole && !requiredRoles) {
      console.warn('RoleGuard: Aucun rôle spécifié pour cette route');
      return true; // Si aucun rôle requis, on autorise l'accès
    }

    // Vérifie si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: window.location.pathname }
      });
      return false;
    }

    // Vérifie les rôles
    let hasRequiredRole = false;
    
    if (requiredRole) {
      hasRequiredRole = this.authService.hasRole(requiredRole);
    }
    
    if (requiredRoles && requiredRoles.length > 0) {
      hasRequiredRole = hasRequiredRole || this.hasAnyRole(requiredRoles);
    }

    if (hasRequiredRole) {
      return true;
    }

    // Si l'utilisateur n'a pas le rôle requis
    console.log('Accès refusé - rôle insuffisant');
    this.notificationService.error('Accès non autorisé pour votre rôle');
    
    // Rediriger vers le dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }

  /**
   * Vérifie si l'utilisateur possède au moins un des rôles requis
   * @param roles Liste des rôles à vérifier
   * @returns true si l'utilisateur possède au moins un des rôles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.authService.hasRole(role));
  }
} 