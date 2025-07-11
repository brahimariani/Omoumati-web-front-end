import { createAction, props } from '@ngrx/store';
import { ExamenEchographiqueRequest } from '../../core/models/examen_echographique/examen-echographique-request.model';
import { ExamenEchographiqueResponse } from '../../core/models/examen_echographique/examen-echographique-response.model';
import { ImageEchographiqueRequest } from '../../core/models/examen_echographique/image_echographique/image-echographique-request.model';
import { ImageEchographiqueResponse } from '../../core/models/examen_echographique/image_echographique/image-echographique-response.model';
import { ApiResponse } from '../../core/models/api-response.model';

// ===== ACTIONS CRUD DE BASE =====

/**
 * Charger tous les examens échographiques
 */
export const loadExamensEchographiques = createAction(
  '[Examens Échographiques] Load Examens Échographiques',
  props<{ page?: number; size?: number; sortBy?: string; sortDir?: string }>()
);

export const loadExamensEchographiquesSuccess = createAction(
  '[Examens Échographiques] Load Examens Échographiques Success',
  props<{ response: ApiResponse<ExamenEchographiqueResponse[]> }>()
);

export const loadExamensEchographiquesFailure = createAction(
  '[Examens Échographiques] Load Examens Échographiques Failure',
  props<{ error: string }>()
);

/**
 * Charger un examen échographique par ID
 */
export const loadExamenEchographique = createAction(
  '[Examens Échographiques] Load Examen Échographique',
  props<{ id: string }>()
);

export const loadExamenEchographiqueSuccess = createAction(
  '[Examens Échographiques] Load Examen Échographique Success',
  props<{ examen: ExamenEchographiqueResponse }>()
);

export const loadExamenEchographiqueFailure = createAction(
  '[Examens Échographiques] Load Examen Échographique Failure',
  props<{ error: string }>()
);

/**
 * Créer un examen échographique
 */
export const createExamenEchographique = createAction(
  '[Examens Échographiques] Create Examen Échographique',
  props<{ examenRequest: ExamenEchographiqueRequest; images: File[] }>()
);

export const createExamenEchographiqueSuccess = createAction(
  '[Examens Échographiques] Create Examen Échographique Success',
  props<{ examen: ExamenEchographiqueResponse }>()
);

export const createExamenEchographiqueFailure = createAction(
  '[Examens Échographiques] Create Examen Échographique Failure',
  props<{ error: string }>()
);

/**
 * Mettre à jour un examen échographique
 */
export const updateExamenEchographique = createAction(
  '[Examens Échographiques] Update Examen Échographique',
  props<{ id: string; examenRequest: ExamenEchographiqueRequest; images: File[] }>()
);

export const updateExamenEchographiqueSuccess = createAction(
  '[Examens Échographiques] Update Examen Échographique Success',
  props<{ examen: ExamenEchographiqueResponse }>()
);

export const updateExamenEchographiqueFailure = createAction(
  '[Examens Échographiques] Update Examen Échographique Failure',
  props<{ error: string }>()
);

/**
 * Supprimer un examen échographique
 */
export const deleteExamenEchographique = createAction(
  '[Examens Échographiques] Delete Examen Échographique',
  props<{ id: string }>()
);

export const deleteExamenEchographiqueSuccess = createAction(
  '[Examens Échographiques] Delete Examen Échographique Success',
  props<{ id: string }>()
);

export const deleteExamenEchographiqueFailure = createAction(
  '[Examens Échographiques] Delete Examen Échographique Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE RECHERCHE SPÉCIALISÉES =====

/**
 * Charger les examens échographiques par consultation
 */
export const loadExamensByConsultation = createAction(
  '[Examens Échographiques] Load Examens By Consultation',
  props<{ consultationId: string; page?: number; size?: number }>()
);

export const loadExamensByConsultationSuccess = createAction(
  '[Examens Échographiques] Load Examens By Consultation Success',
  props<{ examens: ExamenEchographiqueResponse[]; consultationId: string }>()
);

export const loadExamensByConsultationFailure = createAction(
  '[Examens Échographiques] Load Examens By Consultation Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens échographiques récents
 */
export const loadExamensRecents = createAction(
  '[Examens Échographiques] Load Examens Récents',
  props<{ consultationId?: string; limit?: number }>()
);

export const loadExamensRecentsSuccess = createAction(
  '[Examens Échographiques] Load Examens Récents Success',
  props<{ examens: ExamenEchographiqueResponse[] }>()
);

export const loadExamensRecentsFailure = createAction(
  '[Examens Échographiques] Load Examens Récents Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens échographiques par trimestre
 */
export const loadExamensByTrimestre = createAction(
  '[Examens Échographiques] Load Examens By Trimestre',
  props<{ trimestre: 1 | 2 | 3; consultationId?: string }>()
);

export const loadExamensByTrimestreSuccess = createAction(
  '[Examens Échographiques] Load Examens By Trimestre Success',
  props<{ examens: ExamenEchographiqueResponse[]; trimestre: 1 | 2 | 3 }>()
);

export const loadExamensByTrimestreFailure = createAction(
  '[Examens Échographiques] Load Examens By Trimestre Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens échographiques avec anomalies
 */
export const loadExamensAvecAnomalies = createAction(
  '[Examens Échographiques] Load Examens Avec Anomalies',
  props<{ consultationId?: string }>()
);

export const loadExamensAvecAnomaliesSuccess = createAction(
  '[Examens Échographiques] Load Examens Avec Anomalies Success',
  props<{ examens: ExamenEchographiqueResponse[] }>()
);

export const loadExamensAvecAnomaliesFailure = createAction(
  '[Examens Échographiques] Load Examens Avec Anomalies Failure',
  props<{ error: string }>()
);

/**
 * Rechercher des examens échographiques
 */
export const searchExamens = createAction(
  '[Examens Échographiques] Search Examens',
  props<{ searchTerm: string; consultationId?: string; page?: number; size?: number }>()
);

export const searchExamensSuccess = createAction(
  '[Examens Échographiques] Search Examens Success',
  props<{ response: ApiResponse<ExamenEchographiqueResponse[]>; searchTerm: string }>()
);

export const searchExamensFailure = createAction(
  '[Examens Échographiques] Search Examens Failure',
  props<{ error: string }>()
);

// ===== ACTIONS SPÉCIALISÉES POUR LES MESURES ÉCHOGRAPHIQUES =====

/**
 * Analyser les mesures échographiques
 */
export const analyserMesuresEchographiques = createAction(
  '[Examens Échographiques] Analyser Mesures Échographiques',
  props<{ examen: ExamenEchographiqueResponse; ageGestationnel?: number }>()
);

export const analyserMesuresEchographiquesSuccess = createAction(
  '[Examens Échographiques] Analyser Mesures Échographiques Success',
  props<{ 
    examenId: string; 
    analyses: {
      mesure: string;
      valeur: string | number;
      statut: 'normal' | 'anormal' | 'critique';
      interpretation: string;
    }[]
  }>()
);

export const analyserMesuresEchographiquesFailure = createAction(
  '[Examens Échographiques] Analyser Mesures Échographiques Failure',
  props<{ error: string }>()
);

// ===== ACTIONS POUR LA GESTION DES IMAGES =====

/**
 * Charger les images d'un examen échographique
 */
export const loadImagesExamen = createAction(
  '[Examens Échographiques] Load Images Examen',
  props<{ examenId: string }>()
);

export const loadImagesExamenSuccess = createAction(
  '[Examens Échographiques] Load Images Examen Success',
  props<{ examenId: string; images: ImageEchographiqueResponse[] }>()
);

export const loadImagesExamenFailure = createAction(
  '[Examens Échographiques] Load Images Examen Failure',
  props<{ error: string }>()
);

/**
 * Ajouter une image à un examen échographique
 */
export const ajouterImage = createAction(
  '[Examens Échographiques] Ajouter Image',
  props<{ examenId: string; imageRequest: ImageEchographiqueRequest }>()
);

export const ajouterImageSuccess = createAction(
  '[Examens Échographiques] Ajouter Image Success',
  props<{ examenId: string; image: ImageEchographiqueResponse }>()
);

export const ajouterImageFailure = createAction(
  '[Examens Échographiques] Ajouter Image Failure',
  props<{ error: string }>()
);

/**
 * Supprimer une image d'un examen échographique
 */
export const supprimerImage = createAction(
  '[Examens Échographiques] Supprimer Image',
  props<{ examenId: string; imageId: string }>()
);

export const supprimerImageSuccess = createAction(
  '[Examens Échographiques] Supprimer Image Success',
  props<{ examenId: string; imageId: string }>()
);

export const supprimerImageFailure = createAction(
  '[Examens Échographiques] Supprimer Image Failure',
  props<{ error: string }>()
);

/**
 * Upload d'une image échographique
 */
export const uploadImage = createAction(
  '[Examens Échographiques] Upload Image',
  props<{ examenId: string; file: File; titre: string }>()
);

export const uploadImageSuccess = createAction(
  '[Examens Échographiques] Upload Image Success',
  props<{ examenId: string; image: ImageEchographiqueResponse }>()
);

export const uploadImageFailure = createAction(
  '[Examens Échographiques] Upload Image Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE GESTION D'ÉTAT =====

/**
 * Sélectionner un examen échographique
 */
export const selectExamen = createAction(
  '[Examens Échographiques] Select Examen',
  props<{ id: string }>()
);

/**
 * Désélectionner l'examen échographique
 */
export const deselectExamen = createAction(
  '[Examens Échographiques] Deselect Examen'
);

/**
 * Définir les filtres
 */
export const setFilters = createAction(
  '[Examens Échographiques] Set Filters',
  props<{ filters: any }>()
);

/**
 * Réinitialiser les filtres
 */
export const resetFilters = createAction(
  '[Examens Échographiques] Reset Filters'
);

/**
 * Définir la pagination
 */
export const setPagination = createAction(
  '[Examens Échographiques] Set Pagination',
  props<{ page: number; size: number }>()
);

/**
 * Définir le tri
 */
export const setSorting = createAction(
  '[Examens Échographiques] Set Sorting',
  props<{ sortBy: string; sortDir: 'asc' | 'desc' }>()
);

// ===== ACTIONS DE STATISTIQUES =====

/**
 * Charger les statistiques des examens échographiques
 */
export const loadStatistiques = createAction(
  '[Examens Échographiques] Load Statistiques',
  props<{ consultationId?: string; dateDebut?: Date; dateFin?: Date }>()
);

export const loadStatistiquesSuccess = createAction(
  '[Examens Échographiques] Load Statistiques Success',
  props<{ 
    statistiques: {
      total: number;
      nombreImages: number;
      nombreAnomalies: number;
      repartitionTrimestres: { [key: string]: number };
      mesuresMoyennes: { [key: string]: number };
    }
  }>()
);

export const loadStatistiquesFailure = createAction(
  '[Examens Échographiques] Load Statistiques Failure',
  props<{ error: string }>()
);

// ===== ACTIONS UTILITAIRES =====

/**
 * Vider le cache
 */
export const clearCache = createAction(
  '[Examens Échographiques] Clear Cache'
);

/**
 * Actualiser le cache pour une consultation spécifique
 */
export const refreshCacheForConsultation = createAction(
  '[Examens Échographiques] Refresh Cache For Consultation',
  props<{ consultationId: string }>()
);

export const refreshCacheForConsultationSuccess = createAction(
  '[Examens Échographiques] Refresh Cache For Consultation Success',
  props<{ examens: ExamenEchographiqueResponse[]; consultationId: string }>()
);

export const refreshCacheForConsultationFailure = createAction(
  '[Examens Échographiques] Refresh Cache For Consultation Failure',
  props<{ error: string }>()
);

/**
 * Réinitialiser l'erreur
 */
export const resetError = createAction(
  '[Examens Échographiques] Reset Error'
);

/**
 * Réinitialiser le chargement
 */
export const resetLoading = createAction(
  '[Examens Échographiques] Reset Loading'
);

// ===== ACTIONS D'EXPORT =====

/**
 * Exporter les examens échographiques
 */
export const exportExamens = createAction(
  '[Examens Échographiques] Export Examens',
  props<{ format: 'pdf' | 'excel'; consultationId?: string; dateDebut?: Date; dateFin?: Date }>()
);

export const exportExamensSuccess = createAction(
  '[Examens Échographiques] Export Examens Success',
  props<{ fileUrl: string }>()
);

export const exportExamensFailure = createAction(
  '[Examens Échographiques] Export Examens Failure',
  props<{ error: string }>()
);