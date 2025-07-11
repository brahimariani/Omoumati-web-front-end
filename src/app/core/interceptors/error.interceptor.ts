import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

/**
 * Intercepteur fonctionnel pour la gestion globale des erreurs HTTP
 * Version Angular 17+
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let customError: HttpErrorResponse;
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        customError = handleClientSideError(error, notificationService);
      } else {
        // Erreur côté serveur
        customError = handleServerSideError(error, notificationService, router);
      }

      // Log l'erreur pour debugging
      console.error(`${req.method} ${req.url}`, error);
      
      // Propage l'erreur personnalisée pour les traitements spécifiques dans les services
      return throwError(() => customError);
    })
  );
};

/**
 * Gère les erreurs côté client (réseau, etc.)
 * @param error Erreur HTTP
 * @param notificationService Service de notification
 */
function handleClientSideError(
  error: HttpErrorResponse, 
  notificationService: NotificationService
): HttpErrorResponse {
  // Vérifie si c'est une erreur de connexion
  if (!navigator.onLine) {
    notificationService.error('Vérifiez votre connexion internet.', 'Erreur de connexion');
    return error;
  }

  // Autres erreurs client
  notificationService.error(
    'Une erreur est survenue. Veuillez réessayer.',
    'Erreur'
  );
  return error;
}

/**
 * Gère les erreurs côté serveur avec différents codes HTTP
 * @param error Erreur HTTP
 * @param notificationService Service de notification
 * @param router Router Angular
 */
function handleServerSideError(
  error: HttpErrorResponse, 
  notificationService: NotificationService,
  router: Router
): HttpErrorResponse {
  // Extraction du message d'erreur de l'API si disponible
  const apiErrorMessage = extractApiErrorMessage(error);
  let customMessage = '';
  
  switch (error.status) {
    case 0:
      customMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
      notificationService.error(customMessage, 'Erreur de connexion');
      break;
    case 400: // Bad Request
      customMessage = apiErrorMessage || 'Requête invalide. Vérifiez les données saisies.';
      notificationService.error(customMessage, 'Erreur 400');
      break;
      
    case 401: // Unauthorized
      // Géré par l'AuthInterceptor pour le refresh token
      // Ce cas ne devrait être atteint que si le refresh token a échoué
      customMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      if (!window.location.href.includes('/auth/login')) {
        notificationService.error(customMessage, 'Erreur d\'authentification');
      }
      break;
      
    case 403: // Forbidden
      customMessage = 'Vous n\'avez pas les droits nécessaires pour cette action.';
      notificationService.error(customMessage, 'Accès refusé');
      router.navigate(['/forbidden']);
      break;
      
    case 404: // Not Found
      customMessage = apiErrorMessage || 'La ressource demandée n\'existe pas.';
      notificationService.error(customMessage, 'Ressource introuvable');
      break;
      
    case 409: // Conflict
      customMessage = apiErrorMessage || 'Conflit de données. La ressource existe déjà.';
      notificationService.warning(customMessage, 'Conflit');
      break;
      
    case 422: // Unprocessable Entity
      customMessage = apiErrorMessage || 'Données invalides. Vérifiez les champs du formulaire.';
      notificationService.error(customMessage, 'Validation échouée');
      break;
      
    case 500: // Internal Server Error
      customMessage = 'Une erreur est survenue sur le serveur. L\'équipe technique a été notifiée.';
      notificationService.error(customMessage, 'Erreur serveur');
      break;
      
    case 503: // Service Unavailable
      customMessage = 'Le service est temporairement indisponible. Veuillez réessayer plus tard.';
      notificationService.error(customMessage, 'Service indisponible');
      break;
      
    default:
      customMessage = apiErrorMessage || 'Une erreur est survenue. Veuillez réessayer.';
      notificationService.error(customMessage, `Erreur ${error.status}`);
      break;
  }
  
  return createCustomError(error, customMessage);
}

/**
 * Extrait le message d'erreur renvoyé par l'API
 * @param error Erreur HTTP
 * @returns Message d'erreur ou null
 */
function extractApiErrorMessage(error: HttpErrorResponse): string | null {
  if (!error.error) {
    return null;
  }

  // Formats d'erreur courants des APIs Spring Boot
  if (typeof error.error === 'string') {
    return error.error;
  }

  if (error.error.message) {
    return error.error.message;
  }

  if (error.error.error) {
    return error.error.error;
  }

  if (error.error.errors && Array.isArray(error.error.errors)) {
    return error.error.errors.join(', ');
  }

  return null;
}

/**
 * Crée une erreur avec un message personnalisé pour les composants
 * @param originalError Erreur originale
 * @param customMessage Message personnalisé
 * @returns Erreur avec propriété customMessage
 */
function createCustomError(originalError: HttpErrorResponse, customMessage: string): HttpErrorResponse {
  const customError = new HttpErrorResponse({
    error: originalError.error,
    headers: originalError.headers,
    status: originalError.status,
    statusText: originalError.statusText,
    url: originalError.url || undefined
  });
  
  // Ajouter le message personnalisé
  (customError as any).customMessage = customMessage;
  
  return customError;
}

/**
 * Classe intercepteur conservée pour compatibilité arrière
 * @deprecated Utiliser la fonction `errorInterceptor` à la place
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let customError: HttpErrorResponse;
        
        if (error.error instanceof ErrorEvent) {
          customError = handleClientSideError(error, this.notificationService);
        } else {
          customError = handleServerSideError(error, this.notificationService, this.router);
        }

        console.error(`${request.method} ${request.url}`, error);
        
        return throwError(() => customError);
      })
    );
  }
} 