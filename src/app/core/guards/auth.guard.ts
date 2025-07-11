import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour protéger les routes nécessitant une authentification
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Vérifie si l'utilisateur peut accéder à une route
   * @returns true si l'utilisateur est authentifié, sinon redirige vers la page de connexion
   */
  canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux routes enfants
   * @returns true si l'utilisateur est authentifié, sinon redirige vers la page de connexion
   */
  canActivateChild(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  /**
   * Vérifie si l'utilisateur peut charger un module
   * @returns true si l'utilisateur est authentifié, sinon redirige vers la page de connexion
   */
  canLoad(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  /**
   * Vérifie l'état d'authentification
   * @returns true si l'utilisateur est authentifié, sinon redirige vers la page de connexion
   */
  private checkAuth(): Observable<boolean> | boolean {
    // Debug : vérifier l'état d'authentification
    const isLoggedIn = this.authService.isLoggedIn();
    const currentPath = window.location.pathname;
    
    console.log('🔒 AuthGuard Debug:', {
      isLoggedIn,
      currentPath,
      token: !!this.authService.getToken()
    });
    
    // Si déjà connecté, autoriser l'accès
    if (isLoggedIn) {
      console.log('✅ Utilisateur authentifié - accès autorisé');
      return true;
    }
    
    // Rediriger vers la page de connexion si pas connecté
    console.log('❌ Utilisateur non authentifié - redirection vers login');
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: currentPath }
    });
    
    return false;
  }
} 