import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface pour les composants avec des changements non sauvegardés
 */
export interface ComponentCanDeactivate {
  /**
   * Vérifie si le composant peut être quitté
   * @returns true si le composant peut être quitté, sinon false
   */
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Guard pour prévenir la perte de modifications non sauvegardées
 * Demande confirmation avant de quitter une page avec des changements non sauvegardés
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  /**
   * Vérifie si le composant peut être désactivé
   * @param component Composant implémentant l'interface ComponentCanDeactivate
   * @returns true si le composant peut être désactivé, sinon demande confirmation
   */
  canDeactivate(component: ComponentCanDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    // Si le composant n'implémente pas canDeactivate, autoriser la navigation
    if (!component.canDeactivate) {
      return true;
    }

    // Appeler la méthode canDeactivate du composant
    const canDeactivateResult = component.canDeactivate();

    // Si le résultat est déjà false, demander confirmation
    if (canDeactivateResult === false) {
      return this.confirmNavigation();
    }

    // Si le résultat est une Promise, la traiter
    if (canDeactivateResult instanceof Promise) {
      return canDeactivateResult.then(canDeactivate => 
        canDeactivate ? true : this.confirmNavigation()
      );
    }

    // Si le résultat est un Observable, le traiter
    if (canDeactivateResult instanceof Observable) {
      return canDeactivateResult.pipe(
        map(canDeactivate => canDeactivate ? true : this.confirmNavigation())
      );
    }

    // Sinon, autoriser la navigation
    return canDeactivateResult;
  }

  /**
   * Demande confirmation à l'utilisateur avant de quitter la page
   * @returns true si l'utilisateur confirme, sinon false
   */
  private confirmNavigation(): boolean {
    return window.confirm(
      'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter cette page?'
    );
  }
} 