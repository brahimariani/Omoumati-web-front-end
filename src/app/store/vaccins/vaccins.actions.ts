import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { VaccinRequestDto } from '../../core/models/vaccin/vaccin-request.model';
import { VaccinResponseDto } from '../../core/models/vaccin/vaccin-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des vaccins
 */
export const VaccinsActions = createActionGroup({
  source: 'Vaccins',
  events: {
    // Chargement de tous les vaccins
    'Load Vaccins': props<{ page: number; size: number; sort?: string; direction?: 'asc' | 'desc' }>(),
    'Load Vaccins Success': props<{ data: PageResponse<VaccinResponseDto> }>(),
    'Load Vaccins Failure': props<{ error: string }>(),
    
    // Chargement d'un vaccin spécifique
    'Load Vaccin': props<{ id: string }>(),
    'Load Vaccin Success': props<{ data: VaccinResponseDto }>(),
    'Load Vaccin Failure': props<{ error: string }>(),
    
    // Chargement des vaccins par patiente
    'Load Vaccins By Patient': props<{ patientId: string }>(),
    'Load Vaccins By Patient Success': props<{ data: VaccinResponseDto[] }>(),
    'Load Vaccins By Patient Failure': props<{ error: string }>(),
    
    // Chargement des vaccins par naissance
    'Load Vaccins By Naissance': props<{ naissanceId: string }>(),
    'Load Vaccins By Naissance Success': props<{ data: VaccinResponseDto[] }>(),
    'Load Vaccins By Naissance Failure': props<{ error: string }>(),
    
    // Recherche de vaccins
    'Search Vaccins': props<{ searchTerm: string; page: number; size: number }>(),
    'Search Vaccins Success': props<{ data: PageResponse<VaccinResponseDto> }>(),
    'Search Vaccins Failure': props<{ error: string }>(),
    
    // Création d'un vaccin
    'Create Vaccin': props<{ request: VaccinRequestDto }>(),
    'Create Vaccin Success': props<{ data: VaccinResponseDto }>(),
    'Create Vaccin Failure': props<{ error: string }>(),
    
    // Mise à jour d'un vaccin
    'Update Vaccin': props<{ id: string; request: VaccinRequestDto }>(),
    'Update Vaccin Success': props<{ data: VaccinResponseDto }>(),
    'Update Vaccin Failure': props<{ error: string }>(),
    
    // Suppression d'un vaccin
    'Delete Vaccin': props<{ id: string }>(),
    'Delete Vaccin Success': props<{ id: string }>(),
    'Delete Vaccin Failure': props<{ error: string }>(),
    
    // Filtrage par nom de vaccin
    'Filter By Nom': props<{ nom: string }>(),
    'Filter By Nom Success': props<{ data: VaccinResponseDto[] }>(),
    'Filter By Nom Failure': props<{ error: string }>(),
    
    // Filtrage par date de vaccination
    'Filter By Date': props<{ startDate: Date; endDate: Date }>(),
    'Filter By Date Success': props<{ data: VaccinResponseDto[] }>(),
    'Filter By Date Failure': props<{ error: string }>(),
    
    // Chargement des vaccins manquants
    'Load Vaccins Manquants': props<{ naissanceId: string }>(),
    'Load Vaccins Manquants Success': props<{ data: string[] }>(),
    'Load Vaccins Manquants Failure': props<{ error: string }>(),
    
    // Marquer comme administré
    'Marquer Comme Administre': props<{ id: string }>(),
    'Marquer Comme Administre Success': props<{ data: VaccinResponseDto }>(),
    'Marquer Comme Administre Failure': props<{ error: string }>(),
    
    // Générer calendrier vaccinal
    'Generer Calendrier': props<{ naissanceId: string }>(),
    'Generer Calendrier Success': props<{ data: VaccinResponseDto[] }>(),
    'Generer Calendrier Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Vaccins State': emptyProps(),
    
    // Sélection d'un vaccin
    'Select Vaccin': props<{ id: string | null }>()
  }
}); 