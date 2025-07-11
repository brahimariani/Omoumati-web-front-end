import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SidePanelConfig {
  title: string;
  component: any;
  data?: any;
  width?: string;
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SidePanelService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<SidePanelConfig | null>(null);

  constructor() {
    // S'assurer que le service démarre dans un état propre
    this.reset();
  }

  /**
   * Observable pour l'état d'ouverture du panel
   */
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  /**
   * Observable pour la configuration du panel
   */
  public config$: Observable<SidePanelConfig | null> = this.configSubject.asObservable();

  /**
   * Réinitialiser le service
   */
  private reset(): void {
    this.isOpenSubject.next(false);
    this.configSubject.next(null);
  }

  /**
   * Ouvrir le side panel avec une configuration
   */
  open(config: SidePanelConfig): void {
    this.configSubject.next({
      width: '700px',
      showCloseButton: true,
      ...config
    });
    this.isOpenSubject.next(true);
  }

  /**
   * Fermer le side panel
   */
  close(): void {
    this.isOpenSubject.next(false);
    // Délai pour permettre l'animation de fermeture
    setTimeout(() => {
      this.configSubject.next(null);
    }, 300);
  }

  /**
   * Vérifier si le panel est ouvert
   */
  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  /**
   * Obtenir la configuration actuelle
   */
  get currentConfig(): SidePanelConfig | null {
    return this.configSubject.value;
  }
} 