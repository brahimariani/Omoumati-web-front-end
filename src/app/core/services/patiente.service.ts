import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { PatienteRequest } from '../models/patiente/patiente.request.model';
import { PatienteResponse } from '../models/patiente/patiente.response.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatienteService {
  private endpoint = `${environment.parientesApiUrl}patientes`;

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
   * Récupère toutes les patientes avec pagination
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @param sort Champ de tri
   * @param direction Direction du tri (asc ou desc)
   * @returns Observable avec la liste paginée des patientes
   */
  getAllPatientes(page = 0, size = 10, sort = 'nom', direction = 'asc'): Observable<PageResponse<PatienteResponse>> {
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
        
        return this.apiService.get<PageResponse<PatienteResponse>>(`${this.endpoint}`, params);
      })
    );
  }

  /**
   * Récupère une patiente par son identifiant
   * @param id Identifiant de la patiente
   * @returns Observable avec les données de la patiente
   */
  getPatienteById(id: string): Observable<PatienteResponse> {
    return this.apiService.get<PatienteResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Recherche des patientes par critères
   * @param searchTerm Terme de recherche global
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @returns Observable avec la liste paginée des patientes correspondant aux critères
   */
  searchPatientes(searchTerm: string, page = 0, size = 10): Observable<PageResponse<PatienteResponse>> {
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
        
        return this.apiService.get<PageResponse<PatienteResponse>>(`${this.endpoint}/search`, params);
      })
    );
  }

  /**
   * Crée une nouvelle patiente
   * @param patiente Données de la patiente à créer
   * @returns Observable avec les données de la patiente créée
   */
  createPatiente(patiente: PatienteRequest): Observable<PatienteResponse> {
    return this.apiService.post<PatienteResponse>(this.endpoint, patiente);
  }

  /**
   * Met à jour une patiente existante
   * @param id Identifiant de la patiente
   * @param patiente Données mises à jour de la patiente
   * @returns Observable avec les données de la patiente mise à jour
   */
  updatePatiente(id: string, patiente: PatienteRequest): Observable<PatienteResponse> {
    return this.apiService.put<PatienteResponse>(`${this.endpoint}/${id}`, patiente);
  }

  /**
   * Supprime une patiente
   * @param id Identifiant de la patiente à supprimer
   * @returns Observable du résultat de la suppression
   */
  deletePatiente(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Récupère les patientes par groupe sanguin
   * @param groupage Code du groupe sanguin
   * @returns Observable avec la liste des patientes ayant ce groupe sanguin
   */
  getPatientesByGroupeSanguin(groupage: string): Observable<PatienteResponse[]> {
    return this.apiService.get<PatienteResponse[]>(`${this.endpoint}/groupeSanguin/${groupage}`);
  }
} 