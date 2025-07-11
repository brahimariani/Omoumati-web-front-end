import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ComplicationRequest } from '../models/complication/complication-request.model';
import { ComplicationResponse } from '../models/complication/complication-response.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service pour la gestion des complications
 * Gère toutes les opérations CRUD et les fonctionnalités de recherche/filtrage
 * pour les complications liées aux grossesses, accouchements et naissances
 */
@Injectable({
  providedIn: 'root'
})
export class ComplicationService {
  private endpoint = `${environment.grossesseApiUrl}complications`;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private http: HttpClient
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
   * Récupère une complication par son identifiant
   * @param id Identifiant de la complication
   * @returns Observable avec les données de la complication
   */
  getComplicationById(id: string): Observable<ComplicationResponse> {
    return this.apiService.get<ComplicationResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Récupère les complications d'une grossesse spécifique
   * @param grossesseId Identifiant de la grossesse
   * @returns Observable avec la liste des complications de la grossesse
   */
  getComplicationsByGrossesseId(grossesseId: string): Observable<ComplicationResponse[]> {
    return this.apiService.get<ComplicationResponse[]>(`${this.endpoint}/grossesse/${grossesseId}`);
  }

  /**
   * Récupère les complications d'un accouchement spécifique
   * @param accouchementId Identifiant de l'accouchement
   * @returns Observable avec la liste des complications de l'accouchement
   */
  getComplicationsByAccouchementId(accouchementId: string): Observable<ComplicationResponse[]> {
    return this.apiService.get<ComplicationResponse[]>(`${this.endpoint}/accouchement/${accouchementId}`);
  }

  /**
   * Récupère les complications d'une naissance spécifique
   * @param naissanceId Identifiant de la naissance
   * @returns Observable avec la liste des complications de la naissance
   */
  getComplicationsByNaissanceId(naissanceId: string): Observable<ComplicationResponse[]> {
    return this.apiService.get<ComplicationResponse[]>(`${this.endpoint}/naissance/${naissanceId}`);
  }

  
  /**
   * Crée une nouvelle complication
   * @param complication Données de la complication à créer
   * @returns Observable avec les données de la complication créée
   */
  createComplication(complication: ComplicationRequest): Observable<ComplicationResponse> {
    return this.apiService.post<ComplicationResponse>(this.endpoint, complication);
  }

  /**
   * Met à jour une complication existante
   * @param id Identifiant de la complication
   * @param complication Données mises à jour de la complication
   * @returns Observable avec les données de la complication mise à jour
   */
  updateComplication(id: string, complication: ComplicationRequest): Observable<ComplicationResponse> {
    return this.apiService.put<ComplicationResponse>(`${this.endpoint}/${id}`, complication);
  }

  /**
   * Supprime une complication
   * @param id Identifiant de la complication à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteComplication(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

 

 
} 