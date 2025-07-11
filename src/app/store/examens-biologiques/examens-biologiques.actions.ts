import { createAction, props } from '@ngrx/store';
import { ExamenBiologiqueRequest } from '../../core/models/examen_biologique/examen-biologique-request.model';
import { ExamenBiologiqueResponse } from '../../core/models/examen_biologique/examen-biologique-response.model';
import { ActeBiologiqueRequest } from '../../core/models/examen_biologique/acte_biologique/acte-biologique-request.model';
import { ActeBiologiqueResponse } from '../../core/models/examen_biologique/acte_biologique/acte-biologique-response.model';
import { ApiResponse } from '../../core/models/api-response.model';

// ===== ACTIONS CRUD DE BASE =====

/**
 * Charger tous les examens biologiques
 */
export const loadExamensBiologiques = createAction(
  '[Examens Biologiques] Load Examens Biologiques',
  props<{ page?: number; size?: number; sortBy?: string; sortDir?: string }>()
);

export const loadExamensBiologiquesSuccess = createAction(
  '[Examens Biologiques] Load Examens Biologiques Success',
  props<{ response: ApiResponse<ExamenBiologiqueResponse[]> }>()
);

export const loadExamensBiologiquesFailure = createAction(
  '[Examens Biologiques] Load Examens Biologiques Failure',
  props<{ error: string }>()
);

/**
 * Charger un examen biologique par ID
 */
export const loadExamenBiologique = createAction(
  '[Examens Biologiques] Load Examen Biologique',
  props<{ id: string }>()
);

export const loadExamenBiologiqueSuccess = createAction(
  '[Examens Biologiques] Load Examen Biologique Success',
  props<{ examen: ExamenBiologiqueResponse }>()
);

export const loadExamenBiologiqueFailure = createAction(
  '[Examens Biologiques] Load Examen Biologique Failure',
  props<{ error: string }>()
);

/**
 * Créer un nouvel examen biologique
 */
export const createExamenBiologique = createAction(
  '[Examens Biologiques] Create Examen Biologique',
  props<{ examenRequest: ExamenBiologiqueRequest }>()
);

export const createExamenBiologiqueSuccess = createAction(
  '[Examens Biologiques] Create Examen Biologique Success',
  props<{ examen: ExamenBiologiqueResponse }>()
);

export const createExamenBiologiqueFailure = createAction(
  '[Examens Biologiques] Create Examen Biologique Failure',
  props<{ error: string }>()
);

/**
 * Mettre à jour un examen biologique
 */
export const updateExamenBiologique = createAction(
  '[Examens Biologiques] Update Examen Biologique',
  props<{ id: string; examenRequest: ExamenBiologiqueRequest }>()
);

export const updateExamenBiologiqueSuccess = createAction(
  '[Examens Biologiques] Update Examen Biologique Success',
  props<{ examen: ExamenBiologiqueResponse }>()
);

export const updateExamenBiologiqueFailure = createAction(
  '[Examens Biologiques] Update Examen Biologique Failure',
  props<{ error: string }>()
);

/**
 * Supprimer un examen biologique
 */
export const deleteExamenBiologique = createAction(
  '[Examens Biologiques] Delete Examen Biologique',
  props<{ id: string }>()
);

export const deleteExamenBiologiqueSuccess = createAction(
  '[Examens Biologiques] Delete Examen Biologique Success',
  props<{ id: string }>()
);

export const deleteExamenBiologiqueFailure = createAction(
  '[Examens Biologiques] Delete Examen Biologique Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE RECHERCHE SPÉCIALISÉES =====

/**
 * Charger les examens biologiques par consultation
 */
export const loadExamensByConsultation = createAction(
  '[Examens Biologiques] Load Examens By Consultation',
  props<{ consultationId: string; page?: number; size?: number }>()
);

export const loadExamensByConsultationSuccess = createAction(
  '[Examens Biologiques] Load Examens By Consultation Success',
  props<{ examens: ExamenBiologiqueResponse[]; consultationId: string }>()
);

export const loadExamensByConsultationFailure = createAction(
  '[Examens Biologiques] Load Examens By Consultation Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens biologiques récents
 */
export const loadExamensRecents = createAction(
  '[Examens Biologiques] Load Examens Recents',
  props<{ consultationId?: string; limit?: number }>()
);

export const loadExamensRecentsSuccess = createAction(
  '[Examens Biologiques] Load Examens Recents Success',
  props<{ examens: ExamenBiologiqueResponse[] }>()
);

export const loadExamensRecentsFailure = createAction(
  '[Examens Biologiques] Load Examens Recents Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens biologiques par type d'acte
 */
export const loadExamensByActeType = createAction(
  '[Examens Biologiques] Load Examens By Acte Type',
  props<{ nomActe: string; consultationId?: string }>()
);

export const loadExamensByActeTypeSuccess = createAction(
  '[Examens Biologiques] Load Examens By Acte Type Success',
  props<{ examens: ExamenBiologiqueResponse[]; nomActe: string }>()
);

export const loadExamensByActeTypeFailure = createAction(
  '[Examens Biologiques] Load Examens By Acte Type Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens biologiques avec anomalies
 */
export const loadExamensAvecAnomalies = createAction(
  '[Examens Biologiques] Load Examens Avec Anomalies',
  props<{ consultationId?: string }>()
);

export const loadExamensAvecAnomaliesSuccess = createAction(
  '[Examens Biologiques] Load Examens Avec Anomalies Success',
  props<{ examens: ExamenBiologiqueResponse[] }>()
);

export const loadExamensAvecAnomaliesFailure = createAction(
  '[Examens Biologiques] Load Examens Avec Anomalies Failure',
  props<{ error: string }>()
);

/**
 * Rechercher des examens biologiques
 */
export const searchExamens = createAction(
  '[Examens Biologiques] Search Examens',
  props<{ searchTerm: string; consultationId?: string; page?: number; size?: number }>()
);

export const searchExamensSuccess = createAction(
  '[Examens Biologiques] Search Examens Success',
  props<{ response: ApiResponse<ExamenBiologiqueResponse[]>; searchTerm: string }>()
);

export const searchExamensFailure = createAction(
  '[Examens Biologiques] Search Examens Failure',
  props<{ error: string }>()
);

// ===== ACTIONS SPÉCIALISÉES POUR LES ACTES BIOLOGIQUES =====

/**
 * Charger les actes biologiques standards
 */
export const loadActesBiologiquesStandards = createAction(
  '[Examens Biologiques] Load Actes Biologiques Standards'
);

export const loadActesBiologiquesStandardsSuccess = createAction(
  '[Examens Biologiques] Load Actes Biologiques Standards Success',
  props<{ actes: ActeBiologiqueRequest[] }>()
);

/**
 * Analyser les valeurs biologiques
 */
export const analyserValeursBiologiques = createAction(
  '[Examens Biologiques] Analyser Valeurs Biologiques',
  props<{ examen: ExamenBiologiqueResponse }>()
);

export const analyserValeursBiologiquesSuccess = createAction(
  '[Examens Biologiques] Analyser Valeurs Biologiques Success',
  props<{ 
    examenId: string;
    analyses: {
      acte: ActeBiologiqueResponse;
      statut: 'normal' | 'anormal' | 'critique';
      interpretation: string;
    }[]
  }>()
);

export const analyserValeursBiologiquesFailure = createAction(
  '[Examens Biologiques] Analyser Valeurs Biologiques Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE GESTION D'ÉTAT =====

/**
 * Sélectionner un examen biologique
 */
export const selectExamen = createAction(
  '[Examens Biologiques] Select Examen',
  props<{ id: string }>()
);

/**
 * Désélectionner l'examen biologique
 */
export const deselectExamen = createAction(
  '[Examens Biologiques] Deselect Examen'
);

/**
 * Définir les filtres
 */
export const setFilters = createAction(
  '[Examens Biologiques] Set Filters',
  props<{ 
    filters: {
      consultationId?: string;
      nomActe?: string;
      dateDebut?: Date;
      dateFin?: Date;
      statutAnalyse?: 'normal' | 'anormal' | 'critique';
      searchTerm?: string;
    }
  }>()
);

/**
 * Réinitialiser les filtres
 */
export const resetFilters = createAction(
  '[Examens Biologiques] Reset Filters'
);

/**
 * Définir la pagination
 */
export const setPagination = createAction(
  '[Examens Biologiques] Set Pagination',
  props<{ page: number; size: number }>()
);

/**
 * Définir le tri
 */
export const setSorting = createAction(
  '[Examens Biologiques] Set Sorting',
  props<{ sortBy: string; sortDir: 'asc' | 'desc' }>()
);

// ===== ACTIONS DE STATISTIQUES =====

/**
 * Charger les statistiques des examens biologiques
 */
export const loadStatistiques = createAction(
  '[Examens Biologiques] Load Statistiques',
  props<{ consultationId?: string; dateDebut?: Date; dateFin?: Date }>()
);

export const loadStatistiquesSuccess = createAction(
  '[Examens Biologiques] Load Statistiques Success',
  props<{ 
    statistiques: {
      total: number;
      nombreActes: number;
      nombreAnomalies: number;
      repartitionActes: { [key: string]: number };
      tendancesValeurs: { [key: string]: number[] };
    }
  }>()
);

export const loadStatistiquesFailure = createAction(
  '[Examens Biologiques] Load Statistiques Failure',
  props<{ error: string }>()
);

// ===== ACTIONS UTILITAIRES =====

/**
 * Vider le cache
 */
export const clearCache = createAction(
  '[Examens Biologiques] Clear Cache'
);

/**
 * Actualiser le cache pour une consultation
 */
export const refreshCacheForConsultation = createAction(
  '[Examens Biologiques] Refresh Cache For Consultation',
  props<{ consultationId: string }>()
);

export const refreshCacheForConsultationSuccess = createAction(
  '[Examens Biologiques] Refresh Cache For Consultation Success',
  props<{ examens: ExamenBiologiqueResponse[]; consultationId: string }>()
);

export const refreshCacheForConsultationFailure = createAction(
  '[Examens Biologiques] Refresh Cache For Consultation Failure',
  props<{ error: string }>()
);

/**
 * Réinitialiser l'état d'erreur
 */
export const resetError = createAction(
  '[Examens Biologiques] Reset Error'
);

/**
 * Réinitialiser l'état de chargement
 */
export const resetLoading = createAction(
  '[Examens Biologiques] Reset Loading'
);

/**
 * Exporter les examens biologiques
 */
export const exportExamens = createAction(
  '[Examens Biologiques] Export Examens',
  props<{ format: 'pdf' | 'excel' | 'csv'; filters?: any }>()
);

export const exportExamensSuccess = createAction(
  '[Examens Biologiques] Export Examens Success',
  props<{ fileUrl: string; format: string }>()
);

export const exportExamensFailure = createAction(
  '[Examens Biologiques] Export Examens Failure',
  props<{ error: string }>()
); 