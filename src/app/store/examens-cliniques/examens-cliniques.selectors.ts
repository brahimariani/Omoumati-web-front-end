import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamensCliniquesState } from './examens-cliniques.reducer';

/**
 * Feature selector pour l'état des examens cliniques
 */
export const selectExamensCliniquesState = createFeatureSelector<ExamensCliniquesState>('examens-cliniques');

/**
 * Selectors de base pour l'état des examens cliniques
 */
export const selectAllExamens = createSelector(
  selectExamensCliniquesState,
  (state) => state.examens
);

export const selectSelectedExamen = createSelector(
  selectExamensCliniquesState,
  (state) => state.selectedExamen
);

export const selectSelectedExamenId = createSelector(
  selectExamensCliniquesState,
  (state) => state.selectedExamenId
);

export const selectExamensByConsultation = createSelector(
  selectExamensCliniquesState,
  (state) => state.examensByConsultation
);

export const selectExamensRecents = createSelector(
  selectExamensCliniquesState,
  (state) => state.examensRecents
);

export const selectExamensAvecAnomalies = createSelector(
  selectExamensCliniquesState,
  (state) => state.examensAvecAnomalies
);

export const selectExamensLoading = createSelector(
  selectExamensCliniquesState,
  (state) => state.loading
);

export const selectExamensError = createSelector(
  selectExamensCliniquesState,
  (state) => state.error
);

/**
 * Selectors pour la pagination
 */
export const selectExamensPagination = createSelector(
  selectExamensCliniquesState,
  (state) => state.pagination
);

export const selectExamensTotalElements = createSelector(
  selectExamensPagination,
  (pagination) => pagination.totalElements
);

export const selectExamensTotalPages = createSelector(
  selectExamensPagination,
  (pagination) => pagination.totalPages
);

export const selectExamensCurrentPage = createSelector(
  selectExamensPagination,
  (pagination) => pagination.currentPage
);

export const selectExamensPageSize = createSelector(
  selectExamensPagination,
  (pagination) => pagination.pageSize
);

/**
 * Selectors pour les filtres et recherche
 */
export const selectExamensFilters = createSelector(
  selectExamensCliniquesState,
  (state) => state.filters
);

export const selectExamensSearchTerm = createSelector(
  selectExamensCliniquesState,
  (state) => state.searchTerm
);

export const selectCurrentConsultationFilter = createSelector(
  selectExamensFilters,
  (filters) => filters.consultationId
);

export const selectCurrentDateRangeFilter = createSelector(
  selectExamensFilters,
  (filters) => ({
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin
  })
);

export const selectCurrentPoidsFilter = createSelector(
  selectExamensFilters,
  (filters) => ({
    poidsMin: filters.poidsMin,
    poidsMax: filters.poidsMax
  })
);

export const selectCurrentSignesVitauxFilter = createSelector(
  selectExamensFilters,
  (filters) => ({
    tensionMin: filters.tensionMin,
    tensionMax: filters.tensionMax,
    temperatureMin: filters.temperatureMin,
    temperatureMax: filters.temperatureMax
  })
);

export const selectCurrentIMCFilter = createSelector(
  selectExamensFilters,
  (filters) => ({
    imcMin: filters.imcMin,
    imcMax: filters.imcMax
  })
);

export const selectCurrentAnomaliesFilter = createSelector(
  selectExamensFilters,
  (filters) => filters.hasAnomalies
);

/**
 * Selectors pour l'évaluation des signes vitaux
 */
export const selectSignesVitauxEvaluation = createSelector(
  selectExamensCliniquesState,
  (state) => state.signesVitauxEvaluation
);

export const selectTensionArterielleStatus = createSelector(
  selectSignesVitauxEvaluation,
  (evaluation) => evaluation?.tensionArterielle || 'normale'
);

export const selectTemperatureStatus = createSelector(
  selectSignesVitauxEvaluation,
  (evaluation) => evaluation?.temperature || 'normale'
);

export const selectFrequenceCardiaqueStatus = createSelector(
  selectSignesVitauxEvaluation,
  (evaluation) => evaluation?.frequenceCardiaque || 'normale'
);

export const selectIMCValue = createSelector(
  selectSignesVitauxEvaluation,
  (evaluation) => evaluation?.imc || 0
);

export const selectIMCCategorie = createSelector(
  selectSignesVitauxEvaluation,
  (evaluation) => evaluation?.categorieIMC || 'normal'
);

/**
 * Selectors pour le calcul IMC
 */
export const selectIMCCalculation = createSelector(
  selectExamensCliniquesState,
  (state) => state.imcCalculation
);

export const selectCalculatedIMC = createSelector(
  selectIMCCalculation,
  (calculation) => calculation?.imc || 0
);

export const selectCalculatedIMCCategorie = createSelector(
  selectIMCCalculation,
  (calculation) => calculation?.categorie || 'normal'
);

/**
 * Selectors pour l'analyse des tendances
 */
export const selectTendancesAnalysis = createSelector(
  selectExamensCliniquesState,
  (state) => state.tendancesAnalysis
);

export const selectEvolutionPoids = createSelector(
  selectTendancesAnalysis,
  (analysis) => analysis?.evolutionPoids || []
);

export const selectEvolutionTension = createSelector(
  selectTendancesAnalysis,
  (analysis) => analysis?.evolutionTension || []
);

export const selectEvolutionTemperature = createSelector(
  selectTendancesAnalysis,
  (analysis) => analysis?.evolutionTemperature || []
);

export const selectEvolutionFrequenceCardiaque = createSelector(
  selectTendancesAnalysis,
  (analysis) => analysis?.evolutionFrequenceCardiaque || []
);

export const selectAlertesTendances = createSelector(
  selectTendancesAnalysis,
  (analysis) => analysis?.alertes || []
);

export const selectAlertesParSeverite = createSelector(
  selectAlertesTendances,
  (alertes) => ({
    info: alertes.filter(a => a.severite === 'info'),
    warning: alertes.filter(a => a.severite === 'warning'),
    error: alertes.filter(a => a.severite === 'error')
  })
);

/**
 * Selectors pour la comparaison avec les normes
 */
export const selectNormsComparison = createSelector(
  selectExamensCliniquesState,
  (state) => state.normsComparison
);

export const selectPoidsNormal = createSelector(
  selectNormsComparison,
  (comparison) => comparison?.poidsNormal || false
);

export const selectTensionNormale = createSelector(
  selectNormsComparison,
  (comparison) => comparison?.tensionNormale || false
);

export const selectTemperatureNormale = createSelector(
  selectNormsComparison,
  (comparison) => comparison?.temperatureNormale || false
);

export const selectFrequenceNormale = createSelector(
  selectNormsComparison,
  (comparison) => comparison?.frequenceNormale || false
);

export const selectRecommandations = createSelector(
  selectNormsComparison,
  (comparison) => comparison?.recommandations || []
);

/**
 * Selectors pour le rapport médical
 */
export const selectMedicalReport = createSelector(
  selectExamensCliniquesState,
  (state) => state.medicalReport
);

export const selectMedicalReportResume = createSelector(
  selectMedicalReport,
  (report) => report?.resume || ''
);

export const selectMedicalReportRecommandations = createSelector(
  selectMedicalReport,
  (report) => report?.recommandations || []
);

export const selectMedicalReportAlertes = createSelector(
  selectMedicalReport,
  (report) => report?.alertes || []
);

export const selectMedicalReportGraphiques = createSelector(
  selectMedicalReport,
  (report) => report?.graphiques || []
);

/**
 * Selectors pour l'export
 */
export const selectExportData = createSelector(
  selectExamensCliniquesState,
  (state) => state.exportData
);

export const selectPdfBlob = createSelector(
  selectExportData,
  (exportData) => exportData.pdfBlob
);

export const selectExcelBlob = createSelector(
  selectExportData,
  (exportData) => exportData.excelBlob
);

/**
 * Selectors avec paramètres (fonctions)
 */

/**
 * Sélectionner un examen par ID
 */
export const selectExamenById = (id: string) =>
  createSelector(
    selectAllExamens,
    (examens) => examens.find(examen => examen.id === id) || null
  );

/**
 * Sélectionner les examens pour une consultation spécifique
 */
export const selectExamensForConsultation = (consultationId: string) =>
  createSelector(
    selectAllExamens,
    (examens) => examens.filter(examen => examen.consultation?.id === consultationId)
  );

/**
 * Sélectionner les examens avec une plage de poids spécifique
 */
export const selectExamensByPoidsRange = (min: number, max: number) =>
  createSelector(
    selectAllExamens,
    (examens) => examens.filter(examen => examen.poids >= min && examen.poids <= max)
  );

/**
 * Sélectionner les examens avec une plage d'IMC spécifique
 */
export const selectExamensByIMCRange = (min: number, max: number) =>
  createSelector(
    selectAllExamens,
    (examens) => examens.filter(examen => {
      // Calcul de l'IMC pour le filtrage
      const imc = examen.taille > 0 ? (examen.poids / Math.pow(examen.taille / 100, 2)) : 0;
      return imc >= min && imc <= max;
    })
  );

/**
 * Sélectionner les examens avec anomalies détectées
 */
export const selectExamensWithAnomalies = createSelector(
  selectAllExamens,
  (examens) => examens.filter(examen => 
    examen.anomalieSquelette || 
    examen.etatConjonctives || 
    examen.etatSeins || 
    examen.oedemes
  )
);

/**
 * Sélectionner les examens par observation (recherche)
 */
export const selectExamensByObservation = (searchTerm: string) =>
  createSelector(
    selectAllExamens,
    (examens) => examens.filter(examen => 
      examen.observation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

/**
 * Sélectionner les examens groupés par statut des signes vitaux
 */
export const selectExamensGroupedByVitalSigns = createSelector(
  selectAllExamens,
  (examens) => {
    const grouped = {
      normale: [] as any[],
      anormale: [] as any[]
    };
    
    examens.forEach(examen => {
      // Logique simplifiée pour grouper par signes vitaux
      const hasAbnormalSigns = 
        examen.temperature < 36 || examen.temperature > 38 ||
        examen.frequenceCardiaque < 60 || examen.frequenceCardiaque > 100;
      
      if (hasAbnormalSigns) {
        grouped.anormale.push(examen);
      } else {
        grouped.normale.push(examen);
      }
    });
    
    return grouped;
  }
);

/**
 * Sélectionner les derniers examens (limités)
 */
export const selectLatestExamens = (limit: number = 5) =>
  createSelector(
    selectAllExamens,
    (examens) => [...examens]
      .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()) // Tri par ID comme proxy pour la date
      .slice(0, limit)
  );

/**
 * Sélectionner les examens nécessitant une attention particulière
 */
export const selectExamensNeedingAttention = createSelector(
  selectAllExamens,
  (examens) => examens.filter(examen => {
    // Critères d'attention (température élevée, tension élevée, etc.)
    return examen.temperature > 38 || 
           examen.frequenceCardiaque > 100 ||
           (examen.poids > 0 && examen.taille > 0 && 
            (examen.poids / Math.pow(examen.taille / 100, 2)) > 30);
  })
);

/**
 * Calculer les statistiques en temps réel
 */
export const selectComputedStats = createSelector(
  selectAllExamens,
  (examens) => {
    if (examens.length === 0) {
      return {
        total: 0,
        moyennePoids: 0,
        moyenneTaille: 0,
        moyenneTemperature: 0,
        moyenneFrequenceCardiaque: 0,
        nombreAnomalies: 0
      };
    }

    const total = examens.length;
    const moyennePoids = examens.reduce((sum, e) => sum + e.poids, 0) / total;
    const moyenneTaille = examens.reduce((sum, e) => sum + e.taille, 0) / total;
    const moyenneTemperature = examens.reduce((sum, e) => sum + e.temperature, 0) / total;
    const moyenneFrequenceCardiaque = examens.reduce((sum, e) => sum + e.frequenceCardiaque, 0) / total;
    const nombreAnomalies = examens.filter(e => 
      e.anomalieSquelette || e.etatConjonctives || e.etatSeins || e.oedemes
    ).length;

    return {
      total,
      moyennePoids: Math.round(moyennePoids * 10) / 10,
      moyenneTaille: Math.round(moyenneTaille * 10) / 10,
      moyenneTemperature: Math.round(moyenneTemperature * 10) / 10,
      moyenneFrequenceCardiaque: Math.round(moyenneFrequenceCardiaque),
      nombreAnomalies
    };
  }
); 