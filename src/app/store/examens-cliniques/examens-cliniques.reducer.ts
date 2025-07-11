import { createReducer, on } from '@ngrx/store';
import * as ExamensCliniquesActions from './examens-cliniques.actions';
import { ExamenCliniqueResponse } from '../../core/models/examen_clinique/examen-clinique-response.model';

/**
 * Interface pour l'état des examens cliniques
 */
export interface ExamensCliniquesState {
  examens: ExamenCliniqueResponse[];
  selectedExamen: ExamenCliniqueResponse | null;
  selectedExamenId: string | null;
  examensByConsultation: ExamenCliniqueResponse[];
  examensRecents: ExamenCliniqueResponse[];
  examensAvecAnomalies: ExamenCliniqueResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  searchTerm: string | null;
  filters: {
    consultationId?: string;
    dateDebut?: Date;
    dateFin?: Date;
    poidsMin?: number;
    poidsMax?: number;
    tensionMin?: number;
    tensionMax?: number;
    temperatureMin?: number;
    temperatureMax?: number;
    imcMin?: number;
    imcMax?: number;
    hasAnomalies?: boolean;
    observation?: string;
  };
  signesVitauxEvaluation: {
    tensionArterielle: 'normale' | 'elevee' | 'basse';
    temperature: 'normale' | 'fievre' | 'hypothermie';
    frequenceCardiaque: 'normale' | 'rapide' | 'lente';
    imc: number;
    categorieIMC: 'maigreur' | 'normal' | 'surpoids' | 'obesite';
  } | null;
  tendancesAnalysis: {
    evolutionPoids: { date: Date; valeur: number }[];
    evolutionTension: { date: Date; systolique: number; diastolique: number }[];
    evolutionTemperature: { date: Date; valeur: number }[];
    evolutionFrequenceCardiaque: { date: Date; valeur: number }[];
    alertes: {
      type: 'poids' | 'tension' | 'temperature' | 'frequence';
      message: string;
      severite: 'info' | 'warning' | 'error';
    }[];
  } | null;
  normsComparison: {
    poidsNormal: boolean;
    tensionNormale: boolean;
    temperatureNormale: boolean;
    frequenceNormale: boolean;
    recommandations: string[];
  } | null;
  medicalReport: {
    resume: string;
    recommandations: string[];
    alertes: string[];
    graphiques: any[];
  } | null;
  imcCalculation: {
    imc: number;
    categorie: 'maigreur' | 'normal' | 'surpoids' | 'obesite';
  } | null;
  exportData: {
    pdfBlob?: Blob;
    excelBlob?: Blob;
  };
}

/**
 * État initial pour le reducer des examens cliniques
 */
export const initialState: ExamensCliniquesState = {
  examens: [],
  selectedExamen: null,
  selectedExamenId: null,
  examensByConsultation: [],
  examensRecents: [],
  examensAvecAnomalies: [],
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  },
  searchTerm: null,
  filters: {},
  signesVitauxEvaluation: null,
  tendancesAnalysis: null,
  normsComparison: null,
  medicalReport: null,
  imcCalculation: null,
  exportData: {}
};

/**
 * Reducer pour gérer les actions concernant les examens cliniques
 */
export const examensCliniquesReducer = createReducer(
  initialState,
  
  // Chargement de tous les examens
  on(ExamensCliniquesActions.loadExamens, (state, { page, size }) => ({
    ...state,
    loading: true,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: page,
      pageSize: size
    }
  })),
  
  on(ExamensCliniquesActions.loadExamensSuccess, (state, { data }) => {
    const examensList = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    const totalElements = data.totalElements !== undefined ? data.totalElements : 
                          (Array.isArray(data) ? data.length : 0);
    const totalPages = data.totalPages !== undefined ? data.totalPages : 1;
    const currentPage = data.number !== undefined ? data.number : 0;
    const pageSize = data.size !== undefined ? data.size : 10;
    
    return {
      ...state,
      examens: examensList,
      loading: false,
      pagination: {
        totalElements,
        totalPages,
        currentPage,
        pageSize
      },
      error: null
    };
  }),
  
  on(ExamensCliniquesActions.loadExamensFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement d'un examen spécifique
  on(ExamensCliniquesActions.loadExamen, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamenSuccess, (state, { data }) => ({
    ...state,
    selectedExamen: data,
    selectedExamenId: data.id,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des examens par consultation
  on(ExamensCliniquesActions.loadExamensByConsultation, (state, { consultationId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      consultationId
    }
  })),
  
  on(ExamensCliniquesActions.loadExamensByConsultationSuccess, (state, { data }) => ({
    ...state,
    examensByConsultation: data,
    examens: data,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensByConsultationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des examens récents
  on(ExamensCliniquesActions.loadExamensRecents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensRecentsSuccess, (state, { data }) => ({
    ...state,
    examensRecents: data,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensRecentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'un examen
  on(ExamensCliniquesActions.createExamen, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.createExamenSuccess, (state, { data }) => ({
    ...state,
    examens: [data, ...state.examens],
    examensByConsultation: [data, ...state.examensByConsultation],
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.createExamenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'un examen
  on(ExamensCliniquesActions.updateExamen, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.updateExamenSuccess, (state, { data }) => {
    const updateExamenInList = (list: ExamenCliniqueResponse[]) =>
      list.map(examen => examen.id === data.id ? data : examen);
    
    return {
      ...state,
      examens: updateExamenInList(state.examens),
      examensByConsultation: updateExamenInList(state.examensByConsultation),
      examensRecents: updateExamenInList(state.examensRecents),
      selectedExamen: state.selectedExamen?.id === data.id ? data : state.selectedExamen,
      loading: false,
      error: null
    };
  }),
  
  on(ExamensCliniquesActions.updateExamenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'un examen
  on(ExamensCliniquesActions.deleteExamen, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.deleteExamenSuccess, (state, { id }) => {
    const filterExamenFromList = (list: ExamenCliniqueResponse[]) =>
      list.filter(examen => examen.id !== id);
    
    return {
      ...state,
      examens: filterExamenFromList(state.examens),
      examensByConsultation: filterExamenFromList(state.examensByConsultation),
      examensRecents: filterExamenFromList(state.examensRecents),
      selectedExamen: state.selectedExamen?.id === id ? null : state.selectedExamen,
      selectedExamenId: state.selectedExamenId === id ? null : state.selectedExamenId,
      loading: false,
      error: null
    };
  }),
  
  on(ExamensCliniquesActions.deleteExamenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Examens par signes vitaux
  on(ExamensCliniquesActions.loadExamensBySignesVitaux, (state, { tensionMin, tensionMax, temperatureMin, temperatureMax }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      tensionMin,
      tensionMax,
      temperatureMin,
      temperatureMax
    }
  })),
  
  on(ExamensCliniquesActions.loadExamensBySignesVitauxSuccess, (state, { data }) => ({
    ...state,
    examens: data,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensBySignesVitauxFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Examens par poids
  on(ExamensCliniquesActions.loadExamensByPoids, (state, { poidsMin, poidsMax }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      poidsMin,
      poidsMax
    }
  })),
  
  on(ExamensCliniquesActions.loadExamensByPoidsSuccess, (state, { data }) => ({
    ...state,
    examens: data,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensByPoidsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Examens avec anomalies
  on(ExamensCliniquesActions.loadExamensAvecAnomalies, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensAvecAnomaliesSuccess, (state, { data }) => ({
    ...state,
    examensAvecAnomalies: data,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.loadExamensAvecAnomaliesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Recherche par observation
  on(ExamensCliniquesActions.searchExamensByObservation, (state, { searchTerm }) => ({
    ...state,
    loading: true,
    error: null,
    searchTerm,
    filters: {
      ...state.filters,
      observation: searchTerm
    }
  })),
  
  on(ExamensCliniquesActions.searchExamensByObservationSuccess, (state, { data }) => ({
    ...state,
    examens: Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [],
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.searchExamensByObservationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Évaluation des signes vitaux
  on(ExamensCliniquesActions.evaluateSignesVitaux, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.evaluateSignesVitauxSuccess, (state, { data }) => ({
    ...state,
    signesVitauxEvaluation: data,
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.evaluateSignesVitauxFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Calcul IMC
  on(ExamensCliniquesActions.calculateIMC, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.calculateIMCSuccess, (state, { imc, categorie }) => ({
    ...state,
    imcCalculation: { imc, categorie },
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.calculateIMCFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Sélection d'un examen
  on(ExamensCliniquesActions.selectExamen, (state, { id }) => ({
    ...state,
    selectedExamenId: id,
    selectedExamen: id ? state.examens.find(examen => examen.id === id) || null : null
  })),
  
  // Réinitialisation de l'état
  on(ExamensCliniquesActions.resetExamensState, () => initialState),
  
  // Gestion du cache
  on(ExamensCliniquesActions.clearCache, (state) => ({
    ...state,
    examens: [],
    examensByConsultation: [],
    examensRecents: [],
    examensAvecAnomalies: []
  })),
  
  // Export PDF
  on(ExamensCliniquesActions.exportExamensPdf, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.exportExamensPdfSuccess, (state, { blob }) => ({
    ...state,
    exportData: {
      ...state.exportData,
      pdfBlob: blob
    },
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.exportExamensPdfFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Export Excel
  on(ExamensCliniquesActions.exportExamensExcel, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ExamensCliniquesActions.exportExamensExcelSuccess, (state, { blob }) => ({
    ...state,
    exportData: {
      ...state.exportData,
      excelBlob: blob
    },
    loading: false,
    error: null
  })),
  
  on(ExamensCliniquesActions.exportExamensExcelFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 