import { Injectable } from '@angular/core';
import { Observable, switchMap, map, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CentreRequest } from '../models/centre/centre.request.model';
import { CentreResponse } from '../models/centre/centre.response.model';
import { TypeCentre } from '../models/centre/typecentre.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des centres médicaux
 * Gère les opérations CRUD et les requêtes spécialisées pour les centres
 */
@Injectable({
  providedIn: 'root'
})
export class CentreService {
  private readonly endpoint = `${environment.etablissementApiUrl}centres`;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

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
   * Récupère tous les centres avec pagination
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @param sort Champ de tri (défaut: 'nom')
   * @param direction Direction du tri - 'asc' ou 'desc' (défaut: 'asc')
   * @returns Observable avec la liste paginée des centres
   */
  getAllCentres(
    page = 0, 
    size = 10, 
    sort = 'nom', 
    direction: 'asc' | 'desc' = 'asc'
  ): Observable<PageResponse<CentreResponse>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction
    };
    
    return this.apiService.get<PageResponse<CentreResponse>>(this.endpoint, params).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des centres:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un centre par son identifiant
   * @param id Identifiant du centre
   * @returns Observable avec les données du centre
   */
  getCentreById(id: string): Observable<CentreResponse> {
    if (!id) {
      return throwError(() => new Error('ID du centre requis'));
    }

    return this.apiService.get<CentreResponse>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération du centre ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Recherche des centres par critères
   * @param searchTerm Terme de recherche global (nom, adresse, email)
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @param typeCentre Type de centre à filtrer (optionnel)
   * @returns Observable avec la liste paginée des centres correspondant aux critères
   */
  searchCentres(
    searchTerm: string, 
    page = 0, 
    size = 10, 
    typeCentre?: TypeCentre
  ): Observable<PageResponse<CentreResponse>> {
    const params: any = {
      search: searchTerm,
      page: page.toString(),
      size: size.toString()
    };

    if (typeCentre) {
      params.type = typeCentre;
    }
    
    return this.apiService.get<PageResponse<CentreResponse>>(`${this.endpoint}/search`, params).pipe(
      catchError(error => {
        console.error('Erreur lors de la recherche des centres:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée un nouveau centre
   * @param centre Données du centre à créer
   * @returns Observable avec les données du centre créé
   */
  createCentre(centre: CentreRequest): Observable<CentreResponse> {
    if (!centre) {
      return throwError(() => new Error('Données du centre requises'));
    }

    return this.getCurrentUserId().pipe(
      switchMap(utilisateurId => {
        if (!utilisateurId) {
          return throwError(() => new Error('Utilisateur non authentifié'));
        }

        // Ajouter l'ID utilisateur aux données
        const centreData = {
          ...centre,
          utilisateurId
        };

        return this.apiService.post<CentreResponse>(this.endpoint, centreData);
      }),
      catchError(error => {
        console.error('Erreur lors de la création du centre:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour un centre existant
   * @param id Identifiant du centre
   * @param centre Données mises à jour du centre
   * @returns Observable avec les données du centre mis à jour
   */
  updateCentre(id: string, centre: Partial<CentreRequest>): Observable<CentreResponse> {
    if (!id) {
      return throwError(() => new Error('ID du centre requis'));
    }
    if (!centre) {
      return throwError(() => new Error('Données du centre requises'));
    }

    return this.apiService.put<CentreResponse>(`${this.endpoint}/${id}`, centre).pipe(
      catchError(error => {
        console.error(`Erreur lors de la mise à jour du centre ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime un centre
   * @param id Identifiant du centre à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteCentre(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID du centre requis'));
    }

    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la suppression du centre ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les centres par type
   * @param type Type de centre
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des centres du type spécifié
   */
  getCentresByType(
    type: TypeCentre, 
    page = 0, 
    size = 10
  ): Observable<PageResponse<CentreResponse>> {
    const params = {
      type: type.toString(),
      page: page.toString(),
      size: size.toString()
    };
    
    return this.apiService.get<PageResponse<CentreResponse>>(`${this.endpoint}/type`, params).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération des centres de type ${type}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les statistiques des centres
   * @returns Observable avec les statistiques globales des centres
   */
  getCentresStatistics(): Observable<{
    total: number;
    actifs: number;
    inactifs: number;
    parType: { [key in TypeCentre]: number };
  }> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Active ou désactive un centre
   * @param id Identifiant du centre
   * @param actif État d'activation souhaité
   * @returns Observable avec les données du centre mis à jour
   */
  toggleCentreStatus(id: string, actif: boolean): Observable<CentreResponse> {
    if (!id) {
      return throwError(() => new Error('ID du centre requis'));
    }

    const data = { actif };
    return this.apiService.patch<CentreResponse>(`${this.endpoint}/${id}/status`, data).pipe(
      catchError(error => {
        console.error(`Erreur lors du changement de statut du centre ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les centres accessibles à l'utilisateur connecté
   * @returns Observable avec la liste des centres de l'utilisateur
   */
  getMyCentres(): Observable<CentreResponse[]> {
    return this.getCurrentUserId().pipe(
      switchMap(utilisateurId => {
        if (!utilisateurId) {
          return throwError(() => new Error('Utilisateur non authentifié'));
        }
        
        return this.apiService.get<CentreResponse[]>(`${this.endpoint}/my-centres`, { utilisateurId });
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des centres utilisateur:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les types de centres disponibles
   * @returns Observable avec la liste des types de centres
   */
  getTypesDecentres(): Observable<TypeCentre[]> {
    return new Observable(observer => {
      observer.next(Object.values(TypeCentre));
      observer.complete();
    });
  }

  /**
   * Valide les données d'un centre avant création/modification
   * @param centre Données du centre à valider
   * @returns true si valide, false sinon
   */
  validateCentreData(centre: Partial<CentreRequest>): boolean {
    if (!centre.nom || centre.nom.trim().length === 0) {
      return false;
    }
    if (!centre.adresse || centre.adresse.trim().length === 0) {
      return false;
    }
    if (!centre.email || !this.isValidEmail(centre.email)) {
      return false;
    }
    if (!centre.telephone || centre.telephone.trim().length === 0) {
      return false;
    }
    if (!centre.type || !Object.values(TypeCentre).includes(centre.type)) {
      return false;
    }
    return true;
  }

  /**
   * Valide le format d'un email
   * @param email Email à valider
   * @returns true si valide, false sinon
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 