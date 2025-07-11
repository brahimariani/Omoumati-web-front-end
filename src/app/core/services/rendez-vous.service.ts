import { Injectable } from '@angular/core';
import { Observable, switchMap, map, catchError, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { RendezVousRequestDto } from '../models/rendez-vous/rendez-vous-request.model';
import { RendezVousResponseDto } from '../models/rendez-vous/rendez-vous-response.model';
import { StatutRendezVous } from '../models/rendez-vous/statut.model';
import { PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des rendez-vous médicaux
 * Gère les opérations CRUD et les requêtes spécialisées pour les rendez-vous
 */
@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private readonly endpoint = `${environment.rendezVousApiUrl}rendezvous`;

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
   * Récupère tous les rendez-vous avec pagination
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @param sort Champ de tri (défaut: 'date')
   * @param direction Direction du tri - 'asc' ou 'desc' (défaut: 'desc')
   * @returns Observable avec la liste paginée des rendez-vous
   */
  getAllRendezVous(
    page = 0, 
    size = 10, 
    sort = 'date', 
    direction: 'asc' | 'desc' = 'desc'
  ): Observable<PageResponse<RendezVousResponseDto>> {
    const baseParams = {
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<RendezVousResponseDto>>(this.endpoint, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un rendez-vous par son identifiant
   * @param id Identifiant du rendez-vous
   * @returns Observable avec les données du rendez-vous
   */
  getRendezVousById(id: string): Observable<RendezVousResponseDto> {
    if (!id) {
      return throwError(() => new Error('ID du rendez-vous requis'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => 
        this.apiService.get<RendezVousResponseDto>(`${this.endpoint}/${id}`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération du rendez-vous ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Recherche des rendez-vous par critères
   * @param searchTerm Terme de recherche global (motif, nom patiente)
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @param statut Statut de rendez-vous à filtrer (optionnel)
   * @param patienteId ID de la patiente (optionnel)
   * @param dateDebut Date de début pour filtrer (optionnel)
   * @param dateFin Date de fin pour filtrer (optionnel)
   * @returns Observable avec la liste paginée des rendez-vous correspondant aux critères
   */
  searchRendezVous(
    searchTerm: string, 
    page = 0, 
    size = 10, 
    statut?: StatutRendezVous,
    patienteId?: string,
    dateDebut?: string,
    dateFin?: string
  ): Observable<PageResponse<RendezVousResponseDto>> {
    const baseParams: any = {
      search: searchTerm,
      page: page.toString(),
      size: size.toString()
    };

    if (statut) {
      baseParams.statut = statut;
    }
    if (patienteId) {
      baseParams.patienteId = patienteId;
    }
    if (dateDebut) {
      // Formatter la date si nécessaire
      baseParams.dateDebut = dateDebut.includes('T') ? this.formatDateForSpringBoot(dateDebut) : dateDebut;
    }
    if (dateFin) {
      // Formatter la date si nécessaire
      baseParams.dateFin = dateFin.includes('T') ? this.formatDateForSpringBoot(dateFin) : dateFin;
    }
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<RendezVousResponseDto>>(`${this.endpoint}/search`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la recherche des rendez-vous:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée un nouveau rendez-vous
   * @param rendezVous Données du rendez-vous à créer
   * @returns Observable avec les données du rendez-vous créé
   */
  createRendezVous(rendezVous: RendezVousRequestDto): Observable<RendezVousResponseDto> {
    if (!rendezVous) {
      return throwError(() => new Error('Données du rendez-vous requises'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => {
        if (!params.centreId) {
          return throwError(() => new Error('Centre requis'));
        }

        // Valider les données avant création
        if (!this.validateRendezVousData(rendezVous)) {
          return throwError(() => new Error('Données de rendez-vous invalides'));
        }

        // Formatter la date pour Spring Boot
        const formattedRendezVous = {
          ...rendezVous,
          date: this.formatDateForSpringBoot(rendezVous.date)
        };

        const urlWithParams = this.buildUrlWithParams(this.endpoint, params);
        return this.apiService.post<RendezVousResponseDto>(urlWithParams, formattedRendezVous);
      }),
      catchError(error => {
        console.error('Erreur lors de la création du rendez-vous:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour un rendez-vous existant
   * @param id Identifiant du rendez-vous
   * @param rendezVous Données mises à jour du rendez-vous
   * @returns Observable avec les données du rendez-vous mis à jour
   */
  updateRendezVous(id: string, rendezVous: Partial<RendezVousRequestDto>): Observable<RendezVousResponseDto> {
    if (!id) {
      return throwError(() => new Error('ID du rendez-vous requis'));
    }
    if (!rendezVous) {
      return throwError(() => new Error('Données du rendez-vous requises'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => {
        // Formatter la date pour Spring Boot si elle est présente
        const formattedRendezVous = rendezVous.date ? {
          ...rendezVous,
          date: this.formatDateForSpringBoot(rendezVous.date)
        } : rendezVous;

        const urlWithParams = this.buildUrlWithParams(`${this.endpoint}/${id}`, params);
        return this.apiService.put<RendezVousResponseDto>(urlWithParams, formattedRendezVous);
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour du rendez-vous ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime un rendez-vous
   * @param id Identifiant du rendez-vous à supprimer
   * @returns Observable du résultat de la suppression
   */
  deleteRendezVous(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID du rendez-vous requis'));
    }

    return this.addCentreIdToParams().pipe(
      switchMap(params => {
        const urlWithParams = this.buildUrlWithParams(`${this.endpoint}/${id}`, params);
        return this.apiService.delete<void>(urlWithParams);
      }),
      catchError(error => {
        console.error(`Erreur lors de la suppression du rendez-vous ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous par statut
   * @param statut Statut de rendez-vous
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des rendez-vous du statut spécifié
   */
  getRendezVousByStatut(
    statut: StatutRendezVous, 
    page = 0, 
    size = 10
  ): Observable<PageResponse<RendezVousResponseDto>> {
    const baseParams = {
      statut: statut.toString(),
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<RendezVousResponseDto>>(`${this.endpoint}/by-statut`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des rendez-vous avec statut ${statut}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous d'une patiente
   * @param patienteId Identifiant de la patiente
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des rendez-vous de la patiente
   */
  getRendezVousByPatiente(
    patienteId: string, 
    page = 0, 
    size = 10
  ): Observable<PageResponse<RendezVousResponseDto>> {
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
        this.apiService.get<PageResponse<RendezVousResponseDto>>(`${this.endpoint}/by-patiente`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des rendez-vous de la patiente ${patienteId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous d'un centre
   * @param centreId Identifiant du centre
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des rendez-vous du centre
   */
  getRendezVousByCentre(
    centreId: string,
    page = 0, 
    size = 10
  ): Observable<PageResponse<RendezVousResponseDto>> {
    if (!centreId) {
      return throwError(() => new Error('ID du centre requis'));
    }

    const baseParams = {
      centreId: centreId,
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<RendezVousResponseDto>>(`${this.endpoint}/by-centre`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des rendez-vous du centre ${centreId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous d'une date spécifique
   * @param date Date au format ISO string ou YYYY-MM-DD
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des rendez-vous de la date spécifiée
   */
  getRendezVousByDate(
    date: string,
    page = 0, 
    size = 10
  ): Observable<PageResponse<RendezVousResponseDto>> {
    if (!date) {
      return throwError(() => new Error('Date requise'));
    }

    // Si la date contient un 'T', c'est une date ISO, sinon c'est juste une date YYYY-MM-DD
    const formattedDate = date.includes('T') ? this.formatDateForSpringBoot(date) : date;

    const baseParams = {
      date: formattedDate,
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<RendezVousResponseDto>>(`${this.endpoint}/by-date`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des rendez-vous du ${date}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous dans une plage de dates
   * @param dateDebut Date de début au format ISO string ou YYYY-MM-DD
   * @param dateFin Date de fin au format ISO string ou YYYY-MM-DD
   * @param page Numéro de page (défaut: 0)
   * @param size Nombre d'éléments par page (défaut: 10)
   * @returns Observable avec la liste des rendez-vous dans la plage de dates
   */
  getRendezVousByDateRange(
    dateDebut: string,
    dateFin: string,
    page = 0, 
    size = 10
  ): Observable<PageResponse<RendezVousResponseDto>> {
    if (!dateDebut || !dateFin) {
      return throwError(() => new Error('Dates de début et fin requises'));
    }

    // Formatter les dates si nécessaire
    const formattedDateDebut = dateDebut.includes('T') ? this.formatDateForSpringBoot(dateDebut) : dateDebut;
    const formattedDateFin = dateFin.includes('T') ? this.formatDateForSpringBoot(dateFin) : dateFin;

    const baseParams = {
      dateDebut: formattedDateDebut,
      dateFin: formattedDateFin,
      page: page.toString(),
      size: size.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<PageResponse<RendezVousResponseDto>>(`${this.endpoint}/by-date-range`, params)
      ),
      catchError(error => {
        console.error(`Erreur lors de la récupération des rendez-vous entre ${dateDebut} et ${dateFin}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change le statut d'un rendez-vous
   * @param id Identifiant du rendez-vous
   * @param statut Nouveau statut
   * @returns Observable avec les données du rendez-vous mis à jour
   */
  changeStatutRendezVous(id: string, statut: StatutRendezVous): Observable<RendezVousResponseDto> {
    if (!id) {
      return throwError(() => new Error('ID du rendez-vous requis'));
    }
    if (!statut) {
      return throwError(() => new Error('Statut requis'));
    }

    // Envoyer le statut comme objet JSON avec Content-Type application/json
    const body = { statut: statut };
    
    return this.apiService.post<RendezVousResponseDto>(`${this.endpoint}/${id}/statut`, body).pipe(
      catchError(error => {
        console.error(`Erreur lors du changement de statut du rendez-vous ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirme un rendez-vous
   * @param id Identifiant du rendez-vous
   * @returns Observable avec les données du rendez-vous confirmé
   */
  confirmerRendezVous(id: string): Observable<RendezVousResponseDto> {
    return this.changeStatutRendezVous(id, StatutRendezVous.ACCEPTED);
  }

  /**
   * Annule un rendez-vous
   * @param id Identifiant du rendez-vous
   * @returns Observable avec les données du rendez-vous annulé
   */
  annulerRendezVous(id: string): Observable<RendezVousResponseDto> {
    return this.changeStatutRendezVous(id, StatutRendezVous.REJECTED);
  }

  /**
   * Reporte un rendez-vous
   * @param id Identifiant du rendez-vous
   * @returns Observable avec les données du rendez-vous reporté
   */
  reporterRendezVous(id: string): Observable<RendezVousResponseDto> {
    return this.changeStatutRendezVous(id, StatutRendezVous.REPORTED);
  }

  /**
   * Récupère les statistiques des rendez-vous
   * @returns Observable avec les statistiques
   */
  getRendezVousStatistics(): Observable<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    reported: number;
    parCentre: { [key: string]: number };
    parMois: { [key: string]: number };
    parStatut: { [key: string]: number };
  }> {
    return this.addCentreIdToParams().pipe(
      switchMap(params => 
        this.apiService.get<any>(`${this.endpoint}/statistics`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques des rendez-vous:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous du jour
   * @returns Observable avec la liste des rendez-vous du jour
   */
  getRendezVousDuJour(): Observable<RendezVousResponseDto[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getRendezVousByDate(today).pipe(
      map(response => response.content || [])
    );
  }

  /**
   * Récupère les rendez-vous à venir
   * @param limit Nombre de rendez-vous à récupérer (défaut: 10)
   * @returns Observable avec la liste des prochains rendez-vous
   */
  getProchainRendezVous(limit = 10): Observable<RendezVousResponseDto[]> {
    const baseParams = {
      limit: limit.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<RendezVousResponseDto[]>(`${this.endpoint}/upcoming`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des prochains rendez-vous:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les rendez-vous récents
   * @param limit Nombre de rendez-vous à récupérer (défaut: 5)
   * @returns Observable avec la liste des rendez-vous récents
   */
  getRecentRendezVous(limit = 5): Observable<RendezVousResponseDto[]> {
    const baseParams = {
      limit: limit.toString()
    };
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<RendezVousResponseDto[]>(`${this.endpoint}/recent`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous récents:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les statuts disponibles
   * @returns Observable avec la liste des statuts
   */
  getStatutsRendezVous(): Observable<StatutRendezVous[]> {
    return new Observable(observer => {
      observer.next(Object.values(StatutRendezVous));
      observer.complete();
    });
  }

  /**
   * Vérifie les conflits d'horaires pour un rendez-vous
   * @param date Date du rendez-vous
   * @param patienteId ID de la patiente (optionnel pour exclure le rendez-vous en cours de modification)
   * @param rendezVousId ID du rendez-vous à exclure (pour les modifications)
   * @returns Observable avec les conflits éventuels
   */
  checkConflitsHoraires(
    date: string, 
    patienteId?: string, 
    rendezVousId?: string
  ): Observable<RendezVousResponseDto[]> {
    // Convertir la date ISO en format LocalDateTime que le serveur Spring Boot comprend
    const formattedDate = this.formatDateForSpringBoot(date);
    
    const baseParams: any = {
      date: formattedDate
    };

    if (patienteId) {
      baseParams.patienteId = patienteId;
    }
    if (rendezVousId) {
      baseParams.excludeId = rendezVousId;
    }
    
    return this.addCentreIdToParams(baseParams).pipe(
      switchMap(params => 
        this.apiService.get<RendezVousResponseDto[]>(`${this.endpoint}/check-conflicts`, params)
      ),
      catchError(error => {
        console.error('Erreur lors de la vérification des conflits d\'horaires:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Formate une date ISO pour Spring Boot LocalDateTime
   * @param isoDate Date au format ISO
   * @returns Date formatée pour Spring Boot (yyyy-MM-ddTHH:mm:ss)
   */
  private formatDateForSpringBoot(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) {
        throw new Error('Date invalide');
      }
      
      // Format: yyyy-MM-ddTHH:mm:ss (sans millisecondes ni fuseau horaire)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      throw error;
    }
  }

  /**
   * Valide les données d'un rendez-vous
   * @param rendezVous Données du rendez-vous à valider
   * @returns true si les données sont valides, false sinon
   */
  validateRendezVousData(rendezVous: Partial<RendezVousRequestDto>): boolean {
    if (!rendezVous) {
      return false;
    }

    // Vérifications obligatoires
    if (!rendezVous.date || rendezVous.date.trim().length === 0) {
      return false;
    }

    if (!rendezVous.motif || rendezVous.motif.trim().length === 0) {
      return false;
    }

    if (!rendezVous.patiente || rendezVous.patiente.trim().length === 0) {
      return false;
    }

    if (!rendezVous.centre || rendezVous.centre.trim().length === 0) {
      return false;
    }

    // Vérifier que la date n'est pas dans le passé (sauf pour les rendez-vous en cours de modification)
    const rendezVousDate = new Date(rendezVous.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (rendezVousDate < today) {
      return false;
    }

    // Vérifier que la date n'est pas trop loin dans le futur (1 an maximum)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (rendezVousDate > maxDate) {
      return false;
    }

    return true;
  }

  /**
   * Récupère le libellé d'un statut
   * @param statut Statut du rendez-vous
   * @returns Libellé du statut
   */
  getStatutLabel(statut: StatutRendezVous): string {
    switch (statut) {
      case StatutRendezVous.PENDING:
        return 'En attente';
      case StatutRendezVous.ACCEPTED:
        return 'Confirmé';
      case StatutRendezVous.REJECTED:
        return 'Annulé';
      case StatutRendezVous.REPORTED:
        return 'Reporté';
      default:
        return 'Inconnu';
    }
  }

  /**
   * Récupère la classe CSS pour le statut
   * @param statut Statut du rendez-vous
   * @returns Classe CSS correspondant au statut
   */
  getStatutClass(statut: StatutRendezVous): string {
    switch (statut) {
      case StatutRendezVous.PENDING:
        return 'status-pending';
      case StatutRendezVous.ACCEPTED:
        return 'status-accepted';
      case StatutRendezVous.REJECTED:
        return 'status-rejected';
      case StatutRendezVous.REPORTED:
        return 'status-reported';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Récupère la couleur associée au statut
   * @param statut Statut du rendez-vous
   * @returns Couleur CSS correspondant au statut
   */
  getStatutColor(statut: StatutRendezVous): string {
    switch (statut) {
      case StatutRendezVous.PENDING:
        return 'var(--warning)';
      case StatutRendezVous.ACCEPTED:
        return 'var(--success)';
      case StatutRendezVous.REJECTED:
        return 'var(--error)';
      case StatutRendezVous.REPORTED:
        return 'var(--info)';
      default:
        return 'var(--gray-500)';
    }
  }
}