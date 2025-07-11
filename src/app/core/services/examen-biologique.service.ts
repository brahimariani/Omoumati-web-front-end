import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ExamenBiologiqueRequest } from '../models/examen_biologique/examen-biologique-request.model';
import { ExamenBiologiqueResponse } from '../models/examen_biologique/examen-biologique-response.model';
import { ActeBiologiqueRequest } from '../models/examen_biologique/acte_biologique/acte-biologique-request.model';
import { ActeBiologiqueResponse } from '../models/examen_biologique/acte_biologique/acte-biologique-response.model';
import { ACTES_BIOLOGIQUES_STANDARDS } from '../models/examen_biologique/acte_biologique/acte-biologique.constants';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamenBiologiqueService {
  private readonly endpoint = `${environment.diagnostiqueApiUrl}examens-biologiques`;
  
  // Cache des examens biologiques pour optimiser les performances
  private examensBiologiquesCache = new BehaviorSubject<ExamenBiologiqueResponse[]>([]);
  public examensBiologiques$ = this.examensBiologiquesCache.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Créer un nouvel examen biologique
   */
  createExamenBiologique(examenRequest: ExamenBiologiqueRequest): Observable<ExamenBiologiqueResponse> {
    return this.apiService.post<any>(this.endpoint, examenRequest)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(examen => {
          // Mettre à jour le cache après création
          const currentExamens = this.examensBiologiquesCache.value;
          this.examensBiologiquesCache.next([...currentExamens, examen]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les examens biologiques avec pagination
   */
  getAllExamensBiologiques(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'desc'): Observable<ApiResponse<ExamenBiologiqueResponse[]>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };

    return this.apiService.get<ApiResponse<ExamenBiologiqueResponse[]>>(this.endpoint, params)
      .pipe(
        tap(response => {
          // Mettre à jour le cache avec les nouvelles données
          const examens = response.data || [];
          if (page === 0) {
            this.examensBiologiquesCache.next(examens);
          } else {
            const currentExamens = this.examensBiologiquesCache.value;
            this.examensBiologiquesCache.next([...currentExamens, ...examens]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir un examen biologique par ID
   */
  getExamenBiologiqueById(id: string): Observable<ExamenBiologiqueResponse> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Examen biologique non trouvé')),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les examens biologiques d'une consultation
   */
  getExamensByConsultation(consultationId: string, page: number = 0, size: number = 20): Observable<ApiResponse<ExamenBiologiqueResponse[]>> {
    const params = {
      consultationId,
      page: page.toString(),
      size: size.toString(),
      sortBy: 'id',
      sortDir: 'desc'
    };

    return this.apiService.get<ApiResponse<ExamenBiologiqueResponse[]>>(`${this.endpoint}/consultation/${consultationId}`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens biologiques d'une consultation (version simple pour le cache)
   */
  getExamensByConsultationSimple(consultationId: string): Observable<ExamenBiologiqueResponse[]> {
    return this.apiService.get<any>(`${this.endpoint}/consultation/${consultationId}`)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens biologiques récents
   */
  getExamensRecents(consultationId?: string, limit: number = 5): Observable<ExamenBiologiqueResponse[]> {
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
   * Obtenir les examens biologiques par type d'acte
   */
  getExamensByActeType(nomActe: string, consultationId?: string): Observable<ExamenBiologiqueResponse[]> {
    const params = {
      nomActe,
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<any>(`${this.endpoint}/acte-type`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens biologiques avec valeurs anormales
   */
  getExamensAvecAnomalies(consultationId?: string): Observable<ExamenBiologiqueResponse[]> {
    const params = consultationId ? { consultationId } : {};

    return this.apiService.get<any>(`${this.endpoint}/anomalies`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des examens biologiques par observation ou nom d'acte
   */
  searchExamens(searchTerm: string, consultationId?: string, page: number = 0, size: number = 10): Observable<ApiResponse<ExamenBiologiqueResponse[]>> {
    const params = {
      q: searchTerm,
      page: page.toString(),
      size: size.toString(),
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<ApiResponse<ExamenBiologiqueResponse[]>>(`${this.endpoint}/search`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour un examen biologique
   */
  updateExamenBiologique(id: string, examenRequest: ExamenBiologiqueRequest): Observable<ExamenBiologiqueResponse> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, examenRequest)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(updatedExamen => {
          // Mettre à jour le cache après modification
          const currentExamens = this.examensBiologiquesCache.value;
          const updatedExamens = currentExamens.map(examen =>
            examen.id === updatedExamen.id ? updatedExamen : examen
          );
          this.examensBiologiquesCache.next(updatedExamens);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer un examen biologique
   */
  deleteExamenBiologique(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
      .pipe(
        tap(() => {
          // Mettre à jour le cache après suppression
          const currentExamens = this.examensBiologiquesCache.value;
          const filteredExamens = currentExamens.filter(examen => examen.id !== id);
          this.examensBiologiquesCache.next(filteredExamens);
        }),
        catchError(this.handleError)
      );
  }

  // ===== MÉTHODES SPÉCIALISÉES POUR LES ACTES BIOLOGIQUES =====

  /**
   * Obtenir les actes biologiques standards prédéfinis
   */
  getActesBiologiquesStandards(): ActeBiologiqueRequest[] {
    return ACTES_BIOLOGIQUES_STANDARDS.map(acte => ({
      ...acte,
      valeur: '',
      examenBiologique: null as any
    }));
  }

  /**
   * Analyser les valeurs biologiques et détecter les anomalies
   */
  analyserValeursBiologiques(examen: ExamenBiologiqueResponse): {
    acte: ActeBiologiqueResponse;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  }[] {
    const analyses: {
      acte: ActeBiologiqueResponse;
      statut: 'normal' | 'anormal' | 'critique';
      interpretation: string;
    }[] = [];

    examen.actesBiologiques.forEach(acte => {
      const analyse = this.analyserActeBiologique(acte);
      analyses.push({
        acte,
        statut: analyse.statut,
        interpretation: analyse.interpretation
      });
    });

    return analyses;
  }

  /**
   * Analyser un acte biologique individuel
   */
  private analyserActeBiologique(acte: ActeBiologiqueResponse): {
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    const valeurNumerique = parseFloat(acte.valeur);
    
    // Analyse basée sur le nom de l'acte et les normes de référence
    switch (acte.nom.toLowerCase()) {
      case 'hémoglobine':
        if (valeurNumerique < 11) {
          return { statut: 'anormal', interpretation: 'Anémie - Valeur faible' };
        } else if (valeurNumerique > 16) {
          return { statut: 'anormal', interpretation: 'Polyglobulie - Valeur élevée' };
        } else if (valeurNumerique < 8) {
          return { statut: 'critique', interpretation: 'Anémie sévère - Intervention urgente' };
        }
        return { statut: 'normal', interpretation: 'Valeur normale' };

      case 'glycémie':
        if (valeurNumerique < 0.7) {
          return { statut: 'anormal', interpretation: 'Hypoglycémie' };
        } else if (valeurNumerique > 1.26) {
          return { statut: 'anormal', interpretation: 'Hyperglycémie - Diabète possible' };
        } else if (valeurNumerique > 2.0) {
          return { statut: 'critique', interpretation: 'Hyperglycémie sévère' };
        }
        return { statut: 'normal', interpretation: 'Glycémie normale' };

      case 'créatinine':
        if (valeurNumerique > 12) {
          return { statut: 'anormal', interpretation: 'Insuffisance rénale possible' };
        } else if (valeurNumerique > 20) {
          return { statut: 'critique', interpretation: 'Insuffisance rénale sévère' };
        }
        return { statut: 'normal', interpretation: 'Fonction rénale normale' };

      case 'plaquettes':
        if (valeurNumerique < 150) {
          return { statut: 'anormal', interpretation: 'Thrombopénie - Plaquettes faibles' };
        } else if (valeurNumerique > 450) {
          return { statut: 'anormal', interpretation: 'Thrombocytose - Plaquettes élevées' };
        } else if (valeurNumerique < 50) {
          return { statut: 'critique', interpretation: 'Thrombopénie sévère - Risque hémorragique' };
        }
        return { statut: 'normal', interpretation: 'Numération plaquettaire normale' };

      case 'albuminurie':
        if (valeurNumerique > 30) {
          return { statut: 'anormal', interpretation: 'Protéinurie - Atteinte rénale possible' };
        } else if (valeurNumerique > 300) {
          return { statut: 'critique', interpretation: 'Protéinurie massive' };
        }
        return { statut: 'normal', interpretation: 'Pas de protéinurie' };

      case 'glucosurie':
        if (valeurNumerique > 0) {
          return { statut: 'anormal', interpretation: 'Présence de glucose dans les urines' };
        }
        return { statut: 'normal', interpretation: 'Pas de glucose dans les urines' };

      // Sérologies (résultats qualitatifs)
      case 'rubéole':
      case 'toxoplasmose':
      case 'syphilis (tpha/vdrl)':
      case 'ag hbs':
      case 'sérologie vih':
        if (acte.valeur.toLowerCase().includes('positif') || acte.valeur.toLowerCase().includes('+')) {
          return { statut: 'anormal', interpretation: 'Résultat positif - Suivi médical requis' };
        } else if (acte.valeur.toLowerCase().includes('négatif') || acte.valeur.toLowerCase().includes('-')) {
          return { statut: 'normal', interpretation: 'Résultat négatif' };
        }
        return { statut: 'normal', interpretation: 'À interpréter selon le contexte clinique' };

      case 'rai (si rh négatif)':
        if (acte.valeur.toLowerCase().includes('positif') || acte.valeur.toLowerCase().includes('+')) {
          return { statut: 'anormal', interpretation: 'RAI positif - Surveillance renforcée nécessaire' };
        }
        return { statut: 'normal', interpretation: 'RAI négatif' };

      default:
        // Analyse générique basée sur les normes de référence si disponibles
        if (acte.normesRef && acte.normesRef.trim() !== '') {
          return this.analyserSelonNormesRef(acte);
        }
        return { statut: 'normal', interpretation: 'Valeur à interpréter selon le contexte clinique' };
    }
  }

  /**
   * Analyser selon les normes de référence
   */
  private analyserSelonNormesRef(acte: ActeBiologiqueResponse): {
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    // Logique d'analyse basée sur les normes de référence
    // Cette méthode peut être étendue selon les besoins spécifiques
    return { statut: 'normal', interpretation: 'À interpréter selon les normes de référence' };
  }

  /**
   * Obtenir les statistiques des examens biologiques
   */
  getStatistiquesExamens(consultationId?: string, dateDebut?: Date, dateFin?: Date): Observable<{
    total: number;
    nombreActes: number;
    nombreAnomalies: number;
    repartitionActes: { [key: string]: number };
    tendancesValeurs: { [key: string]: number[] };
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
    this.examensBiologiquesCache.next([]);
  }

  /**
   * Actualiser le cache pour une consultation spécifique
   */
  refreshCacheForConsultation(consultationId: string): Observable<ExamenBiologiqueResponse[]> {
    return this.getExamensByConsultationSimple(consultationId)
      .pipe(
        tap(examens => {
          // Mettre à jour le cache avec les examens de cette consultation
          const currentExamens = this.examensBiologiquesCache.value;
          const otherExamens = currentExamens.filter(e => 
            !examens.some(newE => newE.id === e.id)
          );
          this.examensBiologiquesCache.next([...otherExamens, ...examens]);
        })
      );
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur est survenue lors de l\'opération';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès interdit - Permissions insuffisantes';
          break;
        case 404:
          errorMessage = 'Examen biologique non trouvé';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflit de données';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données non valides';
          break;
        case 500:
          errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
        default:
          errorMessage = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Erreur ExamenBiologiqueService:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  };

  /**
   * Extraire un examen biologique de la réponse API
   */
  private extractExamenFromResponse(response: any, errorMessage: string = 'Format de réponse invalide'): ExamenBiologiqueResponse {
    if (!response) {
      throw new Error(errorMessage);
    }

    // Si la réponse contient directement l'examen
    if (response.id && response.actesBiologiques !== undefined) {
      return response as ExamenBiologiqueResponse;
    }

    // Si la réponse est encapsulée dans un objet data
    if (response.data && response.data.id && response.data.actesBiologiques !== undefined) {
      return response.data as ExamenBiologiqueResponse;
    }

    throw new Error(errorMessage);
  }

  /**
   * Extraire une liste d'examens biologiques de la réponse API
   */
  private extractExamensFromResponse(response: any): ExamenBiologiqueResponse[] {
    if (!response) {
      return [];
    }

    // Si la réponse est directement un tableau
    if (Array.isArray(response)) {
      return response as ExamenBiologiqueResponse[];
    }

    // Si la réponse contient un tableau dans data
    if (response.data && Array.isArray(response.data)) {
      return response.data as ExamenBiologiqueResponse[];
    }

    // Si la réponse contient un tableau dans content (pagination Spring)
    if (response.content && Array.isArray(response.content)) {
      return response.content as ExamenBiologiqueResponse[];
    }

    return [];
  }
} 