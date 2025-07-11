import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Construire l'URL complète d'une image
   */
  buildImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '';
    }
    
    // Si le chemin est déjà une URL complète, l'utiliser tel quel
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Construire l'URL avec l'API de diagnostique
    const baseUrl = environment.apiUrl;
    const diagnostiqueUrl = environment.diagnostiqueApiUrl;
    
    // Nettoyer le chemin (enlever les slashes en début si présents)
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    return `${baseUrl}/${diagnostiqueUrl}images/${cleanPath}`;
  }

  /**
   * Obtenir une image avec authentification (pour le téléchargement)
   */
  getImageBlob(imagePath: string): Observable<Blob> {
    const url = this.buildImageUrl(imagePath);
    
    return this.http.get(url, { 
      responseType: 'blob',
      headers: {
        'Accept': 'image/*'
      }
    }).pipe(
      catchError(error => {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        throw error;
      })
    );
  }

  /**
   * Créer une URL d'objet pour une image (avec authentification)
   */
  createImageObjectUrl(imagePath: string): Observable<string> {
    return this.getImageBlob(imagePath).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(error => {
        console.error('Erreur lors de la création de l\'URL d\'objet:', error);
        return of('');
      })
    );
  }

  /**
   * Télécharger une image
   */
  downloadImage(imagePath: string, filename?: string): Observable<void> {
    return this.getImageBlob(imagePath).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || this.extractFilenameFromPath(imagePath);
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }),
      catchError(error => {
        console.error('Erreur lors du téléchargement:', error);
        throw error;
      })
    );
  }

  /**
   * Vérifier si une image existe
   */
  checkImageExists(imagePath: string): Observable<boolean> {
    const url = this.buildImageUrl(imagePath);
    
    return this.http.head(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Extraire le nom de fichier d'un chemin
   */
  private extractFilenameFromPath(path: string): string {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename || 'image_echographique';
  }

  /**
   * Obtenir l'URL avec token d'authentification pour les images
   * (utile pour les cas où l'intercepteur ne fonctionne pas, comme les balises img)
   */
  getAuthenticatedImageUrl(imagePath: string): string {
    const baseUrl = this.buildImageUrl(imagePath);
    const token = this.authService.getToken();
    
    if (token) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    
    return baseUrl;
  }
} 