import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { NaissanceRequest } from '../../core/models/naissance/naissance-request.model';
import { NaissanceResponse } from '../../core/models/naissance/naissance-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des naissances
 */
export const NaissancesActions = createActionGroup({
  source: 'Naissances',
  events: {
    // Chargement de toutes les naissances
    'Load Naissances': props<{ page: number; size: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Naissances Success': props<{ data: PageResponse<NaissanceResponse> }>(),
    'Load Naissances Failure': props<{ error: string }>(),
    
    // Chargement d'une naissance spécifique
    'Load Naissance': props<{ id: string }>(),
    'Load Naissance Success': props<{ data: NaissanceResponse }>(),
    'Load Naissance Failure': props<{ error: string }>(),
    
    // Chargement des naissances par accouchement
    'Load Naissances By Accouchement': props<{ accouchementId: string }>(),
    'Load Naissances By Accouchement Success': props<{ data: NaissanceResponse[] }>(),
    'Load Naissances By Accouchement Failure': props<{ error: string }>(),
    
    // Recherche de naissances
    'Search Naissances': props<{ searchTerm: string; page: number; size: number }>(),
    'Search Naissances Success': props<{ data: PageResponse<NaissanceResponse> }>(),
    'Search Naissances Failure': props<{ error: string }>(),
    
    // Création d'une naissance
    'Create Naissance': props<{ request: NaissanceRequest }>(),
    'Create Naissance Success': props<{ data: NaissanceResponse }>(),
    'Create Naissance Failure': props<{ error: string }>(),
    
    // Mise à jour d'une naissance
    'Update Naissance': props<{ id: string; request: NaissanceRequest }>(),
    'Update Naissance Success': props<{ data: NaissanceResponse }>(),
    'Update Naissance Failure': props<{ error: string }>(),
    
    // Suppression d'une naissance
    'Delete Naissance': props<{ id: string }>(),
    'Delete Naissance Success': props<{ id: string }>(),
    'Delete Naissance Failure': props<{ error: string }>(),
    
    // Filtrage par sexe
    'Filter By Sexe': props<{ sexe: string }>(),
    'Filter By Sexe Success': props<{ data: NaissanceResponse[] }>(),
    'Filter By Sexe Failure': props<{ error: string }>(),
    
    // Filtrage par statut vivant
    'Filter By Vivant': props<{ estVivant: boolean }>(),
    'Filter By Vivant Success': props<{ data: NaissanceResponse[] }>(),
    'Filter By Vivant Failure': props<{ error: string }>(),
    
    // Filtrage par poids
    'Filter By Poids': props<{ poidsMin: number; poidsMax: number }>(),
    'Filter By Poids Success': props<{ data: NaissanceResponse[] }>(),
    'Filter By Poids Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Naissances State': emptyProps(),
    
    // Sélection d'une naissance
    'Select Naissance': props<{ id: string | null }>()
  }
}); 