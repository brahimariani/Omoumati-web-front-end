import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ConsultationRequest } from '../../core/models/consultation/consultation-request.model';
import { ConsultationResponse } from '../../core/models/consultation/consultation-response.model';
import { PageResponse } from '../../core/models/api-response.model';

/**
 * Actions pour le module de gestion des consultations
 */
export const ConsultationsActions = createActionGroup({
  source: 'Consultations',
  events: {
    // Chargement de toutes les consultations
    'Load Consultations': props<{ page: number; size: number; sortBy?: string; sortDir?: string }>(),
    'Load Consultations Success': props<{ data: PageResponse<ConsultationResponse> }>(),
    'Load Consultations Failure': props<{ error: string }>(),
    
    // Chargement d'une consultation spécifique
    'Load Consultation': props<{ id: string }>(),
    'Load Consultation Success': props<{ data: ConsultationResponse }>(),
    'Load Consultation Failure': props<{ error: string }>(),
    
    // Chargement des consultations par grossesse
    'Load Consultations By Grossesse': props<{ grossesseId: string; page?: number; size?: number }>(),
    'Load Consultations By Grossesse Success': props<{ data: ConsultationResponse[] }>(),
    'Load Consultations By Grossesse Failure': props<{ error: string }>(),
    
    // Recherche de consultations
    'Search Consultations': props<{ 
      grossesseId?: string; 
      dateDebut?: Date; 
      dateFin?: Date; 
      observation?: string; 
      page?: number; 
      size?: number; 
    }>(),
    'Search Consultations Success': props<{ data: PageResponse<ConsultationResponse> }>(),
    'Search Consultations Failure': props<{ error: string }>(),
    
    // Création d'une consultation
    'Create Consultation': props<{ request: ConsultationRequest }>(),
    'Create Consultation Success': props<{ data: ConsultationResponse }>(),
    'Create Consultation Failure': props<{ error: string }>(),
    
    // Mise à jour d'une consultation
    'Update Consultation': props<{ id: string; request: ConsultationRequest }>(),
    'Update Consultation Success': props<{ data: ConsultationResponse }>(),
    'Update Consultation Failure': props<{ error: string }>(),
    
    // Suppression d'une consultation
    'Delete Consultation': props<{ id: string }>(),
    'Delete Consultation Success': props<{ id: string }>(),
    'Delete Consultation Failure': props<{ error: string }>(),
    
    // Statistiques des consultations
    'Load Consultation Stats': props<{ grossesseId?: string }>(),
    'Load Consultation Stats Success': props<{ data: {
      totalConsultations: number;
      consultationsParMois: { mois: string; nombre: number; }[];
      derniereConsultation?: ConsultationResponse;
      prochaineConsultationPrevue?: Date;
    } }>(),
    'Load Consultation Stats Failure': props<{ error: string }>(),
    
    // Vérification des consultations dues
    'Check Consultation Due': props<{ grossesseId: string }>(),
    'Check Consultation Due Success': props<{ data: {
      isDue: boolean;
      daysSinceLastConsultation: number;
      recommendedDate: Date;
      lastConsultation?: ConsultationResponse;
    } }>(),
    'Check Consultation Due Failure': props<{ error: string }>(),
    
    // Modèles de consultation
    'Load Consultation Templates': emptyProps(),
    'Load Consultation Templates Success': props<{ data: {
      id: string;
      nom: string;
      observation: string;
      typeConsultation: 'routine' | 'urgence' | 'controle';
    }[] }>(),
    'Load Consultation Templates Failure': props<{ error: string }>(),
    
    // Créer consultation depuis modèle
    'Create Consultation From Template': props<{ templateId: string; grossesseId: string; date?: Date }>(),
    'Create Consultation From Template Success': props<{ data: ConsultationResponse }>(),
    'Create Consultation From Template Failure': props<{ error: string }>(),
    
    // Export de consultations
    'Export Consultations Pdf': props<{ grossesseId: string }>(),
    'Export Consultations Pdf Success': props<{ blob: Blob }>(),
    'Export Consultations Pdf Failure': props<{ error: string }>(),
    
    'Export Consultations Excel': props<{ grossesseId: string }>(),
    'Export Consultations Excel Success': props<{ blob: Blob }>(),
    'Export Consultations Excel Failure': props<{ error: string }>(),
    
    // Filtrage par date
    'Filter By Date Range': props<{ startDate: Date; endDate: Date }>(),
    'Filter By Date Range Success': props<{ data: ConsultationResponse[] }>(),
    'Filter By Date Range Failure': props<{ error: string }>(),
    
    // Filtrage par observation
    'Filter By Observation': props<{ observation: string }>(),
    'Filter By Observation Success': props<{ data: ConsultationResponse[] }>(),
    'Filter By Observation Failure': props<{ error: string }>(),
    
    // Réinitialisation du cache
    'Clear Cache': emptyProps(),
    
    // Rafraîchir consultations pour une grossesse
    'Refresh Consultations For Grossesse': props<{ grossesseId: string }>(),
    'Refresh Consultations For Grossesse Success': props<{ data: ConsultationResponse[] }>(),
    'Refresh Consultations For Grossesse Failure': props<{ error: string }>(),
    
    // Réinitialisation de l'état
    'Reset Consultations State': emptyProps(),
    
    // Sélection d'une consultation
    'Select Consultation': props<{ id: string | null }>()
  }
}); 