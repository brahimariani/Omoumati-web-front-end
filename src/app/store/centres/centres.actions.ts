import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CentreRequest } from '../../core/models/centre/centre.request.model';
import { CentreResponse } from '../../core/models/centre/centre.response.model';
import { TypeCentre } from '../../core/models/centre/typecentre.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des centres
 */
export const CentresActions = createActionGroup({
  source: 'Centres',
  events: {
    // Chargement de tous les centres
    'Load Centres': props<{ page: number; size: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Centres Success': props<{ data: PageResponse<CentreResponse> }>(),
    'Load Centres Failure': props<{ error: string }>(),
    
    // Chargement d'un centre spécifique
    'Load Centre': props<{ id: string }>(),
    'Load Centre Success': props<{ data: CentreResponse }>(),
    'Load Centre Failure': props<{ error: string }>(),
    
    // Recherche de centres
    'Search Centres': props<{ searchTerm: string; page: number; size: number; typeCentre?: TypeCentre }>(),
    'Search Centres Success': props<{ data: PageResponse<CentreResponse> }>(),
    'Search Centres Failure': props<{ error: string }>(),
    
    // Création d'un centre
    'Create Centre': props<{ request: CentreRequest }>(),
    'Create Centre Success': props<{ data: CentreResponse }>(),
    'Create Centre Failure': props<{ error: string }>(),
    
    // Mise à jour d'un centre
    'Update Centre': props<{ id: string; request: Partial<CentreRequest> }>(),
    'Update Centre Success': props<{ data: CentreResponse }>(),
    'Update Centre Failure': props<{ error: string }>(),
    
    // Suppression d'un centre
    'Delete Centre': props<{ id: string }>(),
    'Delete Centre Success': props<{ id: string }>(),
    'Delete Centre Failure': props<{ error: string }>(),
    
    // Filtrage par type de centre
    'Filter By Type': props<{ centreType: TypeCentre; page: number; size: number }>(),
    'Filter By Type Success': props<{ data: PageResponse<CentreResponse> }>(),
    'Filter By Type Failure': props<{ error: string }>(),
    
    // Chargement des centres de l'utilisateur
    'Load My Centres': emptyProps(),
    'Load My Centres Success': props<{ data: CentreResponse[] }>(),
    'Load My Centres Failure': props<{ error: string }>(),
    
    // Chargement des statistiques
    'Load Statistics': emptyProps(),
    'Load Statistics Success': props<{ 
      data: {
        total: number;
        actifs: number;
        inactifs: number;
        parType: { [key in TypeCentre]: number };
      }
    }>(),
    'Load Statistics Failure': props<{ error: string }>(),
    
    // Changement de statut d'un centre
    'Toggle Centre Status': props<{ id: string; actif: boolean }>(),
    'Toggle Centre Status Success': props<{ data: CentreResponse }>(),
    'Toggle Centre Status Failure': props<{ error: string }>(),
    
    // Chargement des types de centres
    'Load Types': emptyProps(),
    'Load Types Success': props<{ data: TypeCentre[] }>(),
    'Load Types Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Centres State': emptyProps(),
    
    // Sélection d'un centre
    'Select Centre': props<{ id: string | null }>(),
    
    // Nettoyage des erreurs
    'Clear Error': emptyProps()
  }
}); 