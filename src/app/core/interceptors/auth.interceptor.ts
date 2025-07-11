import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Intercepteur fonctionnel pour ajouter le token JWT aux requêtes et gérer le refresh token
 * Version Angular 17+
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ne pas ajouter de token pour certaines routes
  if (shouldSkipAuthHeader(req.url)) {
    return next(req);
  }

  // Ajoute le token aux en-têtes
  const authToken = authService.getToken();
  if (authToken) {
    req = addTokenHeader(req, authToken);
  }

  // Traite la requête et gère les erreurs
  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token expiré, on tente le refresh
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// Variables pour gérer le rafraîchissement du token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Ajoute le token JWT aux en-têtes de la requête
 * @param request Requête HTTP originale
 * @param token Token JWT
 * @returns Requête HTTP avec le token
 */
function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Gère les erreurs 401 (Unauthorized) en tentant de rafraîchir le token
 * @param request Requête HTTP originale
 * @param next Handler pour la chaîne d'intercepteurs
 * @param authService Service d'authentification
 * @returns Observable avec la réponse HTTP
 */
function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {
  // Si refresh déjà en cours, attendre qu'il termine
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        if (token) {
          return next(addTokenHeader(request, token));
        }
        // Si pas de token, propager l'erreur
        return throwError(() => new Error('No token available'));
      })
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  // Tente de rafraîchir le token
  return authService.refreshToken().pipe(
    switchMap(response => {
      isRefreshing = false;
      refreshTokenSubject.next(response.token);
      return next(addTokenHeader(request, response.token));
    }),
    catchError(error => {
      isRefreshing = false;
      authService.logout();
      return throwError(() => error);
    }),
    finalize(() => {
      isRefreshing = false;
    })
  );
}

/**
 * Détermine si une URL doit être exempte d'en-tête d'authentification
 * @param url URL de la requête
 * @returns true si l'URL doit être exempte
 */
function shouldSkipAuthHeader(url: string): boolean {
  // Exemples d'URLs qui ne nécessitent pas d'authentification
  const authEndpoints = [
    `${environment.authApiUrl}/login`,
    `${environment.authApiUrl}/register`,
    `${environment.authApiUrl}/refresh-token`
  ];

  // Vérifier si l'URL est dans la liste des exemptions
  return authEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Classe intercepteur conservée pour compatibilité arrière
 * @deprecated Utiliser la fonction `authInterceptor` à la place
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne pas ajouter de token pour certaines routes
    if (shouldSkipAuthHeader(request.url)) {
      return next.handle(request);
    }

    // Ajoute le token aux en-têtes
    const authToken = this.authService.getToken();
    if (authToken) {
      request = addTokenHeader(request, authToken);
    }

    // Traite la requête et gère les erreurs
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Token expiré, on tente le refresh avec une fonction adaptée
          return handleLegacyRefresh(request, next, this.authService);
        }
        return throwError(() => error);
      })
    );
  }
}

/**
 * Version compatible avec l'ancienne API pour le refresh token
 */
function handleLegacyRefresh(
  request: HttpRequest<any>,
  next: HttpHandler,
  authService: AuthService
): Observable<HttpEvent<any>> {
  // Si refresh déjà en cours, attendre qu'il termine
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        if (token) {
          return next.handle(addTokenHeader(request, token));
        }
        return throwError(() => new Error('No token available'));
      })
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap(response => {
      isRefreshing = false;
      refreshTokenSubject.next(response.token);
      return next.handle(addTokenHeader(request, response.token));
    }),
    catchError(error => {
      isRefreshing = false;
      authService.logout();
      return throwError(() => error);
    }),
    finalize(() => {
      isRefreshing = false;
    })
  );
} 