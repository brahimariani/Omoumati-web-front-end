import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PatienteRequest } from '../../core/models/patiente/patiente.request.model';
import { PatienteResponse } from '../../core/models/patiente/patiente.response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des patientes
 */
export const PatientsActions = createActionGroup({
  source: 'Patients',
  events: {
    // Chargement de toutes les patientes
    'Load Patients': props<{ page: number; size: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Patients Success': props<{ data: PageResponse<PatienteResponse> }>(),
    'Load Patients Failure': props<{ error: string }>(),
    
    // Chargement d'une patiente spécifique
    'Load Patient': props<{ id: string }>(),
    'Load Patient Success': props<{ data: PatienteResponse }>(),
    'Load Patient Failure': props<{ error: string }>(),
    
    // Recherche de patientes
    'Search Patients': props<{ searchTerm: string; page: number; size: number }>(),
    'Search Patients Success': props<{ data: PageResponse<PatienteResponse> }>(),
    'Search Patients Failure': props<{ error: string }>(),
    
    // Création d'une patiente
    'Create Patient': props<{ request: PatienteRequest }>(),
    'Create Patient Success': props<{ data: PatienteResponse }>(),
    'Create Patient Failure': props<{ error: string }>(),
    
    // Mise à jour d'une patiente
    'Update Patient': props<{ id: string; request: PatienteRequest }>(),
    'Update Patient Success': props<{ data: PatienteResponse }>(),
    'Update Patient Failure': props<{ error: string }>(),
    
    // Suppression d'une patiente
    'Delete Patient': props<{ id: string }>(),
    'Delete Patient Success': props<{ id: string }>(),
    'Delete Patient Failure': props<{ error: string }>(),
    
    // Filtrage par groupe sanguin
    'Filter By Blood Type': props<{ groupage: string }>(),
    'Filter By Blood Type Success': props<{ data: PatienteResponse[] }>(),
    'Filter By Blood Type Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Patients State': emptyProps(),
    
    // Sélection d'une patiente
    'Select Patient': props<{ id: string | null }>()
  }
}); 