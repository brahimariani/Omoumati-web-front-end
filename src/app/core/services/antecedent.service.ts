import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AntecedentRequest } from '../models/antecedent/antecedent.request.model';
import { AntecedentResponse } from '../models/antecedent/antecedent.response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AntecedentService {
  private readonly apiUrl = `${environment.parientesApiUrl}antecedents`;

  constructor(private apiService: ApiService) {}

  /**
   * Récupérer tous les antécédents d'une patiente
   */
  getAntecedentsByPatiente(patienteId: string): Observable<AntecedentResponse[]> {
    return this.apiService.get<AntecedentResponse[]>(`${this.apiUrl}/patiente/${patienteId}`);
  }

  /**
   * Récupérer un antécédent par ID
   */
  getAntecedentById(id: string): Observable<AntecedentResponse> {
    return this.apiService.get<AntecedentResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouvel antécédent
   */
  createAntecedent(antecedent: AntecedentRequest): Observable<AntecedentResponse> {
    return this.apiService.post<AntecedentResponse>(this.apiUrl, antecedent);
  }

  /**
   * Mettre à jour un antécédent
   */
  updateAntecedent(id: string, antecedent: AntecedentRequest): Observable<AntecedentResponse> {
    return this.apiService.put<AntecedentResponse>(`${this.apiUrl}/${id}`, antecedent);
  }

  /**
   * Supprimer un antécédent
   */
  deleteAntecedent(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les antécédents par nature
   */
  getAntecedentsByNature(patienteId: string, nature: string): Observable<AntecedentResponse[]> {
    return this.apiService.get<AntecedentResponse[]>(`${this.apiUrl}/patiente/${patienteId}/nature/${nature}`);
  }
} 