import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AccouchementRequest } from '../models/accouchement/accouchement-request.model';
import { AccouchementResponse } from '../models/accouchement/accouchement-response.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service pour la gestion des accouchements
 * Gère toutes les opérations CRUD et les fonctionnalités de recherche/filtrage
 */
@Injectable({
  providedIn: 'root'
})
export class AccouchementService {
  private endpoint = `${environment.grossesseApiUrl}accouchements`;

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
   * Récupère tous les accouchements avec pagination
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @param sort Champ de tri
   * @param direction Direction du tri (asc ou desc)
   * @returns Observable avec la liste paginée des accouchements
   */
  getAllAccouchements(page = 0, size = 10, sort = 'date', direction = 'desc'): Observable<PageResponse<AccouchementResponse>> {
    return this.getCurrentUserId().pipe(
      switchMap(utilisateurId => {
        if (!utilisateurId) {
          throw new Error('Utilisateur non authentifié');
        }
        
        const params = {
          utilisateurId,
          page,
          size,
          sort: `${sort}`,
          direction: direction
        };
        
        return this.apiService.get<PageResponse<AccouchementResponse>>(this.endpoint, params);
      })
    );
  }

  /**
   * Récupère un accouchement par son identifiant
   * @param id Identifiant de l'accouchement
   * @returns Observable avec les données de l'accouchement
   */
  getAccouchementById(id: string): Observable<AccouchementResponse> {
    return this.apiService.get<AccouchementResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Récupère les accouchements d'une patiente spécifique
   * @param patientId Identifiant de la patiente
   * @returns Observable avec la liste des accouchements de la patiente
   */
  getAccouchementsByPatientId(patientId: string): Observable<AccouchementResponse[]> {
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/patiente/${patientId}`);
  }

  /**
   * Récupère les accouchements d'une grossesse spécifique
   * @param grossesseId Identifiant de la grossesse
   * @returns Observable avec la liste des accouchements de la grossesse
   */
  getAccouchementsByGrossesseId(grossesseId: string): Observable<AccouchementResponse[]> {
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/grossesse/${grossesseId}`);
  }

  /**
   * Recherche des accouchements par critères
   * @param searchTerm Terme de recherche global
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @returns Observable avec la liste paginée des accouchements correspondant aux critères
   */
  searchAccouchements(searchTerm: string, page = 0, size = 10): Observable<PageResponse<AccouchementResponse>> {
    return this.getCurrentUserId().pipe(
      switchMap(utilisateurId => {
        if (!utilisateurId) {
          throw new Error('Utilisateur non authentifié');
        }
        
        const params = {
          utilisateurId,
          search: searchTerm,
          page,
          size
        };
        
        return this.apiService.get<PageResponse<AccouchementResponse>>(`${this.endpoint}/search`, params);
      })
    );
  }

  /**
   * Crée un nouvel accouchement
   * @param accouchement Données de l'accouchement à créer
   * @returns Observable avec les données de l'accouchement créé
   */
  createAccouchement(accouchement: AccouchementRequest): Observable<AccouchementResponse> {
    return this.apiService.post<AccouchementResponse>(this.endpoint, accouchement);
  }

  /**
   * Met à jour un accouchement existant
   * @param id Identifiant de l'accouchement
   * @param accouchement Données mises à jour de l'accouchement
   * @returns Observable avec les données de l'accouchement mis à jour
   */
  updateAccouchement(id: string, accouchement: AccouchementRequest): Observable<AccouchementResponse> {
    return this.apiService.put<AccouchementResponse>(`${this.endpoint}/${id}`, accouchement);
  }

  /**
   * Supprime un accouchement
   * @param id Identifiant de l'accouchement à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteAccouchement(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Filtre les accouchements par modalité d'extraction
   * @param modaliteExtraction Modalité d'extraction (naturel, césarienne, etc.)
   * @returns Observable avec la liste des accouchements filtrés
   */
  getAccouchementsByModalite(modaliteExtraction: string): Observable<AccouchementResponse[]> {
    const params = { modaliteExtraction };
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/filter/modalite`, params);
  }

  /**
   * Filtre les accouchements par assistance qualifiée
   * @param assisstanceQualifiee Présence d'assistance qualifiée
   * @returns Observable avec la liste des accouchements filtrés
   */
  getAccouchementsByAssistance(assisstanceQualifiee: boolean): Observable<AccouchementResponse[]> {
    const params = { assisstanceQualifiee };
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/filter/assistance`, params);
  }

  /**
   * Filtre les accouchements par plage de dates
   * @param startDate Date de début
   * @param endDate Date de fin
   * @returns Observable avec la liste des accouchements dans la plage de dates
   */
  getAccouchementsByDateRange(startDate: Date, endDate: Date): Observable<AccouchementResponse[]> {
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/filter/date-range`, params);
  }

  /**
   * Filtre les accouchements par lieu
   * @param lieu Lieu de l'accouchement
   * @returns Observable avec la liste des accouchements filtrés par lieu
   */
  getAccouchementsByLieu(lieu: string): Observable<AccouchementResponse[]> {
    const params = { lieu };
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/filter/lieu`, params);
  }

  /**
   * Récupère les accouchements récents (dernière semaine)
   * @returns Observable avec la liste des accouchements récents
   */
  getAccouchementsRecents(): Observable<AccouchementResponse[]> {
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/filter/recents`);
  }

  /**
   * Récupère les accouchements d'aujourd'hui
   * @returns Observable avec la liste des accouchements d'aujourd'hui
   */
  getAccouchementsToday(): Observable<AccouchementResponse[]> {
    return this.apiService.get<AccouchementResponse[]>(`${this.endpoint}/filter/today`);
  }

  /**
   * Récupère les accouchements avec assistance qualifiée
   * @returns Observable avec la liste des accouchements avec assistance
   */
  getAccouchementsWithAssistance(): Observable<AccouchementResponse[]> {
    return this.getAccouchementsByAssistance(true);
  }

  /**
   * Récupère les accouchements sans assistance qualifiée
   * @returns Observable avec la liste des accouchements sans assistance
   */
  getAccouchementsWithoutAssistance(): Observable<AccouchementResponse[]> {
    return this.getAccouchementsByAssistance(false);
  }

  /**
   * Récupère les statistiques des accouchements
   * @returns Observable avec les statistiques des accouchements
   */
  getAccouchementsStatistics(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`);
  }
} 