import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PatientsState } from './patients.reducer';
import { Groupage } from '../../core/models/patiente/groupage.model';
import { Rhesus } from '../../core/models/patiente/rhesus.model';

/**
 * Sélecteur de la feature 'patients'
 */
export const selectPatientsState = createFeatureSelector<PatientsState>('patients');

/**
 * Sélecteur pour la liste des patientes
 */
export const selectAllPatients = createSelector(
  selectPatientsState,
  (state) => state?.patients || []
);

/**
 * Sélecteur pour la patiente sélectionnée
 */
export const selectSelectedPatient = createSelector(
  selectPatientsState,
  (state) => state?.selectedPatient || null
);

/**
 * Sélecteur pour l'ID de la patiente sélectionnée
 */
export const selectSelectedPatientId = createSelector(
  selectPatientsState,
  (state) => state?.selectedPatientId || null
);

/**
 * Sélecteur pour l'état de chargement
 */
export const selectPatientsLoading = createSelector(
  selectPatientsState,
  (state) => state?.loading || false
);

/**
 * Sélecteur pour les erreurs
 */
export const selectPatientsError = createSelector(
  selectPatientsState,
  (state) => state?.error || null
);

/**
 * Sélecteur pour les informations de pagination
 */
export const selectPatientsPagination = createSelector(
  selectPatientsState,
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
export const selectPatientsSearchTerm = createSelector(
  selectPatientsState,
  (state) => state?.searchTerm || null
);

/**
 * Sélecteur pour vérifier s'il y a des patientes
 */
export const selectHasPatients = createSelector(
  selectAllPatients,
  (patients) => patients && patients.length > 0
);

/**
 * Sélecteur pour une patiente par ID
 */
export const selectPatientById = (id: string) => createSelector(
  selectAllPatients,
  (patients) => patients?.find(patient => patient.id === id) || null
);

/**
 * Sélecteur pour les patientes filtrées par groupe sanguin
 */
export const selectPatientsByBloodType = (groupage: Groupage) => createSelector(
  selectAllPatients,
  (patients) => patients?.filter(patient => patient.groupageSanguin === groupage) || []
);

/**
 * Sélecteur pour les patientes filtrées par rhésus
 */
export const selectPatientsByRhesus = (rhesus: Rhesus) => createSelector(
  selectAllPatients,
  (patients) => patients?.filter(patient => patient.rhesus === rhesus) || []
);

/**
 * Sélecteur pour le nom complet de la patiente sélectionnée
 */
export const selectSelectedPatientFullName = createSelector(
  selectSelectedPatient,
  (patient) => patient ? `${patient.nom} ${patient.prenom}` : ''
); 