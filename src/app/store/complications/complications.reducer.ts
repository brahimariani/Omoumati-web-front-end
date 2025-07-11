import { createReducer, on } from '@ngrx/store';
import { ComplicationsActions } from './complications.actions';
import { ComplicationResponse } from '../../core/models/complication/complication-response.model';

/**
 * Interface pour l'état des complications
 */
export interface ComplicationsState {
  complications: ComplicationResponse[];
  selectedComplication: ComplicationResponse | null;
  selectedComplicationId: string | null;
  complicationsByGrossesse: ComplicationResponse[];
  complicationsByAccouchement: ComplicationResponse[];
  complicationsByNaissance: ComplicationResponse[];
  loading: boolean;
  error: string | null;
  filters: {
    grossesseId?: string;
    accouchementId?: string;
    naissanceId?: string;
    nature?: string;
    lieu?: string;
  };
}

/**
 * État initial pour le reducer des complications
 */
export const initialState: ComplicationsState = {
  complications: [],
  selectedComplication: null,
  selectedComplicationId: null,
  complicationsByGrossesse: [],
  complicationsByAccouchement: [],
  complicationsByNaissance: [],
  loading: false,
  error: null,
  filters: {}
};

/**
 * Reducer pour gérer les actions concernant les complications
 */
export const complicationsReducer = createReducer(
  initialState,
  
  // Chargement d'une complication spécifique
  on(ComplicationsActions.loadComplication, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ComplicationsActions.loadComplicationSuccess, (state, { data }) => ({
    ...state,
    selectedComplication: data,
    selectedComplicationId: data.id,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.loadComplicationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des complications par grossesse
  on(ComplicationsActions.loadComplicationsByGrossesse, (state, { grossesseId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      grossesseId
    }
  })),
  
  on(ComplicationsActions.loadComplicationsByGrossesseSuccess, (state, { data }) => ({
    ...state,
    complicationsByGrossesse: data,
    complications: data,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.loadComplicationsByGrossesseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des complications par accouchement
  on(ComplicationsActions.loadComplicationsByAccouchement, (state, { accouchementId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      accouchementId
    }
  })),
  
  on(ComplicationsActions.loadComplicationsByAccouchementSuccess, (state, { data }) => ({
    ...state,
    complicationsByAccouchement: data,
    complications: data,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.loadComplicationsByAccouchementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Chargement des complications par naissance
  on(ComplicationsActions.loadComplicationsByNaissance, (state, { naissanceId }) => ({
    ...state,
    loading: true,
    error: null,
    filters: {
      ...state.filters,
      naissanceId
    }
  })),
  
  on(ComplicationsActions.loadComplicationsByNaissanceSuccess, (state, { data }) => ({
    ...state,
    complicationsByNaissance: data,
    complications: data,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.loadComplicationsByNaissanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Création d'une complication
  on(ComplicationsActions.createComplication, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ComplicationsActions.createComplicationSuccess, (state, { data }) => ({
    ...state,
    complications: [...state.complications, data],
    selectedComplication: data,
    selectedComplicationId: data.id,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.createComplicationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Mise à jour d'une complication
  on(ComplicationsActions.updateComplication, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ComplicationsActions.updateComplicationSuccess, (state, { data }) => ({
    ...state,
    complications: state.complications.map(complication => 
      complication.id === data.id ? data : complication
    ),
    complicationsByGrossesse: state.complicationsByGrossesse.map(complication => 
      complication.id === data.id ? data : complication
    ),
    complicationsByAccouchement: state.complicationsByAccouchement.map(complication => 
      complication.id === data.id ? data : complication
    ),
    complicationsByNaissance: state.complicationsByNaissance.map(complication => 
      complication.id === data.id ? data : complication
    ),
    selectedComplication: state.selectedComplication?.id === data.id ? data : state.selectedComplication,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.updateComplicationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Suppression d'une complication
  on(ComplicationsActions.deleteComplication, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ComplicationsActions.deleteComplicationSuccess, (state, { id }) => ({
    ...state,
    complications: state.complications.filter(complication => complication.id !== id),
    complicationsByGrossesse: state.complicationsByGrossesse.filter(complication => complication.id !== id),
    complicationsByAccouchement: state.complicationsByAccouchement.filter(complication => complication.id !== id),
    complicationsByNaissance: state.complicationsByNaissance.filter(complication => complication.id !== id),
    selectedComplication: state.selectedComplication?.id === id ? null : state.selectedComplication,
    selectedComplicationId: state.selectedComplicationId === id ? null : state.selectedComplicationId,
    loading: false,
    error: null
  })),
  
  on(ComplicationsActions.deleteComplicationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Réinitialisation de l'état
  on(ComplicationsActions.resetComplicationsState, () => initialState),
  
  // Sélection d'une complication
  on(ComplicationsActions.selectComplication, (state, { id }) => ({
    ...state,
    selectedComplicationId: id,
    selectedComplication: id ? state.complications.find(c => c.id === id) || null : null
  }))
); 