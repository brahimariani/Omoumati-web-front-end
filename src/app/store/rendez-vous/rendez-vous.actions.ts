import { createAction, props } from '@ngrx/store';
import { RendezVousRequestDto } from '../../core/models/rendez-vous/rendez-vous-request.model';
import { RendezVousResponseDto } from '../../core/models/rendez-vous/rendez-vous-response.model';
import { StatutRendezVous } from '../../core/models/rendez-vous/statut.model';
import { PageResponse } from '../../core/models/api-response.model';

// Actions de chargement des rendez-vous
export const loadRendezVous = createAction(
  '[RendezVous] Load RendezVous',
  props<{ 
    page?: number; 
    size?: number; 
    sort?: string; 
    direction?: 'asc' | 'desc';
  }>()
);

export const loadRendezVousSuccess = createAction(
  '[RendezVous] Load RendezVous Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const loadRendezVousFailure = createAction(
  '[RendezVous] Load RendezVous Failure',
  props<{ error: any }>()
);

// Actions de recherche
export const searchRendezVous = createAction(
  '[RendezVous] Search RendezVous',
  props<{ 
    searchTerm: string;
    page?: number; 
    size?: number; 
    statut?: StatutRendezVous;
    patienteId?: string;
    dateDebut?: string;
    dateFin?: string;
  }>()
);

export const searchRendezVousSuccess = createAction(
  '[RendezVous] Search RendezVous Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const searchRendezVousFailure = createAction(
  '[RendezVous] Search RendezVous Failure',
  props<{ error: any }>()
);

// Actions de récupération d'un rendez-vous
export const loadRendezVousById = createAction(
  '[RendezVous] Load RendezVous By Id',
  props<{ id: string }>()
);

export const loadRendezVousByIdSuccess = createAction(
  '[RendezVous] Load RendezVous By Id Success',
  props<{ rendezVous: RendezVousResponseDto }>()
);

export const loadRendezVousByIdFailure = createAction(
  '[RendezVous] Load RendezVous By Id Failure',
  props<{ error: any }>()
);

// Actions de création
export const createRendezVous = createAction(
  '[RendezVous] Create RendezVous',
  props<{ rendezVous: RendezVousRequestDto }>()
);

export const createRendezVousSuccess = createAction(
  '[RendezVous] Create RendezVous Success',
  props<{ rendezVous: RendezVousResponseDto }>()
);

export const createRendezVousFailure = createAction(
  '[RendezVous] Create RendezVous Failure',
  props<{ error: any }>()
);

// Actions de mise à jour
export const updateRendezVous = createAction(
  '[RendezVous] Update RendezVous',
  props<{ id: string; rendezVous: Partial<RendezVousRequestDto> }>()
);

export const updateRendezVousSuccess = createAction(
  '[RendezVous] Update RendezVous Success',
  props<{ rendezVous: RendezVousResponseDto }>()
);

export const updateRendezVousFailure = createAction(
  '[RendezVous] Update RendezVous Failure',
  props<{ error: any }>()
);

// Actions de suppression
export const deleteRendezVous = createAction(
  '[RendezVous] Delete RendezVous',
  props<{ id: string }>()
);

export const deleteRendezVousSuccess = createAction(
  '[RendezVous] Delete RendezVous Success',
  props<{ id: string }>()
);

export const deleteRendezVousFailure = createAction(
  '[RendezVous] Delete RendezVous Failure',
  props<{ error: any }>()
);

// Actions de changement de statut
export const changeStatutRendezVous = createAction(
  '[RendezVous] Change Statut RendezVous',
  props<{ id: string; statut: StatutRendezVous }>()
);

export const changeStatutRendezVousSuccess = createAction(
  '[RendezVous] Change Statut RendezVous Success',
  props<{ rendezVous: RendezVousResponseDto }>()
);

export const changeStatutRendezVousFailure = createAction(
  '[RendezVous] Change Statut RendezVous Failure',
  props<{ error: any }>()
);

// Actions spécialisées pour les statuts
export const confirmerRendezVous = createAction(
  '[RendezVous] Confirmer RendezVous',
  props<{ id: string }>()
);

export const annulerRendezVous = createAction(
  '[RendezVous] Annuler RendezVous',
  props<{ id: string }>()
);

export const reporterRendezVous = createAction(
  '[RendezVous] Reporter RendezVous',
  props<{ id: string }>()
);

// Actions de récupération par statut
export const loadRendezVousByStatut = createAction(
  '[RendezVous] Load RendezVous By Statut',
  props<{ statut: StatutRendezVous; page?: number; size?: number }>()
);

export const loadRendezVousByStatutSuccess = createAction(
  '[RendezVous] Load RendezVous By Statut Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const loadRendezVousByStatutFailure = createAction(
  '[RendezVous] Load RendezVous By Statut Failure',
  props<{ error: any }>()
);

// Actions de récupération par patiente
export const loadRendezVousByPatiente = createAction(
  '[RendezVous] Load RendezVous By Patiente',
  props<{ patienteId: string; page?: number; size?: number }>()
);

export const loadRendezVousByPatienteSuccess = createAction(
  '[RendezVous] Load RendezVous By Patiente Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const loadRendezVousByPatienteFailure = createAction(
  '[RendezVous] Load RendezVous By Patiente Failure',
  props<{ error: any }>()
);

// Actions de récupération par centre
export const loadRendezVousByCentre = createAction(
  '[RendezVous] Load RendezVous By Centre',
  props<{ centreId: string; page?: number; size?: number }>()
);

export const loadRendezVousByCentreSuccess = createAction(
  '[RendezVous] Load RendezVous By Centre Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const loadRendezVousByCentreFailure = createAction(
  '[RendezVous] Load RendezVous By Centre Failure',
  props<{ error: any }>()
);

// Actions de récupération par date
export const loadRendezVousByDate = createAction(
  '[RendezVous] Load RendezVous By Date',
  props<{ date: string; page?: number; size?: number }>()
);

export const loadRendezVousByDateSuccess = createAction(
  '[RendezVous] Load RendezVous By Date Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const loadRendezVousByDateFailure = createAction(
  '[RendezVous] Load RendezVous By Date Failure',
  props<{ error: any }>()
);

// Actions de récupération par plage de dates
export const loadRendezVousByDateRange = createAction(
  '[RendezVous] Load RendezVous By Date Range',
  props<{ dateDebut: string; dateFin: string; page?: number; size?: number }>()
);

export const loadRendezVousByDateRangeSuccess = createAction(
  '[RendezVous] Load RendezVous By Date Range Success',
  props<{ rendezVous: PageResponse<RendezVousResponseDto> }>()
);

export const loadRendezVousByDateRangeFailure = createAction(
  '[RendezVous] Load RendezVous By Date Range Failure',
  props<{ error: any }>()
);

// Actions de statistiques
export const loadRendezVousStatistics = createAction(
  '[RendezVous] Load RendezVous Statistics'
);

export const loadRendezVousStatisticsSuccess = createAction(
  '[RendezVous] Load RendezVous Statistics Success',
  props<{ 
    statistics: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
      reported: number;
      parCentre: { [key: string]: number };
      parMois: { [key: string]: number };
      parStatut: { [key: string]: number };
    }
  }>()
);

export const loadRendezVousStatisticsFailure = createAction(
  '[RendezVous] Load RendezVous Statistics Failure',
  props<{ error: any }>()
);

// Actions de récupération des rendez-vous récents
export const loadRecentRendezVous = createAction(
  '[RendezVous] Load Recent RendezVous',
  props<{ limit?: number }>()
);

export const loadRecentRendezVousSuccess = createAction(
  '[RendezVous] Load Recent RendezVous Success',
  props<{ rendezVous: RendezVousResponseDto[] }>()
);

export const loadRecentRendezVousFailure = createAction(
  '[RendezVous] Load Recent RendezVous Failure',
  props<{ error: any }>()
);

// Actions de récupération des prochains rendez-vous
export const loadProchainRendezVous = createAction(
  '[RendezVous] Load Prochain RendezVous',
  props<{ limit?: number }>()
);

export const loadProchainRendezVousSuccess = createAction(
  '[RendezVous] Load Prochain RendezVous Success',
  props<{ rendezVous: RendezVousResponseDto[] }>()
);

export const loadProchainRendezVousFailure = createAction(
  '[RendezVous] Load Prochain RendezVous Failure',
  props<{ error: any }>()
);

// Actions de récupération des rendez-vous du jour
export const loadRendezVousDuJour = createAction(
  '[RendezVous] Load RendezVous Du Jour'
);

export const loadRendezVousDuJourSuccess = createAction(
  '[RendezVous] Load RendezVous Du Jour Success',
  props<{ rendezVous: RendezVousResponseDto[] }>()
);

export const loadRendezVousDuJourFailure = createAction(
  '[RendezVous] Load RendezVous Du Jour Failure',
  props<{ error: any }>()
);

// Actions de vérification des conflits
export const checkConflitsHoraires = createAction(
  '[RendezVous] Check Conflits Horaires',
  props<{ date: string; patienteId?: string; rendezVousId?: string }>()
);

export const checkConflitsHorairesSuccess = createAction(
  '[RendezVous] Check Conflits Horaires Success',
  props<{ conflits: RendezVousResponseDto[] }>()
);

export const checkConflitsHorairesFailure = createAction(
  '[RendezVous] Check Conflits Horaires Failure',
  props<{ error: any }>()
);

// Actions utilitaires
export const clearRendezVous = createAction(
  '[RendezVous] Clear RendezVous'
);

export const clearSelectedRendezVous = createAction(
  '[RendezVous] Clear Selected RendezVous'
);

export const setSelectedRendezVous = createAction(
  '[RendezVous] Set Selected RendezVous',
  props<{ rendezVous: RendezVousResponseDto }>()
);

export const setRendezVousLoading = createAction(
  '[RendezVous] Set RendezVous Loading',
  props<{ loading: boolean }>()
);

export const setRendezVousError = createAction(
  '[RendezVous] Set RendezVous Error',
  props<{ error: any }>()
);

export const clearRendezVousError = createAction(
  '[RendezVous] Clear RendezVous Error'
);

export const refreshRendezVous = createAction(
  '[RendezVous] Refresh RendezVous'
); 