import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AccouchementRequest } from '../../core/models/accouchement/accouchement-request.model';
import { AccouchementResponse } from '../../core/models/accouchement/accouchement-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des accouchements
 */
export const AccouchementsActions = createActionGroup({
  source: 'Accouchements',
  events: {
    // Chargement de tous les accouchements
    'Load Accouchements': props<{ page: number; size: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Accouchements Success': props<{ data: PageResponse<AccouchementResponse> }>(),
    'Load Accouchements Failure': props<{ error: string }>(),
    
    // Chargement d'un accouchement spécifique
    'Load Accouchement': props<{ id: string }>(),
    'Load Accouchement Success': props<{ data: AccouchementResponse }>(),
    'Load Accouchement Failure': props<{ error: string }>(),
    
    // Chargement des accouchements par patiente
    'Load Accouchements By Patient': props<{ patientId: string }>(),
    'Load Accouchements By Patient Success': props<{ data: AccouchementResponse[] }>(),
    'Load Accouchements By Patient Failure': props<{ error: string }>(),
    
    // Chargement des accouchements par grossesse
    'Load Accouchements By Grossesse': props<{ grossesseId: string }>(),
    'Load Accouchements By Grossesse Success': props<{ data: AccouchementResponse[] }>(),
    'Load Accouchements By Grossesse Failure': props<{ error: string }>(),
    
    // Recherche d'accouchements
    'Search Accouchements': props<{ searchTerm: string; page: number; size: number }>(),
    'Search Accouchements Success': props<{ data: PageResponse<AccouchementResponse> }>(),
    'Search Accouchements Failure': props<{ error: string }>(),
    
    // Création d'un accouchement
    'Create Accouchement': props<{ request: AccouchementRequest }>(),
    'Create Accouchement Success': props<{ data: AccouchementResponse }>(),
    'Create Accouchement Failure': props<{ error: string }>(),
    
    // Mise à jour d'un accouchement
    'Update Accouchement': props<{ id: string; request: AccouchementRequest }>(),
    'Update Accouchement Success': props<{ data: AccouchementResponse }>(),
    'Update Accouchement Failure': props<{ error: string }>(),
    
    // Suppression d'un accouchement
    'Delete Accouchement': props<{ id: string }>(),
    'Delete Accouchement Success': props<{ id: string }>(),
    'Delete Accouchement Failure': props<{ error: string }>(),
    
    // Filtrage par modalité d'extraction
    'Filter By Modalite': props<{ modaliteExtraction: string }>(),
    'Filter By Modalite Success': props<{ data: AccouchementResponse[] }>(),
    'Filter By Modalite Failure': props<{ error: string }>(),
    
    // Filtrage par assistance qualifiée
    'Filter By Assistance': props<{ assisstanceQualifiee: boolean }>(),
    'Filter By Assistance Success': props<{ data: AccouchementResponse[] }>(),
    'Filter By Assistance Failure': props<{ error: string }>(),
    
    // Filtrage par date d'accouchement
    'Filter By Date': props<{ startDate: Date; endDate: Date }>(),
    'Filter By Date Success': props<{ data: AccouchementResponse[] }>(),
    'Filter By Date Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Accouchements State': emptyProps(),
    
    // Sélection d'un accouchement
    'Select Accouchement': props<{ id: string | null }>()
  }
}); 