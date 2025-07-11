import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GrossesseRequest } from '../../core/models/grossesse/grossesse-request.model';
import { GrossesseResponse } from '../../core/models/grossesse/grossesse-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des grossesses
 */
export const GrossessesActions = createActionGroup({
  source: 'Grossesses',
  events: {
    // Chargement de toutes les grossesses
    'Load Grossesses': props<{ page: number; size: number }>(),
    'Load Grossesses Success': props<{ data: PageResponse<GrossesseResponse> }>(),
    'Load Grossesses Failure': props<{ error: string }>(),
    
    // Chargement d'une grossesse spécifique
    'Load Grossesse': props<{ id: string }>(),
    'Load Grossesse Success': props<{ data: GrossesseResponse }>(),
    'Load Grossesse Failure': props<{ error: string }>(),
    
    // Chargement des grossesses par patiente
    'Load Grossesses By Patient': props<{ patientId: string }>(),
    'Load Grossesses By Patient Success': props<{ data: GrossesseResponse[] }>(),
    'Load Grossesses By Patient Failure': props<{ error: string }>(),
    
    // Recherche de grossesses
    'Search Grossesses': props<{ searchTerm: string; page: number; size: number }>(),
    'Search Grossesses Success': props<{ data: PageResponse<GrossesseResponse> }>(),
    'Search Grossesses Failure': props<{ error: string }>(),
    
    // Création d'une grossesse
    'Create Grossesse': props<{ request: GrossesseRequest }>(),
    'Create Grossesse Success': props<{ data: GrossesseResponse }>(),
    'Create Grossesse Failure': props<{ error: string }>(),
    
    // Mise à jour d'une grossesse
    'Update Grossesse': props<{ id: string; request: GrossesseRequest }>(),
    'Update Grossesse Success': props<{ data: GrossesseResponse }>(),
    'Update Grossesse Failure': props<{ error: string }>(),
    
    // Suppression d'une grossesse
    'Delete Grossesse': props<{ id: string }>(),
    'Delete Grossesse Success': props<{ id: string }>(),
    'Delete Grossesse Failure': props<{ error: string }>(),
    
    // Filtrage par statut de grossesse
    'Filter By Status': props<{ estDesiree: boolean }>(),
    'Filter By Status Success': props<{ data: GrossesseResponse[] }>(),
    'Filter By Status Failure': props<{ error: string }>(),
    
    // Filtrage par terme prévu
    'Filter By Due Date': props<{ startDate: Date; endDate: Date }>(),
    'Filter By Due Date Success': props<{ data: GrossesseResponse[] }>(),
    'Filter By Due Date Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Grossesses State': emptyProps(),
    
    // Sélection d'une grossesse
    'Select Grossesse': props<{ id: string | null }>()
  }
}); 