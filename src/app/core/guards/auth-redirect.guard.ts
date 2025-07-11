import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour rediriger les utilisateurs déjà authentifiés
 * Empêche l'accès aux pages de connexion/inscription si déjà connecté
 */
@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Vérifie si l'utilisateur peut accéder aux pages d'authentification
   * @returns true si l'utilisateur n'est pas connecté, sinon redirige vers le dashboard
   */
  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Utilisateur déjà connecté, rediriger vers le dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
        // Utilisateur non connecté, permettre l'accès à la page de connexion
        return true;
      })
    );
  }
} 