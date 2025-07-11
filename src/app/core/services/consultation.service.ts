import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ConsultationRequest } from '../models/consultation/consultation-request.model';
import { ConsultationResponse } from '../models/consultation/consultation-response.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly endpoint = `${environment.diagnostiqueApiUrl}consultations`;
  
  // Cache des consultations pour optimiser les performances
  private consultationsCache = new BehaviorSubject<ConsultationResponse[]>([]);
  public consultations$ = this.consultationsCache.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Créer une nouvelle consultation
   */
  createConsultation(consultationRequest: ConsultationRequest): Observable<ConsultationResponse> {
    return this.apiService.post<any>(this.endpoint, consultationRequest)
      .pipe(
        map(response => this.extractConsultationFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(consultation => {
          // Mettre à jour le cache après création
          const currentConsultations = this.consultationsCache.value;
          this.consultationsCache.next([...currentConsultations, consultation]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir toutes les consultations avec pagination
   */
  getAllConsultations(page: number = 0, size: number = 10, sortBy: string = 'date', sortDir: string = 'desc'): Observable<ApiResponse<ConsultationResponse[]>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };

    return this.apiService.get<ApiResponse<ConsultationResponse[]>>(this.endpoint, params)
      .pipe(
        tap(response => {
          // Mettre à jour le cache avec les nouvelles données
          const consultations = response.data || [];
          if (page === 0) {
            this.consultationsCache.next(consultations);
          } else {
            const currentConsultations = this.consultationsCache.value;
            this.consultationsCache.next([...currentConsultations, ...consultations]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir une consultation par ID
   */
  getConsultationById(id: string): Observable<ConsultationResponse> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => this.extractConsultationFromResponse(response, 'Consultation non trouvée')),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir toutes les consultations d'une grossesse
   */
  getConsultationsByGrossesse(grossesseId: string, page: number = 0, size: number = 20): Observable<ApiResponse<ConsultationResponse[]>> {
    const params = {
      grossesseId,
      page: page.toString(),
      size: size.toString(),
      sortBy: 'date',
      sortDir: 'desc'
    };

    return this.apiService.get<ApiResponse<ConsultationResponse[]>>(`${this.endpoint}/grossesse/${grossesseId}`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les consultations d'une grossesse (version simple pour le cache)
   */
  getConsultationsByGrossesseSimple(grossesseId: string): Observable<ConsultationResponse[]> {
    return this.apiService.get<any>(`${this.endpoint}/grossesse/${grossesseId}`)
      .pipe(
        map(response => this.extractConsultationsFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour une consultation
   */
  updateConsultation(id: string, consultationRequest: ConsultationRequest): Observable<ConsultationResponse> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, consultationRequest)
      .pipe(
        map(response => this.extractConsultationFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(updatedConsultation => {
          // Mettre à jour le cache après modification
          const currentConsultations = this.consultationsCache.value;
          const updatedConsultations = currentConsultations.map(consultation =>
            consultation.id === id ? updatedConsultation : consultation
          );
          this.consultationsCache.next(updatedConsultations);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer une consultation
   */
  deleteConsultation(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
      .pipe(
        tap(() => {
          // Mettre à jour le cache après suppression
          const currentConsultations = this.consultationsCache.value;
          const filteredConsultations = currentConsultations.filter(consultation => consultation.id !== id);
          this.consultationsCache.next(filteredConsultations);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des consultations par critères
   */
  searchConsultations(searchParams: {
    grossesseId?: string;
    dateDebut?: Date;
    dateFin?: Date;
    observation?: string;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<ConsultationResponse[]>> {
    const params: any = {
      page: (searchParams.page || 0).toString(),
      size: (searchParams.size || 10).toString()
    };

    if (searchParams.grossesseId) {
      params.grossesseId = searchParams.grossesseId;
    }
    if (searchParams.dateDebut) {
      params.dateDebut = searchParams.dateDebut.toISOString();
    }
    if (searchParams.dateFin) {
      params.dateFin = searchParams.dateFin.toISOString();
    }
    if (searchParams.observation) {
      params.observation = searchParams.observation;
    }

    return this.apiService.get<ApiResponse<ConsultationResponse[]>>(`${this.endpoint}/search`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les statistiques des consultations
   */
  getConsultationStats(grossesseId?: string): Observable<{
    totalConsultations: number;
    consultationsParMois: { mois: string; nombre: number; }[];
    derniereConsultation?: ConsultationResponse;
    prochaineConsultationPrevue?: Date;
  }> {
    const params = grossesseId ? { grossesseId } : undefined;

    return this.apiService.get<{
      totalConsultations: number;
      consultationsParMois: { mois: string; nombre: number; }[];
      derniereConsultation?: ConsultationResponse;
      prochaineConsultationPrevue?: Date;
    }>(`${this.endpoint}/stats`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Exporter les consultations au format PDF
   */
  exportConsultationsPdf(grossesseId: string): Observable<Blob> {
    const params = { grossesseId };
    return this.apiService.get<Blob>(`${this.endpoint}/export/pdf`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Exporter les consultations au format Excel
   */
  exportConsultationsExcel(grossesseId: string): Observable<Blob> {
    const params = { grossesseId };
    return this.apiService.get<Blob>(`${this.endpoint}/export/excel`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Vérifier si une consultation est due
   */
  checkConsultationDue(grossesseId: string): Observable<{
    isDue: boolean;
    daysSinceLastConsultation: number;
    recommendedDate: Date;
    lastConsultation?: ConsultationResponse;
  }> {
    const params = { grossesseId };
    return this.apiService.get<{
      isDue: boolean;
      daysSinceLastConsultation: number;
      recommendedDate: Date;
      lastConsultation?: ConsultationResponse;
    }>(`${this.endpoint}/check-due`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les modèles de consultations prédéfinis
   */
  getConsultationTemplates(): Observable<{
    id: string;
    nom: string;
    observation: string;
    typeConsultation: 'routine' | 'urgence' | 'controle';
  }[]> {
    return this.apiService.get<{
      id: string;
      nom: string;
      observation: string;
      typeConsultation: 'routine' | 'urgence' | 'controle';
    }[]>(`${this.endpoint}/templates`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Créer une consultation à partir d'un modèle
   */
  createConsultationFromTemplate(templateId: string, grossesseId: string, date?: Date): Observable<ConsultationResponse> {
    const requestData = {
      templateId,
      grossesseId,
      date: date?.toISOString() || new Date().toISOString()
    };

    return this.apiService.post<ApiResponse<ConsultationResponse>>(`${this.endpoint}/from-template`, requestData)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('Aucune donnée reçue du serveur');
          }
          return response.data;
        }),
        tap(consultation => {
          // Mettre à jour le cache après création
          const currentConsultations = this.consultationsCache.value;
          this.consultationsCache.next([...currentConsultations, consultation]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Nettoyer le cache des consultations
   */
  clearCache(): void {
    this.consultationsCache.next([]);
  }

  /**
   * Actualiser les consultations d'une grossesse
   */
  refreshConsultationsForGrossesse(grossesseId: string): Observable<ConsultationResponse[]> {
    return this.getConsultationsByGrossesseSimple(grossesseId);
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Erreur dans ConsultationService:', error);
    
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
          errorMessage = 'Consultation non trouvée';
          break;
        case 409:
          errorMessage = 'Conflit - Cette consultation existe déjà';
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
    }

    return throwError(() => new Error(errorMessage));
  };

  /**
   * Extraire une consultation depuis une réponse API (gère plusieurs formats)
   */
  private extractConsultationFromResponse(response: any, errorMessage: string = 'Format de réponse invalide'): ConsultationResponse {
    if (response && response.data) {
      // Format ApiResponse<ConsultationResponse>
      return response.data;
    } else if (response && response.id) {
      // Format direct ConsultationResponse
      return response;
    } else {
      throw new Error(errorMessage);
    }
  }

  /**
   * Extraire un tableau de consultations depuis une réponse API
   */
  private extractConsultationsFromResponse(response: any): ConsultationResponse[] {
    if (response && response.data && Array.isArray(response.data)) {
      // Format ApiResponse<ConsultationResponse[]>
      return response.data;
    } else if (response && Array.isArray(response)) {
      // Format direct ConsultationResponse[]
      return response;
    } else {
      return [];
    }
  }
} 