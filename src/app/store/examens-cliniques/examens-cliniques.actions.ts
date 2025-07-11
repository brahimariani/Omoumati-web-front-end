import { createAction, props } from '@ngrx/store';
import { ExamenCliniqueRequest } from '../../core/models/examen_clinique/examen-clinique-request.model';
import { ExamenCliniqueResponse } from '../../core/models/examen_clinique/examen-clinique-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des examens cliniques
 */

// ===== ACTIONS CRUD DE BASE =====

/**
 * Charger tous les examens cliniques
 */
export const loadExamens = createAction(
  '[Examens Cliniques] Load Examens',
  props<{ page: number; size: number; sortBy?: string; sortDir?: string }>()
);

export const loadExamensSuccess = createAction(
  '[Examens Cliniques] Load Examens Success',
  props<{ data: PageResponse<ExamenCliniqueResponse> }>()
);

export const loadExamensFailure = createAction(
  '[Examens Cliniques] Load Examens Failure',
  props<{ error: string }>()
);

/**
 * Charger un examen clinique spécifique
 */
export const loadExamen = createAction(
  '[Examens Cliniques] Load Examen',
  props<{ id: string }>()
);

export const loadExamenSuccess = createAction(
  '[Examens Cliniques] Load Examen Success',
  props<{ data: ExamenCliniqueResponse }>()
);

export const loadExamenFailure = createAction(
  '[Examens Cliniques] Load Examen Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens par consultation
 */
export const loadExamensByConsultation = createAction(
  '[Examens Cliniques] Load Examens By Consultation',
  props<{ consultationId: string; page?: number; size?: number }>()
);

export const loadExamensByConsultationSuccess = createAction(
  '[Examens Cliniques] Load Examens By Consultation Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const loadExamensByConsultationFailure = createAction(
  '[Examens Cliniques] Load Examens By Consultation Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens récents
 */
export const loadExamensRecents = createAction(
  '[Examens Cliniques] Load Examens Recents',
  props<{ consultationId?: string; limit?: number }>()
);

export const loadExamensRecentsSuccess = createAction(
  '[Examens Cliniques] Load Examens Recents Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const loadExamensRecentsFailure = createAction(
  '[Examens Cliniques] Load Examens Recents Failure',
  props<{ error: string }>()
);

/**
 * Créer un examen clinique
 */
export const createExamen = createAction(
  '[Examens Cliniques] Create Examen',
  props<{ request: ExamenCliniqueRequest }>()
);

export const createExamenSuccess = createAction(
  '[Examens Cliniques] Create Examen Success',
  props<{ data: ExamenCliniqueResponse }>()
);

export const createExamenFailure = createAction(
  '[Examens Cliniques] Create Examen Failure',
  props<{ error: string }>()
);

/**
 * Mettre à jour un examen clinique
 */
export const updateExamen = createAction(
  '[Examens Cliniques] Update Examen',
  props<{ id: string; request: ExamenCliniqueRequest }>()
);

export const updateExamenSuccess = createAction(
  '[Examens Cliniques] Update Examen Success',
  props<{ data: ExamenCliniqueResponse }>()
);

export const updateExamenFailure = createAction(
  '[Examens Cliniques] Update Examen Failure',
  props<{ error: string }>()
);

/**
 * Supprimer un examen clinique
 */
export const deleteExamen = createAction(
  '[Examens Cliniques] Delete Examen',
  props<{ id: string }>()
);

export const deleteExamenSuccess = createAction(
  '[Examens Cliniques] Delete Examen Success',
  props<{ id: string }>()
);

export const deleteExamenFailure = createAction(
  '[Examens Cliniques] Delete Examen Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE RECHERCHE SPÉCIALISÉES =====

/**
 * Charger les examens par signes vitaux
 */
export const loadExamensBySignesVitaux = createAction(
  '[Examens Cliniques] Load Examens By Signes Vitaux',
  props<{ 
    tensionMin?: number; 
    tensionMax?: number; 
    temperatureMin?: number; 
    temperatureMax?: number; 
    consultationId?: string 
  }>()
);

export const loadExamensBySignesVitauxSuccess = createAction(
  '[Examens Cliniques] Load Examens By Signes Vitaux Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const loadExamensBySignesVitauxFailure = createAction(
  '[Examens Cliniques] Load Examens By Signes Vitaux Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens par plage de poids
 */
export const loadExamensByPoids = createAction(
  '[Examens Cliniques] Load Examens By Poids',
  props<{ poidsMin: number; poidsMax: number; consultationId?: string }>()
);

export const loadExamensByPoidsSuccess = createAction(
  '[Examens Cliniques] Load Examens By Poids Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const loadExamensByPoidsFailure = createAction(
  '[Examens Cliniques] Load Examens By Poids Failure',
  props<{ error: string }>()
);

/**
 * Charger les examens avec anomalies
 */
export const loadExamensAvecAnomalies = createAction(
  '[Examens Cliniques] Load Examens Avec Anomalies',
  props<{ consultationId?: string }>()
);

export const loadExamensAvecAnomaliesSuccess = createAction(
  '[Examens Cliniques] Load Examens Avec Anomalies Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const loadExamensAvecAnomaliesFailure = createAction(
  '[Examens Cliniques] Load Examens Avec Anomalies Failure',
  props<{ error: string }>()
);

/**
 * Rechercher des examens par observation
 */
export const searchExamensByObservation = createAction(
  '[Examens Cliniques] Search Examens By Observation',
  props<{ searchTerm: string; consultationId?: string; page?: number; size?: number }>()
);

export const searchExamensByObservationSuccess = createAction(
  '[Examens Cliniques] Search Examens By Observation Success',
  props<{ data: PageResponse<ExamenCliniqueResponse> }>()
);

export const searchExamensByObservationFailure = createAction(
  '[Examens Cliniques] Search Examens By Observation Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE FILTRAGE =====

/**
 * Filtrer par plage de dates
 */
export const filterByDateRange = createAction(
  '[Examens Cliniques] Filter By Date Range',
  props<{ startDate: Date; endDate: Date }>()
);

export const filterByDateRangeSuccess = createAction(
  '[Examens Cliniques] Filter By Date Range Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const filterByDateRangeFailure = createAction(
  '[Examens Cliniques] Filter By Date Range Failure',
  props<{ error: string }>()
);

/**
 * Filtrer par plage d'IMC
 */
export const filterByIMCRange = createAction(
  '[Examens Cliniques] Filter By IMC Range',
  props<{ imcMin: number; imcMax: number }>()
);

export const filterByIMCRangeSuccess = createAction(
  '[Examens Cliniques] Filter By IMC Range Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const filterByIMCRangeFailure = createAction(
  '[Examens Cliniques] Filter By IMC Range Failure',
  props<{ error: string }>()
);

/**
 * Filtrer par anomalies
 */
export const filterByAnomalies = createAction(
  '[Examens Cliniques] Filter By Anomalies',
  props<{ hasAnomalies: boolean }>()
);

export const filterByAnomaliesSuccess = createAction(
  '[Examens Cliniques] Filter By Anomalies Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const filterByAnomaliesFailure = createAction(
  '[Examens Cliniques] Filter By Anomalies Failure',
  props<{ error: string }>()
);

// ===== ACTIONS D'EXPORT =====

/**
 * Exporter les examens en PDF
 */
export const exportExamensPdf = createAction(
  '[Examens Cliniques] Export Examens Pdf',
  props<{ consultationId?: string; dateDebut?: Date; dateFin?: Date }>()
);

export const exportExamensPdfSuccess = createAction(
  '[Examens Cliniques] Export Examens Pdf Success',
  props<{ blob: Blob }>()
);

export const exportExamensPdfFailure = createAction(
  '[Examens Cliniques] Export Examens Pdf Failure',
  props<{ error: string }>()
);

/**
 * Exporter les examens en Excel
 */
export const exportExamensExcel = createAction(
  '[Examens Cliniques] Export Examens Excel',
  props<{ consultationId?: string; dateDebut?: Date; dateFin?: Date }>()
);

export const exportExamensExcelSuccess = createAction(
  '[Examens Cliniques] Export Examens Excel Success',
  props<{ blob: Blob }>()
);

export const exportExamensExcelFailure = createAction(
  '[Examens Cliniques] Export Examens Excel Failure',
  props<{ error: string }>()
);

// ===== ACTIONS SPÉCIALISÉES MÉDICALES =====

/**
 * Évaluer les signes vitaux
 */
export const evaluateSignesVitaux = createAction(
  '[Examens Cliniques] Evaluate Signes Vitaux',
  props<{ examen: ExamenCliniqueResponse }>()
);

export const evaluateSignesVitauxSuccess = createAction(
  '[Examens Cliniques] Evaluate Signes Vitaux Success',
  props<{ data: {
    tensionArterielle: 'normale' | 'elevee' | 'basse';
    temperature: 'normale' | 'fievre' | 'hypothermie';
    frequenceCardiaque: 'normale' | 'rapide' | 'lente';
    imc: number;
    categorieIMC: 'maigreur' | 'normal' | 'surpoids' | 'obesite';
  } }>()
);

export const evaluateSignesVitauxFailure = createAction(
  '[Examens Cliniques] Evaluate Signes Vitaux Failure',
  props<{ error: string }>()
);

/**
 * Calculer l'IMC
 */
export const calculateIMC = createAction(
  '[Examens Cliniques] Calculate IMC',
  props<{ poids: number; taille: number }>()
);

export const calculateIMCSuccess = createAction(
  '[Examens Cliniques] Calculate IMC Success',
  props<{ imc: number; categorie: 'maigreur' | 'normal' | 'surpoids' | 'obesite' }>()
);

export const calculateIMCFailure = createAction(
  '[Examens Cliniques] Calculate IMC Failure',
  props<{ error: string }>()
);

// ===== ACTIONS DE GESTION D'ÉTAT =====

/**
 * Vider le cache
 */
export const clearCache = createAction(
  '[Examens Cliniques] Clear Cache'
);

/**
 * Rafraîchir les examens pour une consultation
 */
export const refreshExamensForConsultation = createAction(
  '[Examens Cliniques] Refresh Examens For Consultation',
  props<{ consultationId: string }>()
);

export const refreshExamensForConsultationSuccess = createAction(
  '[Examens Cliniques] Refresh Examens For Consultation Success',
  props<{ data: ExamenCliniqueResponse[] }>()
);

export const refreshExamensForConsultationFailure = createAction(
  '[Examens Cliniques] Refresh Examens For Consultation Failure',
  props<{ error: string }>()
);

/**
 * Réinitialiser l'état des examens
 */
export const resetExamensState = createAction(
  '[Examens Cliniques] Reset Examens State'
);

/**
 * Sélectionner un examen
 */
export const selectExamen = createAction(
  '[Examens Cliniques] Select Examen',
  props<{ id: string | null }>()
);

// ===== ACTIONS D'ANALYSE AVANCÉE =====

/**
 * Analyser les tendances
 */
export const analyzeTendances = createAction(
  '[Examens Cliniques] Analyze Tendances',
  props<{ consultationId?: string; dateDebut?: Date; dateFin?: Date }>()
);

export const analyzeTendancesSuccess = createAction(
  '[Examens Cliniques] Analyze Tendances Success',
  props<{ data: {
    evolutionPoids: { date: Date; valeur: number }[];
    evolutionTension: { date: Date; systolique: number; diastolique: number }[];
    evolutionTemperature: { date: Date; valeur: number }[];
    evolutionFrequenceCardiaque: { date: Date; valeur: number }[];
    alertes: {
      type: 'poids' | 'tension' | 'temperature' | 'frequence';
      message: string;
      severite: 'info' | 'warning' | 'error';
    }[];
  } }>()
);

export const analyzeTendancesFailure = createAction(
  '[Examens Cliniques] Analyze Tendances Failure',
  props<{ error: string }>()
);

/**
 * Comparer avec les normes
 */
export const compareWithNorms = createAction(
  '[Examens Cliniques] Compare With Norms',
  props<{ examens: ExamenCliniqueResponse[]; ageGestationnel?: number }>()
);

export const compareWithNormsSuccess = createAction(
  '[Examens Cliniques] Compare With Norms Success',
  props<{ data: {
    poidsNormal: boolean;
    tensionNormale: boolean;
    temperatureNormale: boolean;
    frequenceNormale: boolean;
    recommandations: string[];
  } }>()
);

export const compareWithNormsFailure = createAction(
  '[Examens Cliniques] Compare With Norms Failure',
  props<{ error: string }>()
);

/**
 * Générer un rapport médical
 */
export const generateMedicalReport = createAction(
  '[Examens Cliniques] Generate Medical Report',
  props<{ examensIds: string[]; consultationId?: string }>()
);

export const generateMedicalReportSuccess = createAction(
  '[Examens Cliniques] Generate Medical Report Success',
  props<{ data: {
    resume: string;
    recommandations: string[];
    alertes: string[];
    graphiques: any[];
  } }>()
);

export const generateMedicalReportFailure = createAction(
  '[Examens Cliniques] Generate Medical Report Failure',
  props<{ error: string }>()
);
