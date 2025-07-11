import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service pour gérer les indicateurs de chargement globaux
 * Utilisé par le LoadingInterceptor et les composants UI
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  /**
   * Observable pour s'abonner à l'état de chargement
   */
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() { }

  /**
   * Démarre l'indicateur de chargement (incrémente le compteur de requêtes)
   */
  start(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Termine l'indicateur de chargement (décrémente le compteur de requêtes)
   */
  complete(): void {
    this.requestCount--;
    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Force l'indicateur de chargement à un état spécifique
   * @param loading État de chargement à définir
   */
  setLoading(loading: boolean): void {
    if (loading) {
      this.start();
    } else {
      this.complete();
    }
  }

  /**
   * Réinitialise l'état de chargement et le compteur de requêtes
   * Utile en cas d'erreur pour éviter les blocages
   */
  reset(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }

  /**
   * Retourne l'état actuel de chargement
   * @returns true si une ou plusieurs requêtes sont en cours
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
} 