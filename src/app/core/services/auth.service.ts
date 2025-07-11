import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { LoginRequest } from '../models/login/login.request.model';
import { UtilisateurResponse } from '../models/utilisateur/utilisateur.response.model';
import { LoginResponse } from '../models/login/login.response.model';
import { StatutUtilisateur } from '../models/utilisateur/statututilisateur.model';
import { RoleResponse } from '../models/role/role.response.model';
import { TypeCentre } from '../models/centre/typecentre.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UtilisateurResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private jwtHelper = new JwtHelperService();
  private readonly AUTH_API_URL = environment.authApiUrl;
  
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initAuthFromStorage();
  }

  /**
   * Vérifie si l'utilisateur est authentifié en fonction du token stocké
   */
  private initAuthFromStorage(): void {
    const token = this.getToken();
    
    if (!environment.production) {
      console.log('🔍 initAuthFromStorage - Token initial:', token);
    }
    
    // Vérifier que le token existe et a le bon format JWT (3 parties séparées par des points)
    if (!token || !this.isValidJWTFormat(token)) {
      if (!environment.production) {
        console.log('❌ Token absent ou format invalide');
      }
      this.clearAuthState();
      return;
    }
    
    try {
      // Vérifier si le token n'est pas expiré
      if (!this.jwtHelper.isTokenExpired(token)) {
        // Token valide, on charge les informations utilisateur
        const userInfo = this.getUserInfoFromToken(token);
        
        if (!environment.production) {
          console.log('✅ Token valide, utilisateur:', userInfo);
        }
        
        this.currentUserSubject.next(userInfo);
        this.isAuthenticatedSubject.next(true);
        
        // Configuration du timer d'expiration
        this.setTokenExpirationTimer(token);
        
        if (!environment.production) {
          console.log('✅ État d\'authentification restauré');
        }
      } else {
        // Token expiré, nettoyer l'état
        if (!environment.production) {
          console.log('⏰ Token expiré, nettoyage de l\'état');
        }
        this.clearAuthState();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation du token:', error);
      this.clearAuthState();
    }
  }

  /**
   * Vérifie si le token a le format JWT valide (3 parties séparées par des points)
   */
  private isValidJWTFormat(token: string): boolean {
    if (typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Nettoie l'état d'authentification
   */
  private clearAuthState(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.tokenExpiryKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Login avec username et password
   * @param loginRequest Données de connexion
   * @returns Observable avec la réponse d'authentification
   */
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.AUTH_API_URL}/login`, loginRequest)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Erreur de connexion', error);
          return throwError(() => new Error('Nom d\'utilisateur ou mot de passe incorrect'));
        })
      );
  }

  /**
   * Rafraîchit le token d'accès
   * @returns Observable avec la nouvelle réponse d'authentification
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(environment.refreshTokenKey);
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token not found'));
    }
    
    return this.http.post<LoginResponse>(`${this.AUTH_API_URL}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Erreur de rafraîchissement du token', error);
          this.logout();
          return throwError(() => new Error('Impossible de rafraîchir la session'));
        })
      );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    // Supprime les tokens du localStorage
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.tokenExpiryKey);
    
    // Réinitialise l'état d'authentification
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Annule le timer d'expiration
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
    
    // Redirige vers la page de connexion
    this.router.navigate(['/auth/login']);
  }

  /**
   * Vérifie si l'utilisateur est actuellement connecté
   * @returns true si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    // Vérifier à la fois l'état et la validité du token
    const token = this.getToken();
    const isAuthenticated = this.isAuthenticatedSubject.value;
    
    if (!token || !this.isValidJWTFormat(token)) {
      // Pas de token ou format invalide, s'assurer que l'état est cohérent
      if (isAuthenticated) {
        this.clearAuthState();
      }
      return false;
    }
    
    try {
      // Vérifier si le token n'est pas expiré
      if (this.jwtHelper.isTokenExpired(token)) {
        // Token expiré, nettoyer l'état
        if (!environment.production) {
          console.log('Token expiré dans isLoggedIn, nettoyage');
        }
        this.clearAuthState();
        return false;
      }
      
      // Token valide mais état pas synchronisé
      if (!isAuthenticated) {
        const userInfo = this.getUserInfoFromToken(token);
        this.currentUserSubject.next(userInfo);
        this.isAuthenticatedSubject.next(true);
        this.setTokenExpirationTimer(token);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token dans isLoggedIn:', error);
      this.clearAuthState();
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur courant a un rôle spécifique
   * @param role Rôle à vérifier
   * @returns true si l'utilisateur a le rôle spécifié
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    
    // Vérifications de sécurité
    if (!user) {
      console.log('🔒 hasRole: Aucun utilisateur connecté');
      return false;
    }
    
    if (!user.role) {
      console.log('🔒 hasRole: Utilisateur sans rôle défini');
      return false;
    }
    
    if (!user.role.nom) {
      console.log('🔒 hasRole: Rôle sans nom défini');
      return false;
    }
    
    const hasRoleResult = user.role.nom.includes(role);
    console.log(`🔒 hasRole: Vérification du rôle "${role}" pour l'utilisateur "${user.email}": ${hasRoleResult} (rôle actuel: "${user.role.nom}")`);
    
    return hasRoleResult;
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns Observable avec les informations utilisateur
   */
  getCurrentUser(): Observable<UtilisateurResponse | null> {
    return this.currentUser$;
  }

  /**
   * Récupère le token JWT stocké
   * @returns Token JWT ou null
   */
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  /**
   * Traite la réponse d'authentification
   * @param response Réponse d'authentification
   */
  private handleAuthResponse(response: LoginResponse): void {
    // Stocke le token
    localStorage.setItem(environment.tokenKey, response.token);
    
    // Extraire les informations utilisateur du token
    const userInfo = this.getUserInfoFromToken(response.token);
    
    // Calculer et stocker l'expiration basée sur le token JWT
    const expirationDate = this.jwtHelper.getTokenExpirationDate(response.token);
    if (expirationDate) {
      localStorage.setItem(environment.tokenExpiryKey, expirationDate.getTime().toString());
    }
    
    // Met à jour l'état d'authentification
    this.currentUserSubject.next(userInfo);
    this.isAuthenticatedSubject.next(true);
    
    // Configure le timer d'expiration
    this.setTokenExpirationTimer(response.token);
    
    if (!environment.production) {
      console.log('✅ Authentification réussie, utilisateur:', userInfo);
    }
  }

  /**
   * Extrait les informations utilisateur du token JWT
   * @param token Token JWT
   * @returns Informations utilisateur
   */
  private getUserInfoFromToken(token: string): UtilisateurResponse {
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      
      if (!decodedToken) {
        throw new Error('Token décodé invalide');
      }
      
      if (!environment.production) {
        console.log('🔍 Token décodé:', decodedToken);
      }
      
      // Gérer le rôle qui peut être un string ou un objet
      let roleInfo;
      if (typeof decodedToken.role === 'string') {
        // Si le rôle est un string dans le token
        roleInfo = {
          id: '',
          nom: decodedToken.role,
          description: `Rôle ${decodedToken.role}`,
          utilisateurs: []
        };
      } else if (decodedToken.role && typeof decodedToken.role === 'object') {
        // Si le rôle est un objet dans le token
        roleInfo = {
          nom: decodedToken.role || 'USER',
        };
      } else {
        // Rôle par défaut si rien n'est trouvé
        roleInfo = {
          nom: 'USER',
        };
      }
      
      // Extraire les informations utilisateur du token
      const userInfo: UtilisateurResponse = {
        id: decodedToken.id || '',
        matricule: decodedToken.matricule || '',
        nom: decodedToken.nom || '',
        prenom: decodedToken.prenom || '',
        email: decodedToken.email || decodedToken.sub || '',
        telephone: decodedToken.telephone || '',
        adresse: decodedToken.adresse || '',
        statut: decodedToken.statut !== undefined ? decodedToken.statut : StatutUtilisateur.ACTIF,
        role: roleInfo as RoleResponse,
        centre: {
          id: decodedToken.centreId || '',
          nom: decodedToken.centreNom || '',
          adresse:  '',
          telephone: '',
          email: '',
          siteWeb:  '',
          type: TypeCentre.CS,
        }
      };
      
      if (!environment.production) {
        console.log('👤 Utilisateur extrait du token:', userInfo);
        console.log('🔒 Rôle extrait:', roleInfo);
      }
      
      return userInfo;
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      throw error;
    }
  }

  /**
   * Configure le timer d'expiration du token
   * @param token Token JWT
   */
  private setTokenExpirationTimer(token: string): void {
    // Annule tout timer existant
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    // Calcule le temps restant avant expiration (avec marge de sécurité de 60s)
    const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
    if (!expirationDate) return;
    
    const expiresIn = expirationDate.getTime() - new Date().getTime() - 60000;
    
    // Si l'expiration est trop proche, déconnecte l'utilisateur
    if (expiresIn < 0) {
      if (!environment.production) {
        console.log('⏰ Token expiré, déconnexion automatique');
      }
      this.logout();
      return;
    }
    
    // Configure le timer pour déconnecter automatiquement
    this.tokenExpirationTimer = setTimeout(() => {
      if (!environment.production) {
        console.log('⏰ Token expiré, déconnexion automatique');
      }
      this.logout();
    }, expiresIn);
    
    if (!environment.production) {
      console.log(`⏰ Timer d'expiration configuré pour ${Math.round(expiresIn / 1000 / 60)} minutes`);
    }
  }

  /**
   * Force la vérification de l'état d'authentification
   * Utile après un rafraîchissement de page
   */
  checkAuthState(): void {
    if (!environment.production) {
      console.log('🔍 Vérification forcée de l\'état d\'authentification');
    }
    this.initAuthFromStorage();
  }
} 