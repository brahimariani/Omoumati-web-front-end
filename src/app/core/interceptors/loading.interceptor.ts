import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Intercepteur fonctionnel pour gérer les indicateurs de chargement
 * Version Angular 17+
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Vérifier si la requête est exclue de l'indicateur de chargement
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  // Activer l'indicateur de chargement
  loadingService.start();

  // Traiter la requête et désactiver l'indicateur quand terminé
  return next(req).pipe(
    finalize(() => {
      // Désactiver l'indicateur de chargement
      loadingService.complete();
    })
  );
};

/**
 * Détermine si une requête doit être exclue de l'indicateur de chargement
 * @param request Requête HTTP
 * @returns true si la requête doit être exclue
 */
function shouldSkipLoading(request: HttpRequest<any>): boolean {
  // Exclure les types de requêtes qui ne nécessitent pas d'indicateur de chargement
  // Par exemple, les requêtes de polling, les requêtes en arrière-plan, etc.
  
  // Exemple: vérifier le header personnalisé 'X-Skip-Loading'
  if (request.headers.get('X-Skip-Loading') === 'true') {
    return true;
  }
  
  // Exemple: exclure les requêtes spécifiques par URL
  const excludedUrls = [
    '/api/status',
    '/api/health',
    '/api/notifications/poll'
  ];
  
  return excludedUrls.some(url => request.url.includes(url));
}

/**
 * Classe intercepteur conservée pour compatibilité arrière
 * @deprecated Utiliser la fonction `loadingInterceptor` à la place
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Vérifier si la requête est exclue de l'indicateur de chargement
    if (shouldSkipLoading(request)) {
      return next.handle(request);
    }

    // Activer l'indicateur de chargement
    this.loadingService.start();

    // Traiter la requête et désactiver l'indicateur quand terminé
    return next.handle(request).pipe(
      finalize(() => {
        // Désactiver l'indicateur de chargement
        this.loadingService.complete();
      })
    );
  }
} 