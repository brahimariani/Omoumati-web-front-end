import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VaccinsState } from './vaccins.reducer';

/**
 * Sélecteur de la feature 'vaccins'
 */
export const selectVaccinsState = createFeatureSelector<VaccinsState>('vaccins');

/**
 * Sélecteur pour la liste des vaccins
 */
export const selectAllVaccins = createSelector(
  selectVaccinsState,
  (state) => state?.vaccins || []
);

/**
 * Sélecteur pour le vaccin sélectionné
 */
export const selectSelectedVaccin = createSelector(
  selectVaccinsState,
  (state) => state?.selectedVaccin || null
);

/**
 * Sélecteur pour l'ID du vaccin sélectionné
 */
export const selectSelectedVaccinId = createSelector(
  selectVaccinsState,
  (state) => state?.selectedVaccinId || null
);

/**
 * Sélecteur pour les vaccins par patiente
 */
export const selectVaccinsByPatient = createSelector(
  selectVaccinsState,
  (state) => state?.vaccinsByPatient || []
);

/**
 * Sélecteur pour les vaccins par naissance
 */
export const selectVaccinsByNaissance = createSelector(
  selectVaccinsState,
  (state) => state?.vaccinsByNaissance || []
);

/**
 * Sélecteur pour les vaccins manquants
 */
export const selectVaccinsManquants = createSelector(
  selectVaccinsState,
  (state) => state?.vaccinsManquants || []
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectVaccinsLoading = createSelector(
  selectVaccinsState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectVaccinsError = createSelector(
  selectVaccinsState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les informations de pagination
 */
export const selectVaccinsPagination = createSelector(
  selectVaccinsState,
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
export const selectVaccinsSearchTerm = createSelector(
  selectVaccinsState,
  (state) => state?.searchTerm || null
);

/**
 * Sélecteur pour les filtres actifs
 */
export const selectVaccinsFilters = createSelector(
  selectVaccinsState,
  (state) => state?.filters || {}
);

/**
 * Sélecteur pour vérifier s'il y a des vaccins
 */
export const selectHasVaccins = createSelector(
  selectAllVaccins,
  (vaccins) => vaccins && vaccins.length > 0
);

/**
 * Sélecteur pour un vaccin par ID
 */
export const selectVaccinById = (id: string) => createSelector(
  selectAllVaccins,
  (vaccins) => vaccins?.find(vaccin => vaccin.id === id) || null
);

/**
 * Sélecteur pour les vaccins par nom (type de vaccin)
 */
export const selectVaccinsByNom = (nom: string) => createSelector(
  selectAllVaccins,
  (vaccins) => vaccins?.filter(vaccin => 
    vaccin.nom.toLowerCase().includes(nom.toLowerCase())
  ) || []
);

/**
 * Sélecteur pour les vaccins dans une plage de dates
 */
export const selectVaccinsByDateRange = (startDate: Date, endDate: Date) => createSelector(
  selectAllVaccins,
  (vaccins) => vaccins?.filter(vaccin => {
    const vaccinDate = new Date(vaccin.date);
    return vaccinDate >= startDate && vaccinDate <= endDate;
  }) || []
);

/**
 * Sélecteur pour les vaccins récents (dernière semaine)
 */
export const selectVaccinsRecents = createSelector(
  selectAllVaccins,
  (vaccins) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return vaccins?.filter(vaccin => {
      const vaccinDate = new Date(vaccin.date);
      return vaccinDate >= oneWeekAgo;
    }) || [];
  }
);

/**
 * Sélecteur pour les vaccins d'aujourd'hui
 */
export const selectVaccinsToday = createSelector(
  selectAllVaccins,
  (vaccins) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return vaccins?.filter(vaccin => {
      const vaccinDate = new Date(vaccin.date);
      return vaccinDate >= today && vaccinDate < tomorrow;
    }) || [];
  }
);

/**
 * Sélecteur pour les vaccins à venir (prochaine semaine)
 */
export const selectVaccinsAVenir = createSelector(
  selectAllVaccins,
  (vaccins) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return vaccins?.filter(vaccin => {
      const vaccinDate = new Date(vaccin.date);
      return vaccinDate >= today && vaccinDate <= nextWeek;
    }) || [];
  }
);

/**
 * Sélecteur pour les vaccins groupés par nom
 */
export const selectVaccinsGroupedByNom = createSelector(
  selectAllVaccins,
  (vaccins) => {
    const grouped: { [key: string]: any[] } = {};
    vaccins?.forEach(vaccin => {
      if (!grouped[vaccin.nom]) {
        grouped[vaccin.nom] = [];
      }
      grouped[vaccin.nom].push(vaccin);
    });
    return grouped;
  }
);

/**
 * Sélecteur pour les vaccins groupés par patiente
 */
export const selectVaccinsGroupedByPatient = createSelector(
  selectAllVaccins,
  (vaccins) => {
    const grouped: { [key: string]: any[] } = {};
    vaccins?.forEach(vaccin => {
      if (!grouped[vaccin.patienteId]) {
        grouped[vaccin.patienteId] = [];
      }
      grouped[vaccin.patienteId].push(vaccin);
    });
    return grouped;
  }
);

/**
 * Sélecteur pour les vaccins groupés par naissance
 */
export const selectVaccinsGroupedByNaissance = createSelector(
  selectAllVaccins,
  (vaccins) => {
    const grouped: { [key: string]: any[] } = {};
    vaccins?.forEach(vaccin => {
      if (!grouped[vaccin.naissanceId]) {
        grouped[vaccin.naissanceId] = [];
      }
      grouped[vaccin.naissanceId].push(vaccin);
    });
    return grouped;
  }
);

/**
 * Sélecteur pour le nombre total de vaccins
 */
export const selectVaccinsCount = createSelector(
  selectAllVaccins,
  (vaccins) => vaccins?.length || 0
);

/**
 * Sélecteur pour le nombre de vaccins manquants
 */
export const selectVaccinsManquantsCount = createSelector(
  selectVaccinsManquants,
  (vaccinsManquants) => vaccinsManquants?.length || 0
);

/**
 * Sélecteur pour vérifier s'il y a des vaccins manquants
 */
export const selectHasVaccinsManquants = createSelector(
  selectVaccinsManquants,
  (vaccinsManquants) => vaccinsManquants && vaccinsManquants.length > 0
); 