import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ExamenCliniqueRequest } from '../models/examen_clinique/examen-clinique-request.model';
import { ExamenCliniqueResponse } from '../models/examen_clinique/examen-clinique-response.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamenCliniqueService {
  private readonly endpoint = `${environment.diagnostiqueApiUrl}examens-cliniques`;
  
  // Cache des examens cliniques pour optimiser les performances
  private examensCliniquesCache = new BehaviorSubject<ExamenCliniqueResponse[]>([]);
  public examensCliniques$ = this.examensCliniquesCache.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Créer un nouvel examen clinique
   */
  createExamenClinique(examenRequest: ExamenCliniqueRequest): Observable<ExamenCliniqueResponse> {
    return this.apiService.post<any>(this.endpoint, examenRequest)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(examen => {
          // Mettre à jour le cache après création
          const currentExamens = this.examensCliniquesCache.value;
          this.examensCliniquesCache.next([...currentExamens, examen]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les examens cliniques avec pagination
   */
  getAllExamensCliniques(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'desc'): Observable<ApiResponse<ExamenCliniqueResponse[]>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };

    return this.apiService.get<ApiResponse<ExamenCliniqueResponse[]>>(this.endpoint, params)
      .pipe(
        tap(response => {
          // Mettre à jour le cache avec les nouvelles données
          const examens = response.data || [];
          if (page === 0) {
            this.examensCliniquesCache.next(examens);
          } else {
            const currentExamens = this.examensCliniquesCache.value;
            this.examensCliniquesCache.next([...currentExamens, ...examens]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir un examen clinique par ID
   */
  getExamenCliniqueById(id: string): Observable<ExamenCliniqueResponse> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Examen clinique non trouvé')),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les examens cliniques d'une consultation
   */
  getExamensByConsultation(consultationId: string, page: number = 0, size: number = 20): Observable<ApiResponse<ExamenCliniqueResponse[]>> {
    const params = {
      consultationId,
      page: page.toString(),
      size: size.toString(),
      sortBy: 'id',
      sortDir: 'desc'
    };

    return this.apiService.get<ApiResponse<ExamenCliniqueResponse[]>>(`${this.endpoint}/consultation/${consultationId}`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens cliniques d'une consultation (version simple pour le cache)
   */
  getExamensByConsultationSimple(consultationId: string): Observable<ExamenCliniqueResponse[]> {
    return this.apiService.get<any>(`${this.endpoint}/consultation/${consultationId}`)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens cliniques récents
   */
  getExamensRecents(consultationId?: string, limit: number = 5): Observable<ExamenCliniqueResponse[]> {
    const params = {
      ...(consultationId && { consultationId }),
      limit: limit.toString(),
      sortBy: 'id',
      sortDir: 'desc'
    };

    return this.apiService.get<any>(`${this.endpoint}/recents`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens cliniques par critères vitaux
   */
  getExamensBySignesVitaux(tensionMin?: number, tensionMax?: number, temperatureMin?: number, temperatureMax?: number, consultationId?: string): Observable<ExamenCliniqueResponse[]> {
    const params: any = {};
    
    if (tensionMin !== undefined) params.tensionMin = tensionMin.toString();
    if (tensionMax !== undefined) params.tensionMax = tensionMax.toString();
    if (temperatureMin !== undefined) params.temperatureMin = temperatureMin.toString();
    if (temperatureMax !== undefined) params.temperatureMax = temperatureMax.toString();
    if (consultationId) params.consultationId = consultationId;

    return this.apiService.get<any>(`${this.endpoint}/signes-vitaux`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens cliniques par plage de poids
   */
  getExamensByPoids(poidsMin: number, poidsMax: number, consultationId?: string): Observable<ExamenCliniqueResponse[]> {
    const params = {
      poidsMin: poidsMin.toString(),
      poidsMax: poidsMax.toString(),
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<any>(`${this.endpoint}/poids`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens cliniques avec anomalies
   */
  getExamensAvecAnomalies(consultationId?: string): Observable<ExamenCliniqueResponse[]> {
    const params = consultationId ? { consultationId } : {};

    return this.apiService.get<any>(`${this.endpoint}/anomalies`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des examens cliniques par observation
   */
  searchExamensByObservation(searchTerm: string, consultationId?: string, page: number = 0, size: number = 10): Observable<ApiResponse<ExamenCliniqueResponse[]>> {
    const params = {
      q: searchTerm,
      page: page.toString(),
      size: size.toString(),
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<ApiResponse<ExamenCliniqueResponse[]>>(`${this.endpoint}/search`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour un examen clinique
   */
  updateExamenClinique(id: string, examenRequest: ExamenCliniqueRequest): Observable<ExamenCliniqueResponse> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, examenRequest)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(updatedExamen => {
          // Mettre à jour le cache après modification
          const currentExamens = this.examensCliniquesCache.value;
          const updatedExamens = currentExamens.map(examen =>
            examen.id === id ? updatedExamen : examen
          );
          this.examensCliniquesCache.next(updatedExamens);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer un examen clinique
   */
  deleteExamenClinique(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
      .pipe(
        tap(() => {
          // Mettre à jour le cache après suppression
          const currentExamens = this.examensCliniquesCache.value;
          const filteredExamens = currentExamens.filter(examen => examen.id !== id);
          this.examensCliniquesCache.next(filteredExamens);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Calculer l'IMC à partir d'un examen clinique
   */
  calculerIMC(poids: number, taille: number): number {
    if (taille <= 0) return 0;
    const tailleEnMetres = taille / 100;
    return Math.round((poids / (tailleEnMetres * tailleEnMetres)) * 10) / 10;
  }

  /**
   * Évaluer les signes vitaux
   */
  evaluerSignesVitaux(examen: ExamenCliniqueResponse): {
    tensionArterielle: 'normale' | 'elevee' | 'basse';
    temperature: 'normale' | 'fievre' | 'hypothermie';
    frequenceCardiaque: 'normale' | 'rapide' | 'lente';
    imc: number;
    categorieIMC: 'maigreur' | 'normal' | 'surpoids' | 'obesite';
  } {
    // Évaluation de la tension artérielle (format attendu: "120/80")
    let tensionArterielle: 'normale' | 'elevee' | 'basse' = 'normale';
    if (examen.tensionArterielle) {
      const [systolique, diastolique] = examen.tensionArterielle.split('/').map(Number);
      if (systolique >= 140 || diastolique >= 90) {
        tensionArterielle = 'elevee';
      } else if (systolique < 90 || diastolique < 60) {
        tensionArterielle = 'basse';
      }
    }

    // Évaluation de la température
    let temperature: 'normale' | 'fievre' | 'hypothermie' = 'normale';
    if (examen.temperature >= 38) {
      temperature = 'fievre';
    } else if (examen.temperature < 36) {
      temperature = 'hypothermie';
    }

    // Évaluation de la fréquence cardiaque
    let frequenceCardiaque: 'normale' | 'rapide' | 'lente' = 'normale';
    if (examen.frequenceCardiaque > 100) {
      frequenceCardiaque = 'rapide';
    } else if (examen.frequenceCardiaque < 60) {
      frequenceCardiaque = 'lente';
    }

    // Calcul et évaluation de l'IMC
    const imc = this.calculerIMC(examen.poids, examen.taille);
    let categorieIMC: 'maigreur' | 'normal' | 'surpoids' | 'obesite' = 'normal';
    if (imc < 18.5) {
      categorieIMC = 'maigreur';
    } else if (imc >= 25 && imc < 30) {
      categorieIMC = 'surpoids';
    } else if (imc >= 30) {
      categorieIMC = 'obesite';
    }

    return {
      tensionArterielle,
      temperature,
      frequenceCardiaque,
      imc,
      categorieIMC
    };
  }

  /**
   * Obtenir les statistiques des examens cliniques
   */
  getStatistiquesExamens(consultationId?: string, dateDebut?: Date, dateFin?: Date): Observable<{
    total: number;
    moyennePoids: number;
    moyenneTaille: number;
    moyenneTemperature: number;
    moyenneFrequenceCardiaque: number;
    nombreAnomalies: number;
    repartitionIMC: { [key: string]: number };
  }> {
    const params: any = {};
    if (consultationId) params.consultationId = consultationId;
    if (dateDebut) params.dateDebut = dateDebut.toISOString();
    if (dateFin) params.dateFin = dateFin.toISOString();

    return this.apiService.get<any>(`${this.endpoint}/statistiques`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.examensCliniquesCache.next([]);
  }

  /**
   * Recharger le cache avec les examens d'une consultation
   */
  refreshCacheForConsultation(consultationId: string): Observable<ExamenCliniqueResponse[]> {
    return this.getExamensByConsultationSimple(consultationId)
      .pipe(
        tap(examens => {
          this.examensCliniquesCache.next(examens);
        })
      );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Erreur dans ExamenCliniqueService:', error);
    
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
          errorMessage = 'Examen clinique non trouvé';
          break;
        case 409:
          errorMessage = 'Conflit - Cet examen clinique existe déjà';
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

      // Messages d'erreur spécifiques aux examens cliniques
      if (error.error?.message) {
        if (error.error.message.includes('poids')) {
          errorMessage = 'Erreur liée au poids - Veuillez vérifier la valeur du poids';
        } else if (error.error.message.includes('taille')) {
          errorMessage = 'Erreur liée à la taille - Veuillez vérifier la valeur de la taille';
        } else if (error.error.message.includes('tension')) {
          errorMessage = 'Erreur de tension artérielle - Veuillez vérifier le format (ex: 120/80)';
        } else if (error.error.message.includes('temperature')) {
          errorMessage = 'Erreur de température - Veuillez vérifier la valeur de la température';
        } else if (error.error.message.includes('consultation')) {
          errorMessage = 'Erreur liée à la consultation - Consultation non trouvée';
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  };

  /**
   * Extraire un examen clinique depuis une réponse API (gère plusieurs formats)
   */
  private extractExamenFromResponse(response: any, errorMessage: string = 'Format de réponse invalide'): ExamenCliniqueResponse {
    if (response && response.data) {
      // Format ApiResponse<ExamenCliniqueResponse>
      return response.data;
    } else if (response && response.id) {
      // Format direct ExamenCliniqueResponse
      return response;
    } else {
      throw new Error(errorMessage);
    }
  }

  /**
   * Extraire un tableau d'examens cliniques depuis une réponse API
   */
  private extractExamensFromResponse(response: any): ExamenCliniqueResponse[] {
    if (response && response.data && Array.isArray(response.data)) {
      // Format ApiResponse<ExamenCliniqueResponse[]>
      return response.data;
    } else if (response && Array.isArray(response)) {
      // Format direct ExamenCliniqueResponse[]
      return response;
    } else {
      return [];
    }
  }
} 