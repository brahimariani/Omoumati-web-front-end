import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ExamenEchographiqueRequest } from '../models/examen_echographique/examen-echographique-request.model';
import { ExamenEchographiqueResponse } from '../models/examen_echographique/examen-echographique-response.model';
import { ImageEchographiqueRequest } from '../models/examen_echographique/image_echographique/image-echographique-request.model';
import { ImageEchographiqueResponse } from '../models/examen_echographique/image_echographique/image-echographique-response.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamenEchographiqueService {
  private readonly endpoint = `${environment.diagnostiqueApiUrl}examens-echographiques`;
  
  // Cache des examens échographiques pour optimiser les performances
  private examensEchographiquesCache = new BehaviorSubject<ExamenEchographiqueResponse[]>([]);
  public examensEchographiques$ = this.examensEchographiquesCache.asObservable();

  constructor(private apiService: ApiService) {
    console.log('ExamenEchographiqueService endpoint:', this.endpoint);
    console.log('Environment diagnostiqueApiUrl:', environment.diagnostiqueApiUrl);
    console.log('Environment apiUrl:', environment.apiUrl);
  }

  /**
   * Créer un nouvel examen échographique
   */
  createExamenEchographique(examenRequest: ExamenEchographiqueRequest, images: File[]): Observable<ExamenEchographiqueResponse> {
    console.log('Service createExamenEchographique appelé avec:', {
      examenRequest,
      images,
      nombreImages: images?.length || 0
    });

    // Si aucune image n'est fournie, utiliser la requête JSON simple
    if (!images || images.length === 0) {
      console.log('Aucune image fournie, utilisation de la requête JSON simple');
      return this.apiService.post<any>(this.endpoint, examenRequest)
        .pipe(
          map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
          tap(examen => {
            // Mettre à jour le cache après création
            const currentExamens = this.examensEchographiquesCache.value;
            this.examensEchographiquesCache.next([...currentExamens, examen]);
          }),
          catchError(this.handleError)
        );
    }

    // Si des images sont fournies, utiliser la requête multipart
    console.log('Images fournies, utilisation de la requête multipart');
    const formData = new FormData();
    
    // Ajouter les données de l'examen en tant que RequestPart
    formData.append('examen', JSON.stringify(examenRequest));
    console.log('Données examen ajoutées au FormData:', JSON.stringify(examenRequest));
    
    // Ajouter chaque fichier image en tant que RequestPart
    images.forEach((file, index) => {
      formData.append('images', file);
      console.log(`Image ${index + 1} ajoutée au FormData:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    });

    console.log('FormData préparé, envoi de la requête...');
    return this.apiService.post<any>(this.endpoint, formData)
      .pipe(
        tap(response => console.log('Réponse de l\'API:', response)),
        map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(examen => {
          // Mettre à jour le cache après création
          const currentExamens = this.examensEchographiquesCache.value;
          this.examensEchographiquesCache.next([...currentExamens, examen]);
          console.log('Examen créé avec succès:', examen);
        }),
        catchError(error => {
          console.error('Erreur lors de la création de l\'examen:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtenir tous les examens échographiques avec pagination
   */
  getAllExamensEchographiques(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'desc'): Observable<ApiResponse<ExamenEchographiqueResponse[]>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };

    return this.apiService.get<ApiResponse<ExamenEchographiqueResponse[]>>(this.endpoint, params)
      .pipe(
        tap(response => {
          // Mettre à jour le cache avec les nouvelles données
          const examens = response.data || [];
          if (page === 0) {
            this.examensEchographiquesCache.next(examens);
          } else {
            const currentExamens = this.examensEchographiquesCache.value;
            this.examensEchographiquesCache.next([...currentExamens, ...examens]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir un examen échographique par ID
   */
  getExamenEchographiqueById(id: string): Observable<ExamenEchographiqueResponse> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Examen échographique non trouvé')),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir tous les examens échographiques d'une consultation
   */
  getExamensByConsultation(consultationId: string, page: number = 0, size: number = 20): Observable<ApiResponse<ExamenEchographiqueResponse[]>> {
    const params = {
      consultationId,
      page: page.toString(),
      size: size.toString(),
      sortBy: 'id',
      sortDir: 'desc'
    };

    return this.apiService.get<ApiResponse<ExamenEchographiqueResponse[]>>(`${this.endpoint}/consultation/${consultationId}`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens échographiques d'une consultation (version simple pour le cache)
   */
  getExamensByConsultationSimple(consultationId: string): Observable<ExamenEchographiqueResponse[]> {
    return this.apiService.get<any>(`${this.endpoint}/consultation/${consultationId}`)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens échographiques récents
   */
  getExamensRecents(consultationId?: string, limit: number = 5): Observable<ExamenEchographiqueResponse[]> {
    const params = {
      ...(consultationId && { consultationId }),
      limit: limit.toString(),
      sortBy: 'id',
      sortDir: 'desc'
    };

    return this.apiService.get<any>(`${this.endpoint}/recents`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens échographiques par trimestre de grossesse
   */
  getExamensByTrimestre(trimestre: 1 | 2 | 3, consultationId?: string): Observable<ExamenEchographiqueResponse[]> {
    const params = {
      trimestre: trimestre.toString(),
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<any>(`${this.endpoint}/trimestre`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les examens échographiques avec anomalies détectées
   */
  getExamensAvecAnomalies(consultationId?: string): Observable<ExamenEchographiqueResponse[]> {
    const params = consultationId ? { consultationId } : {};

    return this.apiService.get<any>(`${this.endpoint}/anomalies`, params)
      .pipe(
        map(response => this.extractExamensFromResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des examens échographiques par observation ou critères
   */
  searchExamens(searchTerm: string, consultationId?: string, page: number = 0, size: number = 10): Observable<ApiResponse<ExamenEchographiqueResponse[]>> {
    const params = {
      q: searchTerm,
      page: page.toString(),
      size: size.toString(),
      ...(consultationId && { consultationId })
    };

    return this.apiService.get<ApiResponse<ExamenEchographiqueResponse[]>>(`${this.endpoint}/search`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour un examen échographique
   */
  updateExamenEchographique(id: string, examenRequest: ExamenEchographiqueRequest, images: File[]): Observable<ExamenEchographiqueResponse> {
    // Si aucune image n'est fournie, utiliser la requête JSON simple
    if (!images || images.length === 0) {
      return this.apiService.put<any>(`${this.endpoint}/${id}`, examenRequest)
        .pipe(
          map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
          tap(updatedExamen => {
            // Mettre à jour le cache après modification
            const currentExamens = this.examensEchographiquesCache.value;
            const updatedExamens = currentExamens.map(examen =>
              examen.id === updatedExamen.id ? updatedExamen : examen
            );
            this.examensEchographiquesCache.next(updatedExamens);
          }),
          catchError(this.handleError)
        );
    }

    // Si des images sont fournies, utiliser la requête multipart
    const formData = new FormData();
    
    // Ajouter les données de l'examen en tant que RequestPart
    formData.append('examen', JSON.stringify(examenRequest));
    
    // Ajouter chaque fichier image en tant que RequestPart
    images.forEach((file) => {
      formData.append('images', file);
    });

    return this.apiService.put<any>(`${this.endpoint}/${id}`, formData)
      .pipe(
        map(response => this.extractExamenFromResponse(response, 'Aucune donnée reçue du serveur')),
        tap(updatedExamen => {
          // Mettre à jour le cache après modification
          const currentExamens = this.examensEchographiquesCache.value;
          const updatedExamens = currentExamens.map(examen =>
            examen.id === updatedExamen.id ? updatedExamen : examen
          );
          this.examensEchographiquesCache.next(updatedExamens);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer un examen échographique
   */
  deleteExamenEchographique(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
      .pipe(
        tap(() => {
          // Mettre à jour le cache après suppression
          const currentExamens = this.examensEchographiquesCache.value;
          const filteredExamens = currentExamens.filter(examen => examen.id !== id);
          this.examensEchographiquesCache.next(filteredExamens);
        }),
        catchError(this.handleError)
      );
  }

  // ===== MÉTHODES SPÉCIALISÉES POUR LES MESURES ÉCHOGRAPHIQUES =====

  /**
   * Analyser les mesures échographiques et détecter les anomalies
   */
  analyserMesuresEchographiques(examen: ExamenEchographiqueResponse, ageGestationnel?: number): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  }[] {
    const analyses: {
      mesure: string;
      valeur: string | number;
      statut: 'normal' | 'anormal' | 'critique';
      interpretation: string;
    }[] = [];

    // Analyse du nombre d'embryons
    if (examen.nbEmbryons > 0) {
      analyses.push({
        mesure: 'Nombre d\'embryons',
        valeur: examen.nbEmbryons,
        statut: examen.nbEmbryons === 1 ? 'normal' : examen.nbEmbryons > 1 ? 'anormal' : 'critique',
        interpretation: examen.nbEmbryons === 1 ? 'Grossesse unique' : 
                      examen.nbEmbryons > 1 ? 'Grossesse multiple - Surveillance renforcée' : 
                      'Aucun embryon détecté'
      });
    }

    // Analyse de la LCC (Longueur Cranio-Caudale)
    if (examen.lcc && examen.lcc.trim() !== '') {
      const lccValue = parseFloat(examen.lcc);
      if (!isNaN(lccValue)) {
        analyses.push(this.analyserLCC(lccValue, ageGestationnel));
      }
    }

    // Analyse de la CN (Clarté Nucale)
    if (examen.cn && examen.cn.trim() !== '') {
      const cnValue = parseFloat(examen.cn);
      if (!isNaN(cnValue)) {
        analyses.push(this.analyserCN(cnValue, ageGestationnel));
      }
    }

    // Analyse du BIP (Diamètre Bipariétal)
    if (examen.bip && examen.bip.trim() !== '') {
      const bipValue = parseFloat(examen.bip);
      if (!isNaN(bipValue)) {
        analyses.push(this.analyserBIP(bipValue, ageGestationnel));
      }
    }

    // Analyse du DAT (Diamètre Abdominal Transverse)
    if (examen.dat && examen.dat.trim() !== '') {
      const datValue = parseFloat(examen.dat);
      if (!isNaN(datValue)) {
        analyses.push(this.analyserDAT(datValue, ageGestationnel));
      }
    }

    // Analyse de la longueur fémorale
    if (examen.longueurFemoral > 0) {
      analyses.push(this.analyserLongueurFemorale(examen.longueurFemoral, ageGestationnel));
    }

    // Analyse du placenta
    if (examen.placenta && examen.placenta.trim() !== '') {
      analyses.push(this.analyserPlacenta(examen.placenta));
    }

    // Analyse du liquide amniotique
    if (examen.liquideAmniotique && examen.liquideAmniotique.trim() !== '') {
      analyses.push(this.analyserLiquideAmniotique(examen.liquideAmniotique));
    }

    return analyses;
  }

  /**
   * Analyser la LCC (Longueur Cranio-Caudale)
   */
  private analyserLCC(lcc: number, ageGestationnel?: number): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    // Normes approximatives pour la LCC selon l'âge gestationnel
    if (ageGestationnel) {
      if (ageGestationnel <= 12) { // Premier trimestre
        if (lcc < 15) {
          return {
            mesure: 'LCC',
            valeur: `${lcc} mm`,
            statut: 'anormal',
            interpretation: 'LCC faible - Retard de croissance possible'
          };
        } else if (lcc > 84) {
          return {
            mesure: 'LCC',
            valeur: `${lcc} mm`,
            statut: 'anormal',
            interpretation: 'LCC élevée - Âge gestationnel à réévaluer'
          };
        }
      }
    }

    return {
      mesure: 'LCC',
      valeur: `${lcc} mm`,
      statut: 'normal',
      interpretation: 'Longueur cranio-caudale dans les normes'
    };
  }

  /**
   * Analyser la CN (Clarté Nucale)
   */
  private analyserCN(cn: number, ageGestationnel?: number): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    if (cn > 3.5) {
      return {
        mesure: 'Clarté Nucale',
        valeur: `${cn} mm`,
        statut: 'critique',
        interpretation: 'CN augmentée - Risque chromosomique élevé - Conseil génétique recommandé'
      };
    } else if (cn > 2.5) {
      return {
        mesure: 'Clarté Nucale',
        valeur: `${cn} mm`,
        statut: 'anormal',
        interpretation: 'CN légèrement augmentée - Surveillance renforcée'
      };
    }

    return {
      mesure: 'Clarté Nucale',
      valeur: `${cn} mm`,
      statut: 'normal',
      interpretation: 'Clarté nucale normale'
    };
  }

  /**
   * Analyser le BIP (Diamètre Bipariétal)
   */
  private analyserBIP(bip: number, ageGestationnel?: number): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    // Analyse basique - peut être affinée avec des courbes de référence
    if (bip < 20) {
      return {
        mesure: 'BIP',
        valeur: `${bip} mm`,
        statut: 'anormal',
        interpretation: 'BIP faible - Microcéphalie possible'
      };
    } else if (bip > 100) {
      return {
        mesure: 'BIP',
        valeur: `${bip} mm`,
        statut: 'anormal',
        interpretation: 'BIP élevé - Macrocéphalie possible'
      };
    }

    return {
      mesure: 'BIP',
      valeur: `${bip} mm`,
      statut: 'normal',
      interpretation: 'Diamètre bipariétal dans les normes'
    };
  }

  /**
   * Analyser le DAT (Diamètre Abdominal Transverse)
   */
  private analyserDAT(dat: number, ageGestationnel?: number): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    // Analyse basique - peut être affinée avec des courbes de référence
    if (dat < 15) {
      return {
        mesure: 'DAT',
        valeur: `${dat} mm`,
        statut: 'anormal',
        interpretation: 'DAT faible - Retard de croissance intra-utérin possible'
      };
    } else if (dat > 120) {
      return {
        mesure: 'DAT',
        valeur: `${dat} mm`,
        statut: 'anormal',
        interpretation: 'DAT élevé - Macrosomie fœtale possible'
      };
    }

    return {
      mesure: 'DAT',
      valeur: `${dat} mm`,
      statut: 'normal',
      interpretation: 'Diamètre abdominal transverse dans les normes'
    };
  }

  /**
   * Analyser la longueur fémorale
   */
  private analyserLongueurFemorale(lf: number, ageGestationnel?: number): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    if (lf < 10) {
      return {
        mesure: 'Longueur Fémorale',
        valeur: `${lf} mm`,
        statut: 'anormal',
        interpretation: 'LF courte - Nanisme possible'
      };
    } else if (lf > 80) {
      return {
        mesure: 'Longueur Fémorale',
        valeur: `${lf} mm`,
        statut: 'anormal',
        interpretation: 'LF longue - Macrosomie possible'
      };
    }

    return {
      mesure: 'Longueur Fémorale',
      valeur: `${lf} mm`,
      statut: 'normal',
      interpretation: 'Longueur fémorale dans les normes'
    };
  }

  /**
   * Analyser le placenta
   */
  private analyserPlacenta(placenta: string): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    const placentaLower = placenta.toLowerCase();
    
    if (placentaLower.includes('praevia') || placentaLower.includes('recouvrant')) {
      return {
        mesure: 'Placenta',
        valeur: placenta,
        statut: 'critique',
        interpretation: 'Placenta praevia - Surveillance étroite et césarienne probable'
      };
    } else if (placentaLower.includes('décollement') || placentaLower.includes('hématome')) {
      return {
        mesure: 'Placenta',
        valeur: placenta,
        statut: 'critique',
        interpretation: 'Décollement placentaire - Urgence obstétricale'
      };
    } else if (placentaLower.includes('calcifications') || placentaLower.includes('vieillissement')) {
      return {
        mesure: 'Placenta',
        valeur: placenta,
        statut: 'anormal',
        interpretation: 'Vieillissement placentaire - Surveillance renforcée'
      };
    }

    return {
      mesure: 'Placenta',
      valeur: placenta,
      statut: 'normal',
      interpretation: 'Placenta d\'aspect normal'
    };
  }

  /**
   * Analyser le liquide amniotique
   */
  private analyserLiquideAmniotique(liquide: string): {
    mesure: string;
    valeur: string | number;
    statut: 'normal' | 'anormal' | 'critique';
    interpretation: string;
  } {
    const liquideLower = liquide.toLowerCase();
    
    if (liquideLower.includes('oligoamnios') || liquideLower.includes('diminué')) {
      return {
        mesure: 'Liquide Amniotique',
        valeur: liquide,
        statut: 'anormal',
        interpretation: 'Oligoamnios - Surveillance renforcée du bien-être fœtal'
      };
    } else if (liquideLower.includes('polyhydramnios') || liquideLower.includes('augmenté')) {
      return {
        mesure: 'Liquide Amniotique',
        valeur: liquide,
        statut: 'anormal',
        interpretation: 'Polyhydramnios - Recherche de malformations'
      };
    } else if (liquideLower.includes('anhydramnios') || liquideLower.includes('absent')) {
      return {
        mesure: 'Liquide Amniotique',
        valeur: liquide,
        statut: 'critique',
        interpretation: 'Anhydramnios - Pronostic fœtal réservé'
      };
    }

    return {
      mesure: 'Liquide Amniotique',
      valeur: liquide,
      statut: 'normal',
      interpretation: 'Quantité de liquide amniotique normale'
    };
  }

  // ===== MÉTHODES POUR LA GESTION DES IMAGES =====

  /**
   * Ajouter une image à un examen échographique
   */
  ajouterImage(examenId: string, imageRequest: ImageEchographiqueRequest): Observable<ImageEchographiqueResponse> {
    return this.apiService.post<any>(`${this.endpoint}/${examenId}/images`, imageRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer une image d'un examen échographique
   */
  supprimerImage(examenId: string, imageId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${examenId}/images/${imageId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les images d'un examen échographique
   */
  getImagesExamen(examenId: string): Observable<ImageEchographiqueResponse[]> {
    return this.apiService.get<any>(`${this.endpoint}/${examenId}/images`)
      .pipe(
        map(response => Array.isArray(response) ? response : response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Upload d'une image échographique
   */
  uploadImage(examenId: string, file: File, titre: string): Observable<ImageEchographiqueResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('titre', titre);

    return this.apiService.post<any>(`${this.endpoint}/${examenId}/upload-image`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Obtenir les statistiques des examens échographiques
   */
  getStatistiquesExamens(consultationId?: string, dateDebut?: Date, dateFin?: Date): Observable<{
    total: number;
    nombreImages: number;
    nombreAnomalies: number;
    repartitionTrimestres: { [key: string]: number };
    mesuresMoyennes: { [key: string]: number };
  }> {
    const params: any = {};
    if (consultationId) params.consultationId = consultationId;
    if (dateDebut) params.dateDebut = dateDebut.toISOString();
    if (dateFin) params.dateFin = dateFin.toISOString();

    return this.apiService.get<any>(`${this.endpoint}/statistiques`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.examensEchographiquesCache.next([]);
  }

  /**
   * Actualiser le cache pour une consultation spécifique
   */
  refreshCacheForConsultation(consultationId: string): Observable<ExamenEchographiqueResponse[]> {
    return this.getExamensByConsultationSimple(consultationId)
      .pipe(
        tap(examens => {
          // Mettre à jour le cache avec les examens de cette consultation
          const currentExamens = this.examensEchographiquesCache.value;
          const otherExamens = currentExamens.filter(e => 
            !examens.some(newE => newE.id === e.id)
          );
          this.examensEchographiquesCache.next([...otherExamens, ...examens]);
        })
      );
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur est survenue lors de l\'opération';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès interdit - Permissions insuffisantes';
          break;
        case 404:
          errorMessage = 'Examen échographique non trouvé';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflit de données';
          break;
        case 413:
          errorMessage = 'Fichier image trop volumineux';
          break;
        case 415:
          errorMessage = 'Format d\'image non supporté';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données non valides';
          break;
        case 500:
          errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
        default:
          errorMessage = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Erreur ExamenEchographiqueService:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  };

  /**
   * Extraire un examen échographique de la réponse API
   */
  private extractExamenFromResponse(response: any, errorMessage: string = 'Format de réponse invalide'): ExamenEchographiqueResponse {
    if (!response) {
      throw new Error(errorMessage);
    }

    // Si la réponse contient directement l'examen
    if (response.id && response.nbEmbryons !== undefined) {
      return response as ExamenEchographiqueResponse;
    }

    // Si la réponse est encapsulée dans un objet data
    if (response.data && response.data.id && response.data.nbEmbryons !== undefined) {
      return response.data as ExamenEchographiqueResponse;
    }

    throw new Error(errorMessage);
  }

  /**
   * Extraire une liste d'examens échographiques de la réponse API
   */
  private extractExamensFromResponse(response: any): ExamenEchographiqueResponse[] {
    if (!response) {
      return [];
    }

    // Si la réponse est directement un tableau
    if (Array.isArray(response)) {
      return response as ExamenEchographiqueResponse[];
    }

    // Si la réponse contient un tableau dans data
    if (response.data && Array.isArray(response.data)) {
      return response.data as ExamenEchographiqueResponse[];
    }

    // Si la réponse contient un tableau dans content (pagination Spring)
    if (response.content && Array.isArray(response.content)) {
      return response.content as ExamenEchographiqueResponse[];
    }

    return [];
  }
} 