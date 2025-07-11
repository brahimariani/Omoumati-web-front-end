import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VaccinRequestDto } from '../models/vaccin/vaccin-request.model';
import { VaccinResponseDto } from '../models/vaccin/vaccin-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class VaccinService {
  private readonly apiUrl = `${environment.diagnostiqueApiUrl}vaccins`;

  constructor(private apiService: ApiService) {}

  /**
   * Récupérer tous les vaccins d'une patiente
   */
  getVaccinsByPatiente(patienteId: string): Observable<VaccinResponseDto[]> {
    return this.apiService.get<VaccinResponseDto[]>(`${this.apiUrl}/patiente/${patienteId}`);
  }

  /**
   * Récupérer tous les vaccins d'une naissance
   */
  getVaccinsByNaissance(naissanceId: string): Observable<VaccinResponseDto[]> {
    return this.apiService.get<VaccinResponseDto[]>(`${this.apiUrl}/naissance/${naissanceId}`);
  }

  /**
   * Récupérer un vaccin par ID
   */
  getVaccinById(id: string): Observable<VaccinResponseDto> {
    return this.apiService.get<VaccinResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau vaccin
   */
  createVaccin(vaccin: VaccinRequestDto): Observable<VaccinResponseDto> {
    return this.apiService.post<VaccinResponseDto>(this.apiUrl, vaccin);
  }

  /**
   * Mettre à jour un vaccin
   */
  updateVaccin(id: string, vaccin: VaccinRequestDto): Observable<VaccinResponseDto> {
    return this.apiService.put<VaccinResponseDto>(`${this.apiUrl}/${id}`, vaccin);
  }

  /**
   * Supprimer un vaccin
   */
  deleteVaccin(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les vaccins par nom (type de vaccin)
   */
  getVaccinsByNom(patienteId: string, nom: string): Observable<VaccinResponseDto[]> {
    return this.apiService.get<VaccinResponseDto[]>(`${this.apiUrl}/patiente/${patienteId}/nom/${nom}`);
  }

  /**
   * Récupérer tous les vaccins (pour administration)
   */
  getAllVaccins(): Observable<VaccinResponseDto[]> {
    return this.apiService.get<VaccinResponseDto[]>(this.apiUrl);
  }

  /**
   * Récupérer les vaccins obligatoires manquants pour une naissance
   */
  getVaccinsManquants(naissanceId: string): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.apiUrl}/naissance/${naissanceId}/manquants`);
  }

  /**
   * Marquer un vaccin comme administré
   */
  marquerCommeAdministre(id: string): Observable<VaccinResponseDto> {
    return this.apiService.patch<VaccinResponseDto>(`${this.apiUrl}/${id}/administre`, {});
  }

  /**
   * Générer le calendrier vaccinal pour une naissance
   */
  genererCalendrierVaccinal(naissanceId: string): Observable<VaccinResponseDto[]> {
    return this.apiService.post<VaccinResponseDto[]>(`${this.apiUrl}/naissance/${naissanceId}/calendrier`, {});
  }
} 