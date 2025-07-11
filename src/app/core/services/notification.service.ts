import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface Notification {
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  action?: string;
}

/**
 * Service de gestion des notifications utilisateur
 * Utilise MatSnackBar d'Angular Material pour les messages toast
 * et un système d'événements pour les notifications plus complexes
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private defaultDuration = 5000; // 5 secondes par défaut

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Observable pour s'abonner aux notifications
   * Utilisé pour les composants qui veulent afficher des notifications personnalisées
   */
  get notifications$(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  /**
   * Affiche une notification de succès
   * @param message Message à afficher
   * @param title Titre optionnel
   * @param duration Durée d'affichage en ms
   */
  success(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: NotificationType.SUCCESS,
      message,
      title,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Affiche une notification d'erreur
   * @param message Message à afficher
   * @param title Titre optionnel
   * @param duration Durée d'affichage en ms
   */
  error(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: NotificationType.ERROR,
      message,
      title,
      duration: duration || this.defaultDuration * 1.5 // Erreurs affichées plus longtemps
    });
  }

  /**
   * Affiche une notification d'information
   * @param message Message à afficher
   * @param title Titre optionnel
   * @param duration Durée d'affichage en ms
   */
  info(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: NotificationType.INFO,
      message,
      title,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Affiche une notification d'avertissement
   * @param message Message à afficher
   * @param title Titre optionnel
   * @param duration Durée d'affichage en ms
   */
  warning(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: NotificationType.WARNING,
      message,
      title,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Affiche une notification avec bouton d'action
   * @param message Message à afficher
   * @param action Texte du bouton d'action
   * @param callback Fonction à exécuter lors du clic sur le bouton
   * @param type Type de notification
   * @param duration Durée d'affichage en ms
   */
  withAction(
    message: string,
    action: string,
    callback: () => void,
    type: NotificationType = NotificationType.INFO,
    duration?: number
  ): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.defaultDuration,
      panelClass: [`notification-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.onAction().subscribe(() => {
      callback();
    });
  }

  /**
   * Affiche une notification personnalisée
   * @param notification Objet de notification
   */
  private showNotification(notification: Notification): void {
    // Émet l'événement pour les composants abonnés
    this.notificationSubject.next(notification);
    
    // Configuration du snackbar
    const config: MatSnackBarConfig = {
      duration: notification.duration || this.defaultDuration,
      panelClass: [`notification-${notification.type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };
    
    // Affiche le snackbar
    this.snackBar.open(
      notification.message,
      notification.action || 'Fermer',
      config
    );
  }
} 