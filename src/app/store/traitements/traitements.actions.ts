import { createAction, props } from '@ngrx/store';
import { TraitementRequest } from '../../core/models/traitement/traitement-request.model';
import { TraitementResponse } from '../../core/models/traitement/traitement-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des traitements
 */

// ===== ACTIONS CRUD DE BASE =====

/**
 * Charger tous les traitements
 */
export const loadTraitements = createAction(
  '[Traitements] Load Traitements',
  props<{ page: number; size: number; sortBy?: string; sortDir?: string }>()
);

export const loadTraitementsSuccess = createAction(
  '[Traitements] Load Traitements Success',
  props<{ data: PageResponse<TraitementResponse> }>()
);

export const loadTraitementsFailure = createAction(
  '[Traitements] Load Traitements Failure',
  props<{ error: string }>()
);

/**
 * Charger un traitement spécifique
 */
export const loadTraitement = createAction(
  '[Traitements] Load Traitement',
  props<{ id: string }>()
);

export const loadTraitementSuccess = createAction(
  '[Traitements] Load Traitement Success',
  props<{ data: TraitementResponse }>()
);

export const loadTraitementFailure = createAction(
  '[Traitements] Load Traitement Failure',
  props<{ error: string }>()
);

/**
 * Charger les traitements par consultation
 */
export const loadTraitementsByConsultation = createAction(
  '[Traitements] Load Traitements By Consultation',
  props<{ consultationId: string; page?: number; size?: number }>()
);

export const loadTraitementsByConsultationSuccess = createAction(
  '[Traitements] Load Traitements By Consultation Success',
  props<{ data: TraitementResponse[] }>()
);

export const loadTraitementsByConsultationFailure = createAction(
  '[Traitements] Load Traitements By Consultation Failure',
  props<{ error: string }>()
);

/**
 * Charger les traitements actifs
 */
export const loadTraitementsActifs = createAction(
  '[Traitements] Load Traitements Actifs',
  props<{ consultationId?: string }>()
);

export const loadTraitementsActifsSuccess = createAction(
  '[Traitements] Load Traitements Actifs Success',
  props<{ data: TraitementResponse[] }>()
);

export const loadTraitementsActifsFailure = createAction(
  '[Traitements] Load Traitements Actifs Failure',
  props<{ error: string }>()
);

/**
 * Créer un traitement
 */
export const createTraitement = createAction(
  '[Traitements] Create Traitement',
  props<{ request: TraitementRequest }>()
);

export const createTraitementSuccess = createAction(
  '[Traitements] Create Traitement Success',
  props<{ data: TraitementResponse }>()
);

export const createTraitementFailure = createAction(
  '[Traitements] Create Traitement Failure',
  props<{ error: string }>()
);

/**
 * Mettre à jour un traitement
 */
export const updateTraitement = createAction(
  '[Traitements] Update Traitement',
  props<{ id: string; request: TraitementRequest }>()
);

export const updateTraitementSuccess = createAction(
  '[Traitements] Update Traitement Success',
  props<{ data: TraitementResponse }>()
);

export const updateTraitementFailure = createAction(
  '[Traitements] Update Traitement Failure',
  props<{ error: string }>()
);

/**
 * Supprimer un traitement
 */
export const deleteTraitement = createAction(
  '[Traitements] Delete Traitement',
  props<{ id: string }>()
);

export const deleteTraitementSuccess = createAction(
  '[Traitements] Delete Traitement Success',
  props<{ id: string }>()
);

export const deleteTraitementFailure = createAction(
  '[Traitements] Delete Traitement Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE RECHERCHE SPÉCIALISÉES =====

/**
 * Charger les statistiques des traitements
 */
export const loadTraitementStats = createAction(
  '[Traitements] Load Traitement Stats',
  props<{ consultationId?: string; patienteId?: string }>()
);

export const loadTraitementStatsSuccess = createAction(
  '[Traitements] Load Traitement Stats Success',
  props<{ data: {
    totalTraitements: number;
    traitementsActifs: number;
    traitementsTermines: number;
    medicamentsUniques: number;
    traitementParMedicament: { medicament: string; nombre: number; }[];
  } }>()
);

export const loadTraitementStatsFailure = createAction(
  '[Traitements] Load Traitement Stats Failure',
  props<{ error: string }>()
);

/**
 * Charger les traitements par médicament
 */
export const loadTraitementsByMedicament = createAction(
  '[Traitements] Load Traitements By Medicament',
  props<{ medicament: string; page?: number; size?: number }>()
);

export const loadTraitementsByMedicamentSuccess = createAction(
  '[Traitements] Load Traitements By Medicament Success',
  props<{ data: PageResponse<TraitementResponse> }>()
);

export const loadTraitementsByMedicamentFailure = createAction(
  '[Traitements] Load Traitements By Medicament Failure',
  props<{ error: string }>()
);

/**
 * Charger les traitements par période
 */
export const loadTraitementsByPeriode = createAction(
  '[Traitements] Load Traitements By Periode',
  props<{ dateDebut: Date; dateFin: Date; consultationId?: string }>()
);

export const loadTraitementsByPeriodeSuccess = createAction(
  '[Traitements] Load Traitements By Periode Success',
  props<{ data: TraitementResponse[] }>()
);

export const loadTraitementsByPeriodeFailure = createAction(
  '[Traitements] Load Traitements By Periode Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE FILTRAGE =====

/**
 * Filtrer par plage de dates
 */
export const filterByDateRange = createAction(
  '[Traitements] Filter By Date Range',
  props<{ startDate: Date; endDate: Date }>()
);

export const filterByDateRangeSuccess = createAction(
  '[Traitements] Filter By Date Range Success',
  props<{ data: TraitementResponse[] }>()
);

export const filterByDateRangeFailure = createAction(
  '[Traitements] Filter By Date Range Failure',
  props<{ error: string }>()
);

/**
 * Filtrer par médicament
 */
export const filterByMedicament = createAction(
  '[Traitements] Filter By Medicament',
  props<{ medicament: string }>()
);

export const filterByMedicamentSuccess = createAction(
  '[Traitements] Filter By Medicament Success',
  props<{ data: TraitementResponse[] }>()
);

export const filterByMedicamentFailure = createAction(
  '[Traitements] Filter By Medicament Failure',
  props<{ error: string }>()
);

/**
 * Filtrer par statut
 */
export const filterByStatus = createAction(
  '[Traitements] Filter By Status',
  props<{ status: 'actif' | 'termine' | 'tous' }>()
);

export const filterByStatusSuccess = createAction(
  '[Traitements] Filter By Status Success',
  props<{ data: TraitementResponse[] }>()
);

export const filterByStatusFailure = createAction(
  '[Traitements] Filter By Status Failure',
  props<{ error: string }>()
);

// ===== ACTIONS D'EXPORT =====

/**
 * Exporter les traitements en PDF
 */
export const exportTraitementsPdf = createAction(
  '[Traitements] Export Traitements Pdf',
  props<{ consultationId?: string; patienteId?: string }>()
);

export const exportTraitementsPdfSuccess = createAction(
  '[Traitements] Export Traitements Pdf Success',
  props<{ blob: Blob }>()
);

export const exportTraitementsPdfFailure = createAction(
  '[Traitements] Export Traitements Pdf Failure',
  props<{ error: string }>()
);

/**
 * Exporter les traitements en Excel
 */
export const exportTraitementsExcel = createAction(
  '[Traitements] Export Traitements Excel',
  props<{ consultationId?: string; patienteId?: string }>()
);

export const exportTraitementsExcelSuccess = createAction(
  '[Traitements] Export Traitements Excel Success',
  props<{ blob: Blob }>()
);

export const exportTraitementsExcelFailure = createAction(
  '[Traitements] Export Traitements Excel Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE GESTION D'ÉTAT =====

/**
 * Vider le cache
 */
export const clearCache = createAction(
  '[Traitements] Clear Cache'
);

/**
 * Rafraîchir les traitements pour une consultation
 */
export const refreshTraitementsForConsultation = createAction(
  '[Traitements] Refresh Traitements For Consultation',
  props<{ consultationId: string }>()
);

export const refreshTraitementsForConsultationSuccess = createAction(
  '[Traitements] Refresh Traitements For Consultation Success',
  props<{ data: TraitementResponse[] }>()
);

export const refreshTraitementsForConsultationFailure = createAction(
  '[Traitements] Refresh Traitements For Consultation Failure',
  props<{ error: string }>()
);

/**
 * Réinitialiser l'état des traitements
 */
export const resetTraitementsState = createAction(
  '[Traitements] Reset Traitements State'
);

/**
 * Sélectionner un traitement
 */
export const selectTraitement = createAction(
  '[Traitements] Select Traitement',
  props<{ id: string | null }>()
);

// ===== ACTIONS SPÉCIALISÉES MÉDICALES =====

/**
 * Vérifier les interactions médicamenteuses
 */
export const checkInteractions = createAction(
  '[Traitements] Check Interactions',
  props<{ medicaments: string[] }>()
);

export const checkInteractionsSuccess = createAction(
  '[Traitements] Check Interactions Success',
  props<{ data: {
    hasInteractions: boolean;
    interactions: {
      medicament1: string;
      medicament2: string;
      severite: 'faible' | 'modere' | 'severe';
      description: string;
    }[];
  } }>()
);

export const checkInteractionsFailure = createAction(
  '[Traitements] Check Interactions Failure',
  props<{ error: string }>()
);

/**
 * Obtenir des suggestions de traitements
 */
export const getTreatmentSuggestions = createAction(
  '[Traitements] Get Treatment Suggestions',
  props<{ indication: string; patienteId?: string }>()
);

export const getTreatmentSuggestionsSuccess = createAction(
  '[Traitements] Get Treatment Suggestions Success',
  props<{ data: {
    medicament: string;
    posologie: string;
    duree: string;
    indication: string;
  }[] }>()
);

export const getTreatmentSuggestionsFailure = createAction(
  '[Traitements] Get Treatment Suggestions Failure',
  props<{ error: string }>()
);

/**
 * Valider la posologie
 */
export const validatePosologie = createAction(
  '[Traitements] Validate Posologie',
  props<{ medicament: string; posologie: string; patienteId?: string }>()
);

export const validatePosologieSuccess = createAction(
  '[Traitements] Validate Posologie Success',
  props<{ data: {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } }>()
);

export const validatePosologieFailure = createAction(
  '[Traitements] Validate Posologie Failure',
  props<{ error: string }>()
);


