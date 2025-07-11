import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { GrossesseRequest } from '../models/grossesse/grossesse-request.model';
import { GrossesseResponse } from '../models/grossesse/grossesse-response.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service pour la gestion des grossesses
 * Gère toutes les opérations CRUD et les fonctionnalités de recherche/filtrage
 */
@Injectable({
  providedIn: 'root'
})
export class GrossesseService {
  private endpoint = `${environment.grossesseApiUrl}grossesses`;

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
   * Récupère toutes les grossesses avec pagination
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @returns Observable avec la liste paginée des grossesses
   */
  getAllGrossesses(page = 0, size = 10): Observable<PageResponse<GrossesseResponse>> {
    return this.getCurrentUserId().pipe(
      switchMap(utilisateurId => {
        if (!utilisateurId) {
          throw new Error('Utilisateur non authentifié');
        }
        
        const params: any = {
          page,
          size
        };
        
        return this.apiService.get<PageResponse<GrossesseResponse>>(this.endpoint, params);
      })
    );
  }

  /**
   * Récupère une grossesse par son identifiant
   * @param id Identifiant de la grossesse
   * @returns Observable avec les données de la grossesse
   */
  getGrossesseById(id: string): Observable<GrossesseResponse> {
    return this.apiService.get<GrossesseResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Récupère les grossesses d'une patiente spécifique
   * @param patientId Identifiant de la patiente
   * @returns Observable avec la liste des grossesses de la patiente
   */
  getGrossessesByPatientId(patientId: string): Observable<GrossesseResponse[]> {
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/patient/${patientId}`);
  }

  /**
   * Recherche des grossesses par critères
   * @param searchTerm Terme de recherche global
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @returns Observable avec la liste paginée des grossesses correspondant aux critères
   */
  searchGrossesses(searchTerm: string, page = 0, size = 10): Observable<PageResponse<GrossesseResponse>> {
    return this.getCurrentUserId().pipe(
      switchMap(utilisateurId => {
        if (!utilisateurId) {
          throw new Error('Utilisateur non authentifié');
        }
        
        const params = {
          search: searchTerm,
          page,
          size
        };
        
        return this.apiService.get<PageResponse<GrossesseResponse>>(`${this.endpoint}/search`, params);
      })
    );
  }

  /**
   * Crée une nouvelle grossesse
   * @param grossesse Données de la grossesse à créer
   * @returns Observable avec les données de la grossesse créée
   */
  createGrossesse(grossesse: GrossesseRequest): Observable<GrossesseResponse> {
    return this.apiService.post<GrossesseResponse>(this.endpoint, grossesse);
  }

  /**
   * Met à jour une grossesse existante
   * @param id Identifiant de la grossesse
   * @param grossesse Données mises à jour de la grossesse
   * @returns Observable avec les données de la grossesse mise à jour
   */
  updateGrossesse(id: string, grossesse: GrossesseRequest): Observable<GrossesseResponse> {
    return this.apiService.put<GrossesseResponse>(`${this.endpoint}/${id}`, grossesse);
  }

  /**
   * Supprime une grossesse
   * @param id Identifiant de la grossesse à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteGrossesse(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Filtre les grossesses par statut (désirée ou non)
   * @param estDesiree Statut de la grossesse
   * @returns Observable avec la liste des grossesses filtrées
   */
  getGrossessesByStatus(estDesiree: boolean): Observable<GrossesseResponse[]> {
    const params = { estDesiree };
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/filter/status`, params);
  }

  /**
   * Filtre les grossesses par plage de dates d'accouchement prévues
   * @param startDate Date de début
   * @param endDate Date de fin
   * @returns Observable avec la liste des grossesses dans la plage de dates
   */
  getGrossessesByDueDateRange(startDate: Date, endDate: Date): Observable<GrossesseResponse[]> {
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/filter/due-date`, params);
  }

  /**
   * Récupère les grossesses par parité
   * @param parite Nombre de grossesses précédentes
   * @returns Observable avec la liste des grossesses filtrées par parité
   */
  getGrossessesByParite(parite: number): Observable<GrossesseResponse[]> {
    const params = { parite };
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/filter/parite`, params);
  }

  /**
   * Récupère les grossesses en cours (terme non dépassé)
   * @returns Observable avec la liste des grossesses en cours
   */
  getGrossessesEnCours(): Observable<GrossesseResponse[]> {
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/filter/en-cours`);
  }

  /**
   * Récupère les grossesses à terme (proche de l'accouchement)
   * @returns Observable avec la liste des grossesses à terme
   */
  getGrossessesATerm(): Observable<GrossesseResponse[]> {
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/filter/a-terme`);
  }

  /**
   * Récupère les primigestes (première grossesse)
   * @returns Observable avec la liste des primigestes
   */
  getPrimigestes(): Observable<GrossesseResponse[]> {
    return this.getGrossessesByParite(1);
  }

  /**
   * Récupère les multigestes (plusieurs grossesses)
   * @returns Observable avec la liste des multigestes
   */
  getMultigestes(): Observable<GrossesseResponse[]> {
    const params = { pariteMin: 2 };
    return this.apiService.get<GrossesseResponse[]>(`${this.endpoint}/filter/multigestes`, params);
  }
} 