import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ComplicationRequest } from '../../core/models/complication/complication-request.model';
import { ComplicationResponse } from '../../core/models/complication/complication-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des complications
 */
export const ComplicationsActions = createActionGroup({
  source: 'Complications',
  events: {
    // Chargement d'une complication spécifique
    'Load Complication': props<{ id: string }>(),
    'Load Complication Success': props<{ data: ComplicationResponse }>(),
    'Load Complication Failure': props<{ error: string }>(),
    
    // Chargement des complications par grossesse
    'Load Complications By Grossesse': props<{ grossesseId: string }>(),
    'Load Complications By Grossesse Success': props<{ data: ComplicationResponse[] }>(),
    'Load Complications By Grossesse Failure': props<{ error: string }>(),
    
    // Chargement des complications par accouchement
    'Load Complications By Accouchement': props<{ accouchementId: string }>(),
    'Load Complications By Accouchement Success': props<{ data: ComplicationResponse[] }>(),
    'Load Complications By Accouchement Failure': props<{ error: string }>(),
    
    // Chargement des complications par naissance
    'Load Complications By Naissance': props<{ naissanceId: string }>(),
    'Load Complications By Naissance Success': props<{ data: ComplicationResponse[] }>(),
    'Load Complications By Naissance Failure': props<{ error: string }>(),
    
    // Création d'une complication
    'Create Complication': props<{ request: ComplicationRequest }>(),
    'Create Complication Success': props<{ data: ComplicationResponse }>(),
    'Create Complication Failure': props<{ error: string }>(),
    
    // Mise à jour d'une complication
    'Update Complication': props<{ id: string; request: ComplicationRequest }>(),
    'Update Complication Success': props<{ data: ComplicationResponse }>(),
    'Update Complication Failure': props<{ error: string }>(),
    
    // Suppression d'une complication
    'Delete Complication': props<{ id: string }>(),
    'Delete Complication Success': props<{ id: string }>(),
    'Delete Complication Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Complications State': emptyProps(),
    
    // Sélection d'une complication
    'Select Complication': props<{ id: string | null }>()
  }
}); 