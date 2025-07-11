import { Injectable } from '@angular/core';
import { Observable, switchMap, map, catchError, throwError, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ReferenceRequest } from '../models/reference/reference-request.model';
import { ReferenceResponse } from '../models/reference/reference-response.model';
import { StatutReference } from '../models/reference/statut.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { selectCurrentUserCentreId } from '../../store/auth/auth.selectors';

/**
 * Service de gestion des références médicales
 * Gère les opérations CRUD et les requêtes spécialisées pour les références
 */
@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  private readonly endpoint = `${environment.referencesApiUrl}references`;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private store: Store
  ) { }

  /**
   * Ajoute le centreId de l'utilisateur actuel aux paramètres
   */
  private addCentreIdToParams(params: any = {}): Observable<any> {
    return this.getCurrentUserCentreId().pipe(
      take(1),
      map(centreId => ({
        ...params,
        centreId: centreId || ''
      }))
    );
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   * @returns Observable avec l'ID utilisateur ou null
   */
  private getCurrentUserId(): Observable<string | null> {
    return this.authService.getCurrentUser().pipe(
      map(user => user?.id || null)
    );
  }

  /**
   * Récupère l'ID du centre de l'utilisateur connecté
   * @returns Observable avec l'ID du centre ou null
   */
  private getCurrentUserCentreId(): Observable<string | null> {
    return this.authService.getCurrentUser().pipe(
      map(user => user?.centre?.id || null)
    );
  }

  /**
   * Construit l'URL avec les paramètres pour les requêtes POST/PUT/PATCH/DELETE
   */
  private buildUrlWithParams(endpoint: string, params: any): string {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.set(key, params[key].toString());
      }
    });
    const queryString = queryParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }

  /**
   * Récupère toutes les références avec pagination
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @param sort Champ de tri (défaut: 'date')
   * @param direction Direction du tri - 'asc' ou 'desc' (défaut: 'desc')
   * @returns Observable avec la liste paginée des références
   */
  getAllReferences(
    page = 0, 
    size = 10, 
    sort = 'date', 
    direction: 'asc' | 'desc' = 'desc'
  ): Observable<PageResponse<ReferenceResponse>> {
    const baseParams = {
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<ReferenceResponse>>(this.endpoint, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des références:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère une référence par son identifiant
   * @param id Identifiant de la référence
   * @returns Observable avec les données de la référence
   */
  getReferenceById(id: string): Observable<ReferenceResponse> {
    if (!id) {
      return throwError(() => new Error('ID de la référence requis'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => 
        this.apiService.get<ReferenceResponse>(`${this.endpoint}/${id}`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération de la référence ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Recherche des références par critères
   * @param searchTerm Terme de recherche global (motif, nom patiente)
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @param statut Statut de référence à filtrer (optionnel)
   * @param centreOrigine ID du centre d'origine (optionnel)
   * @param centreDestination ID du centre de destination (optionnel)
   * @returns Observable avec la liste paginée des références correspondant aux critères
   */
  searchReferences(
    searchTerm: string, 
    page = 0, 
    size = 10, 
    statut?: StatutReference,
    centreOrigine?: string,
    centreDestination?: string
  ): Observable<PageResponse<ReferenceResponse>> {
    const baseParams: any = {
      search: searchTerm,
      page: page.toString(),
      size: size.toString()
    };

    if (statut) {
      baseParams.statut = statut;
    }
    if (centreOrigine) {
      baseParams.centreOrigine = centreOrigine;
    }
    if (centreDestination) {
      baseParams.centreDestination = centreDestination;
    }
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<ReferenceResponse>>(`${this.endpoint}/search`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la recherche des références:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée une nouvelle référence
   * @param reference Données de la référence à créer
   * @returns Observable avec les données de la référence créée
   */
  createReference(reference: ReferenceRequest): Observable<ReferenceResponse> {
    if (!reference) {
      return throwError(() => new Error('Données de la référence requises'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => {
        if (!params.centreId) {
          return throwError(() => new Error('Centre d\'origine requis'));
        }

        // Valider les données avant création
        if (!this.validateReferenceData(reference)) {
          return throwError(() => new Error('Données de référence invalides'));
        }

        const urlWithParams = this.buildUrlWithParams(this.endpoint, params);
        return this.apiService.post<ReferenceResponse>(urlWithParams, reference);
      }),
      catchError(error => {
        console.error('Erreur lors de la création de la référence:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une référence existante
   * @param id Identifiant de la référence
   * @param reference Données mises à jour de la référence
   * @returns Observable avec les données de la référence mise à jour
   */
  updateReference(id: string, reference: Partial<ReferenceRequest>): Observable<ReferenceResponse> {
    if (!id) {
      return throwError(() => new Error('ID de la référence requis'));
    }
    if (!reference) {
      return throwError(() => new Error('Données de la référence requises'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => {
        const urlWithParams = this.buildUrlWithParams(`${this.endpoint}/${id}`, params);
        return this.apiService.put<ReferenceResponse>(urlWithParams, reference);
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de la référence ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime une référence
   * @param id Identifiant de la référence à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteReference(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID de la référence requis'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => {
        const urlWithParams = this.buildUrlWithParams(`${this.endpoint}/${id}`, params);
        return this.apiService.delete<void>(urlWithParams);
      }),
      catchError(error => {
        console.error(`Erreur lors de la suppression de la référence ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les références par statut
   * @param statut Statut de référence
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des références du statut spécifié
   */
  getReferencesByStatut(
    statut: StatutReference, 
    page = 0, 
    size = 10
  ): Observable<PageResponse<ReferenceResponse>> {
    const baseParams = {
      statut: statut.toString(),
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<ReferenceResponse>>(`${this.endpoint}/by-statut`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des références avec statut ${statut}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les références d'une patiente
   * @param patienteId Identifiant de la patiente
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des références de la patiente
   */
  getReferencesByPatiente(
    patienteId: string, 
    page = 0, 
    size = 10
  ): Observable<PageResponse<ReferenceResponse>> {
    if (!patienteId) {
      return throwError(() => new Error('ID de la patiente requis'));
    }

    const baseParams = {
      patienteId: patienteId,
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<ReferenceResponse>>(`${this.endpoint}/by-patiente`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des références de la patiente ${patienteId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les références d'un centre (origine ou destination)
   * @param centreId Identifiant du centre
   * @param type Type de relation ('origine' ou 'destination')
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des références du centre
   */
  getReferencesByCentre(
    centreId: string, 
    type: 'origine' | 'destination',
    page = 0, 
    size = 10
  ): Observable<PageResponse<ReferenceResponse>> {
    if (!centreId) {
      return throwError(() => new Error('ID du centre requis'));
    }

    const baseParams = {
      centreId: centreId,
      centreType: type,
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<ReferenceResponse>>(`${this.endpoint}/by-centre`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des références du centre ${centreId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change le statut d'une référence
   * @param id Identifiant de la référence
   * @param statut Nouveau statut
   * @returns Observable avec les données de la référence mise à jour
   */
  changeStatutReference(id: string, statut: StatutReference): Observable<ReferenceResponse> {
    if (!id) {
      return throwError(() => new Error('ID de la référence requis'));
    }
    if (!statut) {
      return throwError(() => new Error('Statut requis'));
    }

    // Envoyer le statut comme objet JSON avec Content-Type application/json
    const body = { statut: statut };
    
    return this.apiService.post<ReferenceResponse>(`${this.endpoint}/${id}/statut`, body).pipe(
      catchError(error => {
        console.error(`Erreur lors du changement de statut de la référence ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les statistiques des références
   * @returns Observable avec les statistiques
   */
  getReferencesStatistics(): Observable<{
    total: number;
    accepted: number;
    rejected: number;
    reported: number;
    parCentre: { [key: string]: number };
    parMois: { [key: string]: number };
  }> {
    return this.addCentreIdToParams().pipe(
      switchMap(params => 
        this.apiService.get<any>(`${this.endpoint}/statistics`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques des références:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les références récentes
   * @param limit Nombre de références à récupérer (défaut: 5)
   * @returns Observable avec la liste des références récentes
   */
  getRecentReferences(limit = 5): Observable<ReferenceResponse[]> {
    const baseParams = {
      limit: limit.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<ReferenceResponse[]>(`${this.endpoint}/recent`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des références récentes:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les statuts disponibles
   * @returns Observable avec la liste des statuts
   */
  getStatutsReference(): Observable<StatutReference[]> {
    return new Observable(observer => {
      observer.next(Object.values(StatutReference));
      observer.complete();
    });
  }

  /**
   * Valide les données d'une référence
   * @param reference Données de la référence à valider
   * @returns true si les données sont valides, false sinon
   */
  validateReferenceData(reference: Partial<ReferenceRequest>): boolean {
    if (!reference) {
      return false;
    }

    // Vérifications obligatoires
    if (!reference.motif || reference.motif.trim().length === 0) {
      return false;
    }

    if (!reference.patiente || reference.patiente.trim().length === 0) {
      return false;
    }

    if (!reference.centreOrigine || reference.centreOrigine.trim().length === 0) {
      return false;
    }

    if (!reference.centreDestination || reference.centreDestination.trim().length === 0) {
      return false;
    }

    if (reference.centreOrigine === reference.centreDestination) {
      return false;
    }

    if (!reference.date) {
      return false;
    }

    // Vérifier que la date n'est pas dans le futur lointain
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (new Date(reference.date) > maxDate) {
      return false;
    }

    return true;
  }

  /**
   * Formate le statut pour l'affichage
   * @param statut Statut de la référence
   * @returns Libellé formaté du statut
   */
  getStatutLabel(statut: StatutReference): string {
    switch (statut) {
      case StatutReference.ACCEPTED:
        return 'Acceptée';
      case StatutReference.REJECTED:
        return 'Rejetée';
      case StatutReference.REPORTED:
        return 'Reportée';
      default:
        return 'En attente';
    }
  }

  /**
   * Récupère la classe CSS pour le statut
   * @param statut Statut de la référence
   * @returns Classe CSS correspondant au statut
   */
  getStatutClass(statut: StatutReference): string {
    switch (statut) {
      case StatutReference.ACCEPTED:
        return 'status-accepted';
      case StatutReference.REJECTED:
        return 'status-rejected';
      case StatutReference.REPORTED:
        return 'status-reported';
      default:
        return 'status-unknown';
    }
  }
}