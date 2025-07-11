import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConsultationsState } from './consultations.reducer';

/**
 * Sélecteur de la feature 'consultations'
 */
export const selectConsultationsState = createFeatureSelector<ConsultationsState>('consultations');

/**
 * Sélecteur pour la liste des consultations
 */
export const selectAllConsultations = createSelector(
  selectConsultationsState,
  (state) => state?.consultations || []
);

/**
 * Sélecteur pour la consultation sélectionnée
 */
export const selectSelectedConsultation = createSelector(
  selectConsultationsState,
  (state) => state?.selectedConsultation || null
);

/**
 * Sélecteur pour l'ID de la consultation sélectionnée
 */
export const selectSelectedConsultationId = createSelector(
  selectConsultationsState,
  (state) => state?.selectedConsultationId || null
);

/**
 * Sélecteur pour les consultations par grossesse
 */
export const selectConsultationsByGrossesse = createSelector(
  selectConsultationsState,
  (state) => state?.consultationsByGrossesse || []
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectConsultationsLoading = createSelector(
  selectConsultationsState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectConsultationsError = createSelector(
  selectConsultationsState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les informations de pagination
 */
export const selectConsultationsPagination = createSelector(
  selectConsultationsState,
  (state) => state?.pagination || {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  }
);

/**
 * Sélecteur pour le terme de recherche actuel
 */
export const selectConsultationsSearchTerm = createSelector(
  selectConsultationsState,
  (state) => state?.searchTerm || null
);

/**
 * Sélecteur pour les filtres actifs
 */
export const selectConsultationsFilters = createSelector(
  selectConsultationsState,
  (state) => state?.filters || {}
);

/**
 * Sélecteur pour les statistiques des consultations
 */
export const selectConsultationStats = createSelector(
  selectConsultationsState,
  (state) => state?.stats || null
);

/**
 * Sélecteur pour les informations de consultation due
 */
export const selectConsultationDue = createSelector(
  selectConsultationsState,
  (state) => state?.consultationDue || null
);

/**
 * Sélecteur pour les modèles de consultation
 */
export const selectConsultationTemplates = createSelector(
  selectConsultationsState,
  (state) => state?.templates || []
);

/**
 * Sélecteur pour les données d'export
 */
export const selectConsultationExportData = createSelector(
  selectConsultationsState,
  (state) => state?.exportData || {}
);

/**
 * Sélecteur pour vérifier s'il y a des consultations
 */
export const selectHasConsultations = createSelector(
  selectAllConsultations,
  (consultations) => consultations && consultations.length > 0
);

/**
 * Sélecteur pour une consultation par ID
 */
export const selectConsultationById = (id: string) => createSelector(
  selectAllConsultations,
  (consultations) => consultations?.find(consultation => consultation.id === id) || null
);

/**
 * Sélecteur pour les consultations par grossesse spécifique
 */
export const selectConsultationsByGrossesseId = (grossesseId: string) => createSelector(
  selectAllConsultations,
  (consultations) => consultations?.filter(consultation => consultation.grossesseId === grossesseId) || []
);

/**
 * Sélecteur pour les consultations récentes (dernières 30 jours)
 */
export const selectRecentConsultations = createSelector(
  selectAllConsultations,
  (consultations) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return consultations?.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate >= thirtyDaysAgo;
    }) || [];
  }
);

/**
 * Sélecteur pour les consultations d'aujourd'hui
 */
export const selectTodayConsultations = createSelector(
  selectAllConsultations,
  (consultations) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return consultations?.filter(consultation => {
      const consultationDateStr = new Date(consultation.date).toISOString().split('T')[0];
      return consultationDateStr === todayStr;
    }) || [];
  }
);

/**
 * Sélecteur pour les consultations de cette semaine
 */
export const selectThisWeekConsultations = createSelector(
  selectAllConsultations,
  (consultations) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return consultations?.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate >= startOfWeek && consultationDate <= endOfWeek;
    }) || [];
  }
);

/**
 * Sélecteur pour les consultations par période (date range)
 */
export const selectConsultationsByDateRange = (startDate: Date, endDate: Date) => createSelector(
  selectAllConsultations,
  (consultations) => consultations?.filter(consultation => {
    const consultationDate = new Date(consultation.date);
    return consultationDate >= startDate && consultationDate <= endDate;
  }) || []
);

/**
 * Sélecteur pour les consultations avec un mot-clé dans l'observation
 */
export const selectConsultationsByObservationKeyword = (keyword: string) => createSelector(
  selectAllConsultations,
  (consultations) => consultations?.filter(consultation => 
    consultation.observation.toLowerCase().includes(keyword.toLowerCase())
  ) || []
);

/**
 * Sélecteur pour les consultations triées par date (plus récentes en premier)
 */
export const selectConsultationsSortedByDate = createSelector(
  selectAllConsultations,
  (consultations) => [...consultations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
);

/**
 * Sélecteur pour la dernière consultation
 */
export const selectLastConsultation = createSelector(
  selectConsultationsSortedByDate,
  (consultations) => consultations?.[0] || null
);

/**
 * Sélecteur pour la dernière consultation d'une grossesse spécifique
 */
export const selectLastConsultationByGrossesse = (grossesseId: string) => createSelector(
  selectConsultationsByGrossesseId(grossesseId),
  (consultations) => {
    const sorted = [...consultations].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted?.[0] || null;
  }
);

/**
 * Sélecteur pour le nombre total de consultations
 */
export const selectConsultationsCount = createSelector(
  selectAllConsultations,
  (consultations) => consultations?.length || 0
);

/**
 * Sélecteur pour le nombre de consultations par grossesse
 */
export const selectConsultationsCountByGrossesse = (grossesseId: string) => createSelector(
  selectConsultationsByGrossesseId(grossesseId),
  (consultations) => consultations?.length || 0
);

/**
 * Sélecteur pour vérifier s'il y a des consultations en chargement
 */
export const selectIsLoadingConsultations = createSelector(
  selectConsultationsLoading,
  (loading) => loading
);

/**
 * Sélecteur pour vérifier s'il y a une erreur
 */
export const selectHasConsultationsError = createSelector(
  selectConsultationsError,
  (error) => !!error
);

/**
 * Sélecteur pour les modèles de consultation par type
 */
export const selectConsultationTemplatesByType = (type: 'routine' | 'urgence' | 'controle') => createSelector(
  selectConsultationTemplates,
  (templates) => templates?.filter(template => template.typeConsultation === type) || []
);

/**
 * Sélecteur pour vérifier si une consultation est due selon les stats
 */
export const selectIsConsultationDue = createSelector(
  selectConsultationDue,
  (consultationDue) => consultationDue?.isDue || false
);

/**
 * Sélecteur pour le nombre de jours depuis la dernière consultation
 */
export const selectDaysSinceLastConsultation = createSelector(
  selectConsultationDue,
  (consultationDue) => consultationDue?.daysSinceLastConsultation || 0
);

/**
 * Sélecteur pour la date recommandée de la prochaine consultation
 */
export const selectRecommendedConsultationDate = createSelector(
  selectConsultationDue,
  (consultationDue) => consultationDue?.recommendedDate || null
);

/**
 * Sélecteur pour vérifier si on peut exporter en PDF
 */
export const selectCanExportPdf = createSelector(
  selectConsultationExportData,
  (exportData) => !!exportData.pdfBlob
);

/**
 * Sélecteur pour vérifier si on peut exporter en Excel
 */
export const selectCanExportExcel = createSelector(
  selectConsultationExportData,
  (exportData) => !!exportData.excelBlob
);

/**
 * Sélecteur pour le total des consultations selon les stats
 */
export const selectTotalConsultationsFromStats = createSelector(
  selectConsultationStats,
  (stats) => stats?.totalConsultations || 0
);

/**
 * Sélecteur pour les consultations par mois selon les stats
 */
export const selectConsultationsParMois = createSelector(
  selectConsultationStats,
  (stats) => stats?.consultationsParMois || []
);

/**
 * Sélecteur pour la dernière consultation selon les stats
 */
export const selectDerniereConsultationFromStats = createSelector(
  selectConsultationStats,
  (stats) => stats?.derniereConsultation || null
);

/**
 * Sélecteur pour la prochaine consultation prévue selon les stats
 */
export const selectProchaineConsultationPrevue = createSelector(
  selectConsultationStats,
  (stats) => stats?.prochaineConsultationPrevue || null
); 