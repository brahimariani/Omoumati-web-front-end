import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { UtilisateurResponse } from '../models/utilisateur/utilisateur.response.model';
import { environment } from '../../../environments/environment';
import { UtilisateurRequest } from '../models/utilisateur/utlisateur.request.model';
import { UtilisateurUpdateProfileRequest } from '../models/utilisateur/utilisateur-update-profile.model';
import { PasswordChangeRequest } from '../models/login/change-password-request.model';
import { StatutUtilisateur } from '../models/utilisateur/statututilisateur.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private endpoint = `${environment.etablissementApiUrl}utilisateurs`;

  constructor(private apiService: ApiService) { }

  // ============================
  // OPÉRATIONS CRUD DE BASE
  // ============================

  /**
   * Récupère tous les utilisateurs avec pagination
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec la liste paginée des utilisateurs
   */
  getAllUsers(page = 0, 
    size = 10, ): Observable<PageResponse<UtilisateurResponse>> {
    let url = this.endpoint;
    const params = {
      page: page.toString(),
      size: size.toString()
    };
    
    return this.apiService.get<PageResponse<UtilisateurResponse>>(url,params)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des utilisateurs:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les informations d'un utilisateur par son ID
   * @param userId ID de l'utilisateur
   * @returns Observable avec les données de l'utilisateur
   */
  getUserById(userId: string): Observable<UtilisateurResponse> {
    return this.apiService.get<UtilisateurResponse>(`${this.endpoint}/${userId}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Crée un nouvel utilisateur
   * @param userData Données du nouvel utilisateur
   * @returns Observable avec les données de l'utilisateur créé
   */
  createUser(userData: UtilisateurRequest): Observable<UtilisateurResponse> {
    return this.apiService.post<UtilisateurResponse>(this.endpoint, userData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création de l\'utilisateur:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Met à jour les informations d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param userData Données à mettre à jour
   * @returns Observable avec les données mises à jour
   */
  updateUser(userId: string, userData: UtilisateurRequest): Observable<UtilisateurResponse> {
    // Créer une copie des données pour la mise à jour
    const updateData: any = { ...userData };
    
    // Si le mot de passe est vide, le retirer de la requête
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }
    
    return this.apiService.put<UtilisateurResponse>(`${this.endpoint}/${userId}`, updateData)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
          
          // Gestion spécifique de l'erreur d'email existant
          if (error.status === 400 && error.error?.message?.includes('email')) {
            const customError = {
              ...error,
              customMessage: 'Une erreur est survenue lors de la mise à jour. Veuillez vérifier les informations saisies.'
            };
            return throwError(() => customError);
          }
          
          return throwError(() => error);
        })
      );
  }

  /**
   * Met à jour un utilisateur avec validation d'email optimisée
   * @param userId ID de l'utilisateur
   * @param userData Données à mettre à jour
   * @param currentEmail Email actuel de l'utilisateur (pour éviter la validation inutile)
   * @returns Observable avec les données mises à jour
   */
  updateUserOptimized(userId: string, userData: UtilisateurRequest, currentEmail?: string): Observable<UtilisateurResponse> {
    // Créer une copie des données pour la mise à jour
    const updateData: any = { ...userData };
    
    // Si le mot de passe est vide, le retirer de la requête
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }
    
    // Si l'email n'a pas changé, on peut utiliser un endpoint spécialisé ou ajouter un paramètre
    const hasEmailChanged = currentEmail && updateData.email !== currentEmail;
    const endpoint = hasEmailChanged 
      ? `${this.endpoint}/${userId}` 
      : `${this.endpoint}/${userId}?skipEmailValidation=true`;
    
    return this.apiService.put<UtilisateurResponse>(endpoint, updateData)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
          
          // Gestion spécifique de l'erreur d'email existant
          if (error.status === 400 && error.error?.message?.includes('email')) {
            const customError = {
              ...error,
              customMessage: 'L\'email spécifié est déjà utilisé par un autre utilisateur.'
            };
            return throwError(() => customError);
          }
          
          return throwError(() => error);
        })
      );
  }

  /**
   * Supprime un utilisateur
   * @param userId ID de l'utilisateur à supprimer
   * @returns Observable du résultat
   */
  deleteUser(userId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${userId}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // OPÉRATIONS DE RECHERCHE ET FILTRAGE
  // ============================

  /**
   * Recherche des utilisateurs par critères
   * @param searchTerm Terme de recherche
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les résultats de recherche
   */
  searchUsers(searchTerm: string, page?: number, size?: number): Observable<PageResponse<UtilisateurResponse>> {
    let url = `${this.endpoint}/search?q=${encodeURIComponent(searchTerm)}`;
    const params: string[] = [];
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    
    return this.apiService.get<PageResponse<UtilisateurResponse>>(url)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la recherche d\'utilisateurs:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les utilisateurs par rôle
   * @param roleId ID du rôle
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les utilisateurs du rôle spécifié
   */
  getUsersByRole(roleId: string, page?: number, size?: number): Observable<PageResponse<UtilisateurResponse>> {
    let url = `${this.endpoint}/role/${roleId}`;
    const params: string[] = [];
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.apiService.get<PageResponse<UtilisateurResponse>>(url)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération des utilisateurs du rôle ${roleId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les utilisateurs par statut
   * @param statut Statut des utilisateurs
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les utilisateurs du statut spécifié
   */
  getUsersByStatus(statut: StatutUtilisateur, page?: number, size?: number): Observable<PageResponse<UtilisateurResponse>> {
    let url = `${this.endpoint}/status/${statut}`;
    const params: string[] = [];
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.apiService.get<PageResponse<UtilisateurResponse>>(url)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération des utilisateurs avec le statut ${statut}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les utilisateurs d'un centre
   * @param centreId ID du centre
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les utilisateurs du centre spécifié
   */
  getUsersByCentre(centreId: string, page?: number, size?: number): Observable<PageResponse<UtilisateurResponse>> {
    let url = `${this.endpoint}/centre/${centreId}`;
    const params: string[] = [];
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.apiService.get<PageResponse<UtilisateurResponse>>(url)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération des utilisateurs du centre ${centreId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // GESTION DES STATUTS ET ACTIONS SPÉCIALISÉES
  // ============================

  /**
   * Change le statut d'un utilisateur (Actif/Inactif/Suspendu)
   * @param userId ID de l'utilisateur
   * @param newStatus Nouveau statut
   * @returns Observable avec les données mises à jour
   */
  toggleUserStatus(userId: string, newStatus: StatutUtilisateur): Observable<UtilisateurResponse> {
    return this.apiService.patch<UtilisateurResponse>(`${this.endpoint}/${userId}/status`, { statut: newStatus })
      .pipe(
        catchError(error => {
          console.error(`Erreur lors du changement de statut de l'utilisateur ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param newPassword Nouveau mot de passe temporaire (optionnel)
   * @returns Observable du résultat
   */
  resetUserPassword(userId: string, newPassword?: string): Observable<{ temporaryPassword: string }> {
    const payload = newPassword ? { newPassword } : {};
    return this.apiService.post<{ temporaryPassword: string }>(`${this.endpoint}/${userId}/reset-password`, payload)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la réinitialisation du mot de passe de l'utilisateur ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Active un utilisateur suspendu
   * @param userId ID de l'utilisateur
   * @returns Observable avec les données mises à jour
   */
  activateUser(userId: string): Observable<UtilisateurResponse> {
    return this.toggleUserStatus(userId, StatutUtilisateur.ACTIF);
  }

  /**
   * Suspend un utilisateur actif
   * @param userId ID de l'utilisateur
   * @returns Observable avec les données mises à jour
   */
  suspendUser(userId: string): Observable<UtilisateurResponse> {
    return this.toggleUserStatus(userId, StatutUtilisateur.SUSPENDU);
  }

  /**
   * Désactive un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Observable avec les données mises à jour
   */
  deactivateUser(userId: string): Observable<UtilisateurResponse> {
    return this.toggleUserStatus(userId, StatutUtilisateur.INACTIF);
  }

  // ============================
  // GESTION DU PROFIL UTILISATEUR
  // ============================

  /**
   * Change le mot de passe d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param passwordData Données du changement de mot de passe
   * @returns Observable du résultat
   */
  changePassword(userId: string, passwordData: PasswordChangeRequest): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${userId}/password`, passwordData)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors du changement de mot de passe de l'utilisateur ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns Observable avec les données du profil
   */
  getCurrentUserProfile(): Observable<UtilisateurResponse> {
    return this.apiService.get<UtilisateurResponse>(`${this.endpoint}/profile`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération du profil utilisateur:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   * @param userData Données à mettre à jour
   * @returns Observable avec les données mises à jour
   */
  updateCurrentUserProfile(userData: UtilisateurUpdateProfileRequest): Observable<UtilisateurResponse> {
    return this.apiService.put<UtilisateurResponse>(`${this.endpoint}/profile`, userData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Met à jour les informations du profil pour un utilisateur spécifique
   * @param userId ID de l'utilisateur
   * @param userData Données du profil à mettre à jour
   * @returns Observable avec les données mises à jour
   */
  updateUserProfile(userId: string, userData: UtilisateurUpdateProfileRequest): Observable<UtilisateurResponse> {
    return this.apiService.put<UtilisateurResponse>(`${this.endpoint}/${userId}/profile`, userData)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la mise à jour du profil de l'utilisateur ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // STATISTIQUES ET VALIDATION
  // ============================

  /**
   * Récupère les statistiques des utilisateurs
   * @returns Observable avec les statistiques
   */
  getUsersStatistics(): Observable<{
    total: number;
    actifs: number;
    inactifs: number;
    suspendus: number;
    parRole: { [key: string]: number };
    parCentre: { [key: string]: number };
  }> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des statistiques:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Vérifie si un email est déjà utilisé
   * @param email Email à vérifier
   * @param excludeUserId ID de l'utilisateur à exclure de la vérification (pour les mises à jour)
   * @returns Observable avec le résultat de la vérification
   */
  checkEmailAvailability(email: string, excludeUserId?: string): Observable<{ available: boolean }> {
    let url = `${this.endpoint}/check-email?email=${encodeURIComponent(email)}`;
    if (excludeUserId) {
      url += `&excludeUserId=${excludeUserId}`;
    }
    
    return this.apiService.get<{ available: boolean }>(url)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la vérification de l\'email:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Valide les données d'un utilisateur avant création/modification
   * @param userData Données à valider
   * @param isUpdate Si c'est une mise à jour (optionnel)
   * @returns Observable avec les erreurs de validation (si présentes)
   */
  validateUserData(userData: UtilisateurRequest, isUpdate = false): Observable<{ valid: boolean; errors?: string[] }> {
    const endpoint = isUpdate ? 'validate-update' : 'validate';
    return this.apiService.post<{ valid: boolean; errors?: string[] }>(`${this.endpoint}/${endpoint}`, userData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la validation des données:', error);
          return throwError(() => error);
        })
      );
  }

  // ============================
  // FILTRAGE AVANCÉ
  // ============================

  /**
   * Filtre les utilisateurs avec critères multiples
   * @param filters Critères de filtrage
   * @param page Page demandée (optionnel)
   * @param size Taille de la page (optionnel)
   * @returns Observable avec les résultats filtrés
   */
  filterUsers(filters: {
    searchTerm?: string;
    roleId?: string;
    statut?: StatutUtilisateur;
    centreId?: string;
    dateCreationDebut?: string;
    dateCreationFin?: string;
  }, page?: number, size?: number): Observable<PageResponse<UtilisateurResponse>> {
    const params: string[] = [];
    
    if (filters.searchTerm) params.push(`search=${encodeURIComponent(filters.searchTerm)}`);
    if (filters.roleId) params.push(`roleId=${filters.roleId}`);
    if (filters.statut) params.push(`statut=${filters.statut}`);
    if (filters.centreId) params.push(`centreId=${filters.centreId}`);
    if (filters.dateCreationDebut) params.push(`dateDebut=${filters.dateCreationDebut}`);
    if (filters.dateCreationFin) params.push(`dateFin=${filters.dateCreationFin}`);
    
    if (page !== undefined) params.push(`page=${page}`);
    if (size !== undefined) params.push(`size=${size}`);
    
    const url = `${this.endpoint}/filter?${params.join('&')}`;
    
    return this.apiService.get<PageResponse<UtilisateurResponse>>(url)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du filtrage des utilisateurs:', error);
          return throwError(() => error);
        })
      );
  }
} 