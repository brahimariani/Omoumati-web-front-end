import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service API générique servant de base pour toutes les requêtes HTTP vers le backend
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  /**
   * Effectue une requête HTTP GET
   * @param endpoint Chemin de l'API (sans le baseUrl)
   * @param params Paramètres de requête optionnels
   * @returns Observable avec les données de type T
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { params: this.buildParams(params) };
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  /**
   * Effectue une requête HTTP POST
   * @param endpoint Chemin de l'API (sans le baseUrl)
   * @param data Données à envoyer dans le corps de la requête
   * @returns Observable avec les données de type T
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Effectue une requête HTTP PUT
   * @param endpoint Chemin de l'API (sans le baseUrl)
   * @param data Données à envoyer dans le corps de la requête
   * @returns Observable avec les données de type T
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Effectue une requête HTTP PATCH
   * @param endpoint Chemin de l'API (sans le baseUrl)
   * @param data Données à envoyer dans le corps de la requête
   * @returns Observable avec les données de type T
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Effectue une requête HTTP DELETE
   * @param endpoint Chemin de l'API (sans le baseUrl)
   * @returns Observable avec les données de type T
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  /**
   * Construction des paramètres HTTP à partir d'un objet
   * @param params Objet contenant les paramètres
   * @returns HttpParams
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }
} 