import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ConsultationsActions } from '../../../store/consultations/consultations.actions';
import * as ConsultationsSelectors from '../../../store/consultations/consultations.selectors';
import { ConsultationResponse } from '../../../core/models/consultation/consultation-response.model';
import { SidePanelService } from '../../../core/services/side-panel.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TraitementListComponent } from '../components/traitement-list/traitement-list.component';
import { TraitementResponse } from '../../../core/models/traitement/traitement-response.model';
import * as TraitementsSelectors from '../../../store/traitements/traitements.selectors';
import { ExamenCliniqueListComponent } from '../components/examen-clinique-list/examen-clinique-list.component';
import { ExamenCliniqueResponse } from '../../../core/models/examen_clinique/examen-clinique-response.model';
import * as ExamensCliniquesSelectors from '../../../store/examens-cliniques/examens-cliniques.selectors';
import * as ExamensBiologiquesActions from '../../../store/examens-biologiques/examens-biologiques.actions';
import { loadTraitementsByConsultation } from '../../../store/traitements/traitements.actions';
import { loadExamensByConsultation } from '../../../store/examens-cliniques/examens-cliniques.actions';
import * as ExamensEchographiquesActions from '../../../store/examens-echographiques/examens-echographiques.actions';

// Import des composants d'examens biologiques
import { ExamenBiologiqueListComponent } from '../components/examen-biologique-list/examen-biologique-list.component';
import { ExamenBiologiqueResponse } from '../../../core/models/examen_biologique/examen-biologique-response.model';
import * as ExamensBiologiquesSelectors from '../../../store/examens-biologiques/examens-biologiques.selectors';
import { ExamenEchographiqueListComponent } from '../components/examen-echographique-list/examen-echographique-list.component';
import { ExamenEchographiqueResponse } from '../../../core/models/examen_echographique/examen-echographique-response.model';
import * as ExamensEchographiquesSelectors from '../../../store/examens-echographiques/examens-echographiques.selectors';

@Component({
  selector: 'app-consultation-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    TraitementListComponent,
    ExamenCliniqueListComponent,
    ExamenBiologiqueListComponent,
    ExamenEchographiqueListComponent
  ],
  templateUrl: './consultation-details.component.html',
  styleUrls: ['./consultation-details.component.css']
})
export class ConsultationDetailsComponent implements OnInit, OnDestroy {
  @Input() consultationId!: string;
  @Input() grossesseId?: string;
  @Input() patienteName?: string;

  // Observables
  consultation$: Observable<ConsultationResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  traitements$: Observable<TraitementResponse[]>;
  examensCliniques$: Observable<ExamenCliniqueResponse[]>;
  examensBiologiques$: Observable<ExamenBiologiqueResponse[]>;
  examensEchographiques$: Observable<ExamenEchographiqueResponse[]>;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.consultation$ = this.store.select(ConsultationsSelectors.selectSelectedConsultation);
    this.loading$ = this.store.select(ConsultationsSelectors.selectConsultationsLoading);
    this.error$ = this.store.select(ConsultationsSelectors.selectConsultationsError);
    this.traitements$ = this.store.select(TraitementsSelectors.selectAllTraitements);
    this.examensCliniques$ = this.store.select(ExamensCliniquesSelectors.selectExamensByConsultation);
    this.examensBiologiques$ = this.store.select(ExamensBiologiquesSelectors.selectAllExamensBiologiques);
    this.examensEchographiques$ = this.store.select(ExamensEchographiquesSelectors.selectAllExamensEchographiques);
  }

  ngOnInit(): void {
    // Récupérer les paramètres de route
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.consultationId = params['consultationId'];
      this.grossesseId = params['id']; // ID de la grossesse
      
      if (this.consultationId) {
        // Configurer l'observable examensEchographiques$ avec le bon consultationId
        this.examensEchographiques$ = this.store.select(ExamensEchographiquesSelectors.selectExamensByConsultation(this.consultationId));
        this.examensBiologiques$ = this.store.select(ExamensBiologiquesSelectors.selectExamensByConsultation(this.consultationId));
        

        this.loadConsultationDetails();
      }
    });

    // Récupérer les query params pour des informations supplémentaires
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
      this.patienteName = queryParams['patienteName'];
    });

    // Gestion des erreurs
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.notificationService.error(error, 'Erreur lors du chargement');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConsultationDetails(): void {
    // Charger la consultation depuis la base de données
    this.store.dispatch(ConsultationsActions.loadConsultation({ id: this.consultationId }));
    
    // Sélectionner la consultation chargée
    this.store.dispatch(ConsultationsActions.selectConsultation({ id: this.consultationId }));
    
    // Charger les données associées
    this.loadAssociatedData();
  }

  /**
   * Charger les données associées à la consultation
   */
  private loadAssociatedData(): void {
    // Charger les examens biologiques pour cette consultation
    this.store.dispatch(ExamensBiologiquesActions.loadExamensByConsultation({ 
      consultationId: this.consultationId 
    }));
    
    // Charger les traitements pour cette consultation
    this.store.dispatch(loadTraitementsByConsultation({ 
      consultationId: this.consultationId 
    }));
    
    // Charger les examens cliniques pour cette consultation
    this.store.dispatch(loadExamensByConsultation({ 
      consultationId: this.consultationId 
    }));

    // Charger les examens échographiques pour cette consultation
    this.store.dispatch(ExamensEchographiquesActions.loadExamensByConsultation({ 
      consultationId: this.consultationId 
    }));
  }

  onBack(): void {
    if (this.grossesseId) {
      this.router.navigate(['/grossesses', this.grossesseId]);
    } else {
      this.router.navigate(['/grossesses']);
    }
  }

  onEditConsultation(): void {
    // Navigation vers l'édition de consultation
    this.notificationService.info('Fonction d\'édition à implémenter');
  }

  onAddExamen(type: 'biologique' | 'clinique' | 'echographique'): void {
    this.notificationService.info(`Ajout d'examen ${type} à implémenter`);
  }

  onEditExamen(examen: any, type: string): void {
    this.notificationService.info(`Édition d'examen ${type} à implémenter`);
  }

  onDeleteExamen(examen: any, type: string): void {
    this.notificationService.info(`Suppression d'examen ${type} à implémenter`);
  }

  onTraitementSelected(traitement: TraitementResponse): void {
    // Logique pour gérer la sélection d'un traitement
    // Par exemple, afficher les détails dans un side panel ou naviguer vers une vue détaillée
    this.notificationService.info(`Traitement sélectionné: ${traitement.medicament}`);
  }

  onExamenCliniqueSelected(examen: ExamenCliniqueResponse): void {
    // Logique pour gérer la sélection d'un examen clinique
    this.notificationService.info(`Examen clinique sélectionné`);
  }

  onExamenBiologiqueSelected(examen: ExamenBiologiqueResponse): void {
    // Logique pour gérer la sélection d'un examen biologique
    this.notificationService.info(`Examen biologique sélectionné`);
    console.log('Examen biologique sélectionné:', examen);
  }

  onExamenEchographiqueSelected(examen: ExamenEchographiqueResponse): void {
    // Logique pour gérer la sélection d'un examen échographique
    this.notificationService.info(`Examen échographique sélectionné`);
    console.log('Examen échographique sélectionné:', examen);
  }

  // Méthodes utilitaires
  formatDate(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  formatDateTime(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'normal': return 'status-normal';
      case 'anormal': return 'status-warning';
      case 'critique': return 'status-critical';
      default: return '';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'normal': return 'check_circle';
      case 'anormal': return 'warning';
      case 'critique': return 'error';
      default: return 'info';
    }
  }

  getExamenIcon(type: string): string {
    if (type.includes('biologique')) return 'biotech';
    if (type.includes('clinique')) return 'medical_services';
    if (type.includes('echographique')) return 'monitor';
    return 'assignment';
  }
} 