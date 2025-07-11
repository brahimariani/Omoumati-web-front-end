import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { RoleResponse } from '../models/role/role.response.model';
import { RoleRequest } from '../models/role/role.request.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des rôles
 * Gère les opérations CRUD et les requêtes spécialisées pour les rôles
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly endpoint = `${environment.etablissementApiUrl}roles`;

  constructor(private apiService: ApiService) { }

  // ============================
  // OPÉRATIONS CRUD DE BASE
  // ============================

  /**
   * Récupère tous les rôles avec pagination
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @param sort Champ de tri (optionnel)
   * @param direction Direction du tri (optionnel)
   * @returns Observable avec la liste paginée des rôles
   */
  getAllRoles(
    page = 0, 
    size = 10,
    sort?: string,
    direction?: 'asc' | 'desc'
  ): Observable<PageResponse<RoleResponse>> {
    const params: any = {
      page: page.toString(),
      size: size.toString(),
    };
    
    if (sort) {
      params.sort = sort;
    }
    
    if (direction) {
      params.direction = direction;
    }
    
    return this.apiService.get<PageResponse<RoleResponse>>(this.endpoint, params)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des rôles:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère tous les rôles sans pagination (pour les sélecteurs)
   * @returns Observable avec la liste complète des rôles
   */
  getAllRolesSimple(): Observable<RoleResponse[]> {
    return this.apiService.get<RoleResponse[]>(`${this.endpoint}/all`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des rôles (simple):', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les informations d'un rôle par son ID
   * @param roleId ID du rôle
   * @returns Observable avec les données du rôle
   */
  getRoleById(roleId: string): Observable<RoleResponse> {
    return this.apiService.get<RoleResponse>(`${this.endpoint}/${roleId}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération du rôle ${roleId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Crée un nouveau rôle
   * @param roleData Données du nouveau rôle
   * @returns Observable avec les données du rôle créé
   */
  createRole(roleData: RoleRequest): Observable<RoleResponse> {
    return this.apiService.post<RoleResponse>(this.endpoint, roleData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création du rôle:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Met à jour les informations d'un rôle
   * @param roleId ID du rôle
   * @param roleData Données à mettre à jour
   * @returns Observable avec les données mises à jour
   */
  updateRole(roleId: string, roleData: RoleRequest): Observable<RoleResponse> {
    return this.apiService.put<RoleResponse>(`${this.endpoint}/${roleId}`, roleData)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la mise à jour du rôle ${roleId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Supprime un rôle
   * @param roleId ID du rôle à supprimer
   * @returns Observable du résultat
   */
  deleteRole(roleId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${roleId}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la suppression du rôle ${roleId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // OPÉRATIONS DE RECHERCHE ET FILTRAGE
  // ============================

  /**
   * Recherche des rôles par critères
   * @param searchTerm Terme de recherche
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les résultats de recherche
   */
  searchRoles(searchTerm: string, page?: number, size?: number): Observable<PageResponse<RoleResponse>> {
    let url = `${this.endpoint}/search?q=${encodeURIComponent(searchTerm)}`;
    const params: string[] = [];
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    
    return this.apiService.get<PageResponse<RoleResponse>>(url)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la recherche de rôles:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les rôles par nom (recherche exacte)
   * @param nom Nom du rôle
   * @returns Observable avec le rôle correspondant
   */
  getRoleByName(nom: string): Observable<RoleResponse> {
    return this.apiService.get<RoleResponse>(`${this.endpoint}/by-name/${encodeURIComponent(nom)}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération du rôle par nom ${nom}:`, error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // GESTION DES UTILISATEURS ASSOCIÉS
  // ============================

  /**
   * Récupère les utilisateurs associés à un rôle
   * @param roleId ID du rôle
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les utilisateurs du rôle
   */
  getUsersByRole(roleId: string, page?: number, size?: number): Observable<PageResponse<any>> {
    let url = `${this.endpoint}/${roleId}/utilisateurs`;
    const params: string[] = [];
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.apiService.get<PageResponse<any>>(url)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération des utilisateurs du rôle ${roleId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Vérifie si un nom de rôle est disponible
   * @param nom Nom du rôle à vérifier
   * @param excludeRoleId ID du rôle à exclure de la vérification (pour la modification)
   * @returns Observable avec la disponibilité
   */
  checkRoleNameAvailability(nom: string, excludeRoleId?: string): Observable<{ available: boolean }> {
    let url = `${this.endpoint}/check-name?nom=${encodeURIComponent(nom)}`;
    if (excludeRoleId) {
      url += `&excludeId=${excludeRoleId}`;
    }
    
    return this.apiService.get<{ available: boolean }>(url)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la vérification du nom de rôle:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les statistiques des rôles
   * @returns Observable avec les statistiques
   */
  getRolesStatistics(): Observable<{
    total: number;
    utilisateursParRole: { [key: string]: number };
    rolesLesUtilises: Array<{ nom: string; count: number }>;
  }> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des statistiques des rôles:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Vérifie si un rôle peut être supprimé (pas d'utilisateurs assignés)
   * @param roleId ID du rôle
   * @returns Observable avec la possibilité de suppression
   */
  canDeleteRole(roleId: string): Observable<{ canDelete: boolean; reason?: string }> {
    return this.apiService.get<{ canDelete: boolean; reason?: string }>(`${this.endpoint}/${roleId}/can-delete`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la vérification de suppression du rôle ${roleId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // UTILITAIRES
  // ============================

  /**
   * Valide les données d'un rôle côté client
   * @param roleData Données du rôle à valider
   * @returns true si valide, false sinon
   */
  validateRoleDataClient(roleData: Partial<RoleRequest>): boolean {
    if (!roleData.nom || roleData.nom.trim().length === 0) {
      return false;
    }
    if (roleData.nom.trim().length < 2) {
      return false;
    }
    if (!roleData.description || roleData.description.trim().length === 0) {
      return false;
    }
    if (roleData.description.trim().length < 5) {
      return false;
    }
    return true;
  }

  /**
   * Formate le nom d'un rôle (capitalisation)
   * @param nom Nom du rôle
   * @returns Nom formaté
   */
  formatRoleName(nom: string): string {
    return nom.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Génère une description par défaut basée sur le nom du rôle
   * @param nom Nom du rôle
   * @returns Description générée
   */
  generateDefaultDescription(nom: string): string {
    const formattedName = this.formatRoleName(nom);
    return `Rôle ${formattedName} - Accès et permissions spécifiques au profil ${formattedName.toLowerCase()}`;
  }
} 