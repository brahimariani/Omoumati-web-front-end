import { createAction, props } from '@ngrx/store';
import { ReferenceRequest } from '../../core/models/reference/reference-request.model';
import { ReferenceResponse } from '../../core/models/reference/reference-response.model';
import { StatutReference } from '../../core/models/reference/statut.model';
import { PageResponse } from '../../core/models/api-response.model';

// Actions de chargement des références
export const loadReferences = createAction(
  '[References] Load References',
  props<{ 
    page?: number; 
    size?: number; 
    sort?: string; 
    direction?: 'asc' | 'desc';
  }>()
);

export const loadReferencesSuccess = createAction(
  '[References] Load References Success',
  props<{ references: PageResponse<ReferenceResponse> }>()
);

export const loadReferencesFailure = createAction(
  '[References] Load References Failure',
  props<{ error: any }>()
);

// Actions de recherche
export const searchReferences = createAction(
  '[References] Search References',
  props<{ 
    searchTerm: string;
    page?: number; 
    size?: number; 
    statut?: StatutReference;
    centreOrigine?: string;
    centreDestination?: string;
  }>()
);

export const searchReferencesSuccess = createAction(
  '[References] Search References Success',
  props<{ references: PageResponse<ReferenceResponse> }>()
);

export const searchReferencesFailure = createAction(
  '[References] Search References Failure',
  props<{ error: any }>()
);

// Actions de récupération d'une référence
export const loadReference = createAction(
  '[References] Load Reference',
  props<{ id: string }>()
);

export const loadReferenceSuccess = createAction(
  '[References] Load Reference Success',
  props<{ reference: ReferenceResponse }>()
);

export const loadReferenceFailure = createAction(
  '[References] Load Reference Failure',
  props<{ error: any }>()
);

// Actions de création
export const createReference = createAction(
  '[References] Create Reference',
  props<{ reference: ReferenceRequest }>()
);

export const createReferenceSuccess = createAction(
  '[References] Create Reference Success',
  props<{ reference: ReferenceResponse }>()
);

export const createReferenceFailure = createAction(
  '[References] Create Reference Failure',
  props<{ error: any }>()
);

// Actions de mise à jour
export const updateReference = createAction(
  '[References] Update Reference',
  props<{ id: string; reference: Partial<ReferenceRequest> }>()
);

export const updateReferenceSuccess = createAction(
  '[References] Update Reference Success',
  props<{ reference: ReferenceResponse }>()
);

export const updateReferenceFailure = createAction(
  '[References] Update Reference Failure',
  props<{ error: any }>()
);

// Actions de suppression
export const deleteReference = createAction(
  '[References] Delete Reference',
  props<{ id: string }>()
);

export const deleteReferenceSuccess = createAction(
  '[References] Delete Reference Success',
  props<{ id: string }>()
);

export const deleteReferenceFailure = createAction(
  '[References] Delete Reference Failure',
  props<{ error: any }>()
);

// Actions de changement de statut
export const changeStatutReference = createAction(
  '[References] Change Statut Reference',
  props<{ id: string; statut: StatutReference }>()
);

export const changeStatutReferenceSuccess = createAction(
  '[References] Change Statut Reference Success',
  props<{ reference: ReferenceResponse }>()
);

export const changeStatutReferenceFailure = createAction(
  '[References] Change Statut Reference Failure',
  props<{ error: any }>()
);

// Actions de récupération par statut
export const loadReferencesByStatut = createAction(
  '[References] Load References By Statut',
  props<{ statut: StatutReference; page?: number; size?: number }>()
);

export const loadReferencesByStatutSuccess = createAction(
  '[References] Load References By Statut Success',
  props<{ references: PageResponse<ReferenceResponse> }>()
);

export const loadReferencesByStatutFailure = createAction(
  '[References] Load References By Statut Failure',
  props<{ error: any }>()
);

// Actions de récupération par patiente
export const loadReferencesByPatiente = createAction(
  '[References] Load References By Patiente',
  props<{ patienteId: string; page?: number; size?: number }>()
);

export const loadReferencesByPatienteSuccess = createAction(
  '[References] Load References By Patiente Success',
  props<{ references: PageResponse<ReferenceResponse> }>()
);

export const loadReferencesByPatienteFailure = createAction(
  '[References] Load References By Patiente Failure',
  props<{ error: any }>()
);

// Actions de récupération par centre
export const loadReferencesByCentre = createAction(
  '[References] Load References By Centre',
  props<{ centreId: string; centreType: 'origine' | 'destination'; page?: number; size?: number }>()
);

export const loadReferencesByCentreSuccess = createAction(
  '[References] Load References By Centre Success',
  props<{ references: PageResponse<ReferenceResponse> }>()
);

export const loadReferencesByCentreFailure = createAction(
  '[References] Load References By Centre Failure',
  props<{ error: any }>()
);

// Actions de statistiques
export const loadReferencesStatistics = createAction(
  '[References] Load References Statistics'
);

export const loadReferencesStatisticsSuccess = createAction(
  '[References] Load References Statistics Success',
  props<{ 
    statistics: {
      total: number;
      accepted: number;
      rejected: number;
      reported: number;
      parCentre: { [key: string]: number };
      parMois: { [key: string]: number };
    }
  }>()
);

export const loadReferencesStatisticsFailure = createAction(
  '[References] Load References Statistics Failure',
  props<{ error: any }>()
);

// Actions de références récentes
export const loadRecentReferences = createAction(
  '[References] Load Recent References',
  props<{ limit?: number }>()
);

export const loadRecentReferencesSuccess = createAction(
  '[References] Load Recent References Success',
  props<{ references: ReferenceResponse[] }>()
);

export const loadRecentReferencesFailure = createAction(
  '[References] Load Recent References Failure',
  props<{ error: any }>()
);

// Actions utilitaires
export const clearReferences = createAction(
  '[References] Clear References'
);

export const clearSelectedReference = createAction(
  '[References] Clear Selected Reference'
);

export const setSelectedReference = createAction(
  '[References] Set Selected Reference',
  props<{ reference: ReferenceResponse }>()
);

export const setReferencesLoading = createAction(
  '[References] Set References Loading',
  props<{ loading: boolean }>()
);

export const setReferencesError = createAction(
  '[References] Set References Error',
  props<{ error: any }>()
);

export const clearReferencesError = createAction(
  '[References] Clear References Error'
); 