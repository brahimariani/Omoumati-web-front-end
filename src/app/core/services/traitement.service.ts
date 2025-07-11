import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TraitementRequest } from '../models/traitement/traitement-request.model';
import { TraitementResponse } from '../models/traitement/traitement-response.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TraitementService {
  private readonly endpoint = `${environment.diagnostiqueApiUrl}traitements`;
  
  // Cache des traitements pour optimiser les performances
  private traitementsCache = new BehaviorSubject<TraitementResponse[]>([]);
  public traitements$ = this.traitementsCache.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Créer un nouveau traitement
   */
  createTraitement(traitementRequest: TraitementRequest): Observable<TraitementResponse> {
    return this.apiService.post<any>(this.endpoint, traitementRequest)
      .pipe(
        map(response => this.extractTraitementFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(traitement => {
          // Mettre à jour le cache après création
          const currentTraitements = this.traitementsCache.value;
          this.traitementsCache.next([...currentTraitements, traitement]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les traitements avec pagination
   */
  getAllTraitements(page: number = 0, size: number = 10, sortBy: string = 'dateDebut', sortDir: string = 'desc'): Observable<ApiResponse<TraitementResponse[]>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };

    return this.apiService.get<ApiResponse<TraitementResponse[]>>(this.endpoint, params)
      .pipe(
        tap(response => {
          // Mettre à jour le cache avec les nouvelles données
          const traitements = response.data || [];
          if (page === 0) {
            this.traitementsCache.next(traitements);
          } else {
            const currentTraitements = this.traitementsCache.value;
            this.traitementsCache.next([...currentTraitements, ...traitements]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir un traitement par ID
   */
  getTraitementById(id: string): Observable<TraitementResponse> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => this.extractTraitementFromResponse(response, 'Traitement non trouvé')),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les traitements d'une consultation
   */
  getTraitementsByConsultation(consultationId: string, page: number = 0, size: number = 20): Observable<ApiResponse<TraitementResponse[]>> {
    const params = {
      consultationId,
      page: page.toString(),
      size: size.toString(),
      sortBy: 'dateDebut',
      sortDir: 'desc'
    };

    return this.apiService.get<ApiResponse<TraitementResponse[]>>(`${this.endpoint}/consultation/${consultationId}`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les traitements d'une consultation (version simple pour le cache)
   */
  getTraitementsByConsultationSimple(consultationId: string): Observable<TraitementResponse[]> {
    return this.apiService.get<any>(`${this.endpoint}/consultation/${consultationId}`)
      .pipe(
        map(response => this.extractTraitementsFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les traitements actifs (en cours)
   */
  getTraitementsActifs(consultationId?: string): Observable<TraitementResponse[]> {
    const endpoint = consultationId 
      ? `${this.endpoint}/actifs/consultation/${consultationId}`
      : `${this.endpoint}/actifs`;
    
    return this.apiService.get<any>(endpoint)
      .pipe(
        map(response => this.extractTraitementsFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les traitements par médicament
   */
  getTraitementsByMedicament(medicament: string, page: number = 0, size: number = 10): Observable<ApiResponse<TraitementResponse[]>> {
    const params = {
      medicament,
      page: page.toString(),
      size: size.toString(),
      sortBy: 'dateDebut',
      sortDir: 'desc'
    };

    return this.apiService.get<ApiResponse<TraitementResponse[]>>(`${this.endpoint}/medicament`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les traitements par période
   */
  getTraitementsByPeriode(dateDebut: Date, dateFin: Date, consultationId?: string): Observable<TraitementResponse[]> {
    const params = {
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<any>(`${this.endpoint}/periode`, params)
      .pipe(
        map(response => this.extractTraitementsFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour un traitement
   */
  updateTraitement(id: string, traitementRequest: TraitementRequest): Observable<TraitementResponse> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, traitementRequest)
      .pipe(
        map(response => this.extractTraitementFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(updatedTraitement => {
          // Mettre à jour le cache après modification
          const currentTraitements = this.traitementsCache.value;
          const updatedTraitements = currentTraitements.map(traitement =>
            traitement.id === id ? updatedTraitement : traitement
          );
          this.traitementsCache.next(updatedTraitements);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer un traitement
   */
  deleteTraitement(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
      .pipe(
        tap(() => {
          // Mettre à jour le cache après suppression
          const currentTraitements = this.traitementsCache.value;
          const filteredTraitements = currentTraitements.filter(traitement => traitement.id !== id);
          this.traitementsCache.next(filteredTraitements);
        }),
        catchError(this.handleError)
      );
  }

 

 
 

 

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.traitementsCache.next([]);
  }

  /**
   * Recharger le cache avec les traitements d'une consultation
   */
  refreshCacheForConsultation(consultationId: string): Observable<TraitementResponse[]> {
    return this.getTraitementsByConsultationSimple(consultationId)
      .pipe(
        tap(traitements => {
          this.traitementsCache.next(traitements);
        })
      );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Erreur dans TraitementService:', error);
    
    let errorMessage = 'Une erreur est survenue lors de l\'opération';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides - Veuillez vérifier les informations saisies';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès interdit - Permissions insuffisantes';
          break;
        case 404:
          errorMessage = 'Traitement non trouvé';
          break;
        case 409:
          errorMessage = 'Conflit - Ce traitement existe déjà ou chevauche avec un autre';
          break;
        case 422:
          errorMessage = 'Données invalides - Veuillez corriger les erreurs';
          break;
        case 500:
          errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }

      // Messages d'erreur spécifiques aux traitements
      if (error.error?.message) {
        if (error.error.message.includes('medicament')) {
          errorMessage = 'Erreur liée au médicament - Veuillez vérifier le nom du médicament';
        } else if (error.error.message.includes('posologie')) {
          errorMessage = 'Erreur de posologie - Veuillez vérifier la posologie';
        } else if (error.error.message.includes('date')) {
          errorMessage = 'Erreur de dates - Veuillez vérifier les dates de début et de fin';
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  };

  /**
   * Extraire un traitement depuis une réponse API (gère plusieurs formats)
   */
  private extractTraitementFromResponse(response: any, errorMessage: string = 'Format de réponse invalide'): TraitementResponse {
    if (response && response.data) {
      // Format ApiResponse<TraitementResponse>
      return response.data;
    } else if (response && response.id) {
      // Format direct TraitementResponse
      return response;
    } else {
      throw new Error(errorMessage);
    }
  }

  /**
   * Extraire un tableau de traitements depuis une réponse API
   */
  private extractTraitementsFromResponse(response: any): TraitementResponse[] {
    if (response && response.data && Array.isArray(response.data)) {
      // Format ApiResponse<TraitementResponse[]>
      return response.data;
    } else if (response && Array.isArray(response)) {
      // Format direct TraitementResponse[]
      return response;
    } else {
      return [];
    }
  }
} 