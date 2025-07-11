import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { NaissanceRequest } from '../models/naissance/naissance-request.model';
import { NaissanceResponse } from '../models/naissance/naissance-response.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service pour la gestion des naissances
 * Gère toutes les opérations CRUD et les fonctionnalités de recherche/filtrage
 */
@Injectable({
  providedIn: 'root'
})
export class NaissanceService {
  private endpoint = `${environment.grossesseApiUrl}naissances`;

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
   * Récupère toutes les naissances avec pagination
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @param sort Champ de tri
   * @param direction Direction du tri (asc ou desc)
   * @returns Observable avec la liste paginée des naissances
   */
  getAllNaissances(page = 0, size = 10, sort = 'dateNaissance', direction = 'desc'): Observable<PageResponse<NaissanceResponse>> {
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
        
        return this.apiService.get<PageResponse<NaissanceResponse>>(this.endpoint, params);
      })
    );
  }

  /**
   * Récupère une naissance par son identifiant
   * @param id Identifiant de la naissance
   * @returns Observable avec les données de la naissance
   */
  getNaissanceById(id: string): Observable<NaissanceResponse> {
    return this.apiService.get<NaissanceResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Récupère les naissances d'un accouchement spécifique
   * @param accouchementId Identifiant de l'accouchement
   * @returns Observable avec la liste des naissances de l'accouchement
   */
  getNaissancesByAccouchementId(accouchementId: string): Observable<NaissanceResponse[]> {
    return this.apiService.get<NaissanceResponse[]>(`${this.endpoint}/accouchement/${accouchementId}`);
  }

  /**
   * Recherche des naissances par critères
   * @param searchTerm Terme de recherche global
   * @param page Numéro de page
   * @param size Nombre d'éléments par page
   * @returns Observable avec la liste paginée des naissances correspondant aux critères
   */
  searchNaissances(searchTerm: string, page = 0, size = 10): Observable<PageResponse<NaissanceResponse>> {
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
        
        return this.apiService.get<PageResponse<NaissanceResponse>>(`${this.endpoint}/search`, params);
      })
    );
  }

  /**
   * Crée une nouvelle naissance
   * @param naissance Données de la naissance à créer
   * @returns Observable avec les données de la naissance créée
   */
  createNaissance(naissance: NaissanceRequest): Observable<NaissanceResponse> {
    return this.apiService.post<NaissanceResponse>(this.endpoint, naissance);
  }

  /**
   * Met à jour une naissance existante
   * @param id Identifiant de la naissance
   * @param naissance Données mises à jour de la naissance
   * @returns Observable avec les données de la naissance mise à jour
   */
  updateNaissance(id: string, naissance: NaissanceRequest): Observable<NaissanceResponse> {
    return this.apiService.put<NaissanceResponse>(`${this.endpoint}/${id}`, naissance);
  }

  /**
   * Supprime une naissance
   * @param id Identifiant de la naissance à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteNaissance(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Filtre les naissances par sexe
   * @param sexe Sexe du nouveau-né (M/F)
   * @returns Observable avec la liste des naissances filtrées
   */
  getNaissancesBySexe(sexe: string): Observable<NaissanceResponse[]> {
    const params = { sexe };
    return this.apiService.get<NaissanceResponse[]>(`${this.endpoint}/filter/sexe`, params);
  }

  /**
   * Filtre les naissances par statut vivant
   * @param estVivant Statut vivant du nouveau-né
   * @returns Observable avec la liste des naissances filtrées
   */
  getNaissancesByVivant(estVivant: boolean): Observable<NaissanceResponse[]> {
    const params = { estVivant };
    return this.apiService.get<NaissanceResponse[]>(`${this.endpoint}/filter/vivant`, params);
  }

  /**
   * Filtre les naissances par plage de poids
   * @param poidsMin Poids minimum en grammes
   * @param poidsMax Poids maximum en grammes
   * @returns Observable avec la liste des naissances dans la plage de poids
   */
  getNaissancesByPoidsRange(poidsMin: number, poidsMax: number): Observable<NaissanceResponse[]> {
    const params = { poidsMin, poidsMax };
    return this.apiService.get<NaissanceResponse[]>(`${this.endpoint}/filter/poids-range`, params);
  }

  /**
   * Récupère les naissances vivantes
   * @returns Observable avec la liste des naissances vivantes
   */
  getNaissancesVivantes(): Observable<NaissanceResponse[]> {
    return this.getNaissancesByVivant(true);
  }

  /**
   * Récupère les naissances décédées
   * @returns Observable avec la liste des naissances décédées
   */
  getNaissancesDecedees(): Observable<NaissanceResponse[]> {
    return this.getNaissancesByVivant(false);
  }

  /**
   * Récupère les naissances masculines
   * @returns Observable avec la liste des naissances masculines
   */
  getNaissancesMasculines(): Observable<NaissanceResponse[]> {
    return this.getNaissancesBySexe('M');
  }

  /**
   * Récupère les naissances féminines
   * @returns Observable avec la liste des naissances féminines
   */
  getNaissancesFeminines(): Observable<NaissanceResponse[]> {
    return this.getNaissancesBySexe('F');
  }

  /**
   * Récupère les naissances de faible poids (< 2500g)
   * @returns Observable avec la liste des naissances de faible poids
   */
  getNaissancesFaiblePoids(): Observable<NaissanceResponse[]> {
    return this.getNaissancesByPoidsRange(0, 2499);
  }

  /**
   * Récupère les naissances de poids normal (2500g - 4000g)
   * @returns Observable avec la liste des naissances de poids normal
   */
  getNaissancesPoidsNormal(): Observable<NaissanceResponse[]> {
    return this.getNaissancesByPoidsRange(2500, 4000);
  }

  /**
   * Récupère les naissances de poids élevé (> 4000g)
   * @returns Observable avec la liste des naissances de poids élevé
   */
  getNaissancesPoidsEleve(): Observable<NaissanceResponse[]> {
    return this.getNaissancesByPoidsRange(4001, 10000);
  }

  /**
   * Récupère les statistiques des naissances
   * @returns Observable avec les statistiques des naissances
   */
  getNaissancesStatistics(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`);
  }

  /**
   * Récupère le poids moyen des naissances
   * @returns Observable avec le poids moyen
   */
  getPoidsMoyenNaissances(): Observable<number> {
    return this.apiService.get<{ poidsMoyen: number }>(`${this.endpoint}/statistics/poids-moyen`)
      .pipe(map(response => response.poidsMoyen));
  }

  /**
   * Récupère la répartition par sexe
   * @returns Observable avec la répartition par sexe
   */
  getRepartitionParSexe(): Observable<{ masculin: number; feminin: number }> {
    return this.apiService.get<{ masculin: number; feminin: number }>(`${this.endpoint}/statistics/repartition-sexe`);
  }

  /**
   * Récupère la répartition par catégorie de poids
   * @returns Observable avec la répartition par catégorie de poids
   */
  getRepartitionParPoids(): Observable<{ faiblePoids: number; poidsNormal: number; poidsEleve: number }> {
    return this.apiService.get<{ faiblePoids: number; poidsNormal: number; poidsEleve: number }>(`${this.endpoint}/statistics/repartition-poids`);
  }
} 