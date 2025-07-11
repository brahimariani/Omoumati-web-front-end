import { Injectable } from '@angular/core';

/**
 * Service de gestion du stockage local
 * Permet de stocker, récupérer et supprimer des données du localStorage
 * avec gestion d'expiration et encodage/décodage automatique
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  constructor() { }

  /**
   * Stocke une valeur dans le localStorage
   * @param key Clé pour le stockage
   * @param value Valeur à stocker
   * @param expiresInMinutes Durée de validité en minutes (optionnel)
   */
  set(key: string, value: any, expiresInMinutes?: number): void {
    try {
      const data: StorageItem = {
        value: value,
        timestamp: new Date().getTime()
      };
      
      // Ajout de la date d'expiration si spécifiée
      if (expiresInMinutes) {
        data.expiry = new Date().getTime() + (expiresInMinutes * 60 * 1000);
      }
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors du stockage de données', error);
    }
  }

  /**
   * Récupère une valeur depuis le localStorage
   * @param key Clé pour récupérer la valeur
   * @returns La valeur stockée ou null si non trouvée ou expirée
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      
      if (!item) {
        return null;
      }
      
      const data: StorageItem = JSON.parse(item);
      
      // Vérification de l'expiration
      if (data.expiry && new Date().getTime() > data.expiry) {
        this.remove(key);
        return null;
      }
      
      return data.value as T;
    } catch (error) {
      console.error('Erreur lors de la récupération des données', error);
      return null;
    }
  }

  /**
   * Supprime une valeur du localStorage
   * @param key Clé à supprimer
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Vide complètement le localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Vérifie si une clé existe dans le localStorage et n'est pas expirée
   * @param key Clé à vérifier
   * @returns true si la clé existe et n'est pas expirée
   */
  exists(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  /**
   * Récupère toutes les clés du localStorage qui commencent par un préfixe donné
   * @param prefix Préfixe pour filtrer les clés (optionnel)
   * @returns Liste des clés correspondantes
   */
  getKeys(prefix?: string): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (!prefix || key.startsWith(prefix))) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  /**
   * Supprime toutes les clés expirées du localStorage
   * @returns Nombre d'éléments supprimés
   */
  clearExpired(): number {
    let count = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const data: StorageItem = JSON.parse(item);
            if (data.expiry && new Date().getTime() > data.expiry) {
              this.remove(key);
              count++;
              i--; // Ajuster l'index car nous venons de supprimer un élément
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
      }
    }
    
    return count;
  }
}

/**
 * Interface pour les éléments stockés
 */
interface StorageItem {
  value: any;
  timestamp: number;
  expiry?: number;
} 