import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { ExamenBiologiqueResponse } from '../../../../core/models/examen_biologique/examen-biologique-response.model';
import { ActeBiologiqueResponse } from '../../../../core/models/examen_biologique/acte_biologique/acte-biologique-response.model';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExamenBiologiqueService } from '../../../../core/services/examen-biologique.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import * as ExamensBiologiquesActions from '../../../../store/examens-biologiques/examens-biologiques.actions';
import * as ExamensBiologiquesSelectors from '../../../../store/examens-biologiques/examens-biologiques.selectors';

import { ExamenBiologiqueFormComponent } from '../examen-biologique-form/examen-biologique-form.component';

@Component({
  selector: 'app-examen-biologique-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './examen-biologique-list.component.html',
  styleUrl: './examen-biologique-list.component.css'
})
export class ExamenBiologiqueListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() consultationId!: string;
  @Input() patienteName?: string;
  @Output() examenSelected = new EventEmitter<ExamenBiologiqueResponse>();

  // Observables du store
  examens$: Observable<ExamenBiologiqueResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService,
    private examenBiologiqueService: ExamenBiologiqueService,
    private dialog: MatDialog
  ) {
    // Initialisation des observables
    this.examens$ = this.store.select(ExamensBiologiquesSelectors.selectExamensByConsultation(this.consultationId));
    this.loading$ = this.store.select(ExamensBiologiquesSelectors.selectExamensBiologiquesLoading);
    this.error$ = this.store.select(ExamensBiologiquesSelectors.selectExamensBiologiquesError);
  }

  ngOnInit(): void {
    // Charger les actes biologiques standards
    this.store.dispatch(ExamensBiologiquesActions.loadActesBiologiquesStandards());
    
    // Charger les examens pour cette consultation
    this.loadExamens();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationId'] && this.consultationId) {
      // Mettre à jour l'observable quand consultationId change
      this.examens$ = this.store.select(ExamensBiologiquesSelectors.selectExamensByConsultation(this.consultationId));
      this.loadExamens();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les examens biologiques pour la consultation
   */
  private loadExamens(): void {
    if (this.consultationId) {
      this.store.dispatch(ExamensBiologiquesActions.loadExamensByConsultation({ 
        consultationId: this.consultationId 
      }));
    }
  }

  /**
   * Ajouter un nouvel examen biologique
   */
  onAddExamen(): void {
    this.sidePanelService.open({
      title: 'Nouvel examen biologique',
      component: ExamenBiologiqueFormComponent,
      width: '1000px',
      data: {
        consultationId: this.consultationId,
        patienteName: this.patienteName,
        isEdit: false
      }
    });
  }

  /**
   * Modifier un examen biologique
   */
  onEditExamen(examen: ExamenBiologiqueResponse): void {
    this.sidePanelService.open({
      title: 'Modifier l\'examen biologique',
      component: ExamenBiologiqueFormComponent,
      width: '1000px',
      data: {
        examen: examen,
        consultationId: this.consultationId,
        patienteName: this.patienteName,
        isEdit: true
      }
    });
  }

  /**
   * Supprimer un examen biologique
   */
  onDeleteExamen(examen: ExamenBiologiqueResponse): void {
    const dialogData: ConfirmDialogData = {
      title: 'Supprimer l\'examen biologique',
      message: `Êtes-vous sûr de vouloir supprimer cet examen biologique ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(ExamensBiologiquesActions.deleteExamenBiologique({ id: examen.id }));
        
        // Rafraîchir la liste après suppression
        setTimeout(() => {
          this.store.dispatch(ExamensBiologiquesActions.loadExamensByConsultation({
            consultationId: this.consultationId
          }));
        }, 500);
      }
    });
  }

  /**
   * Sélectionner un examen (pour affichage détaillé)
   */
  onSelectExamen(examen: ExamenBiologiqueResponse): void {
    this.store.dispatch(ExamensBiologiquesActions.selectExamen({ id: examen.id }));
    this.examenSelected.emit(examen);
  }

  /**
   * Analyser les valeurs biologiques d'un examen
   */
  analyserValeurs(examen: ExamenBiologiqueResponse): void {
    this.store.dispatch(ExamensBiologiquesActions.analyserValeursBiologiques({ examen }));
  }

  /**
   * Obtenir l'analyse d'un examen
   */
  getAnalyseExamen(examenId: string): Observable<any[]> {
    return this.store.select(ExamensBiologiquesSelectors.selectAnalyseByExamenId(examenId));
  }

  /**
   * Vérifier si un examen a des anomalies
   */
  hasAnomalies(examen: ExamenBiologiqueResponse): boolean {
    // Logique simple basée sur les actes biologiques
    return examen.actesBiologiques.some(acte => {
      const valeurNumerique = parseFloat(acte.valeur);
      
      // Vérifications basiques selon le type d'acte
      switch (acte.nom.toLowerCase()) {
        case 'hémoglobine':
          return valeurNumerique < 11 || valeurNumerique > 16;
        case 'glycémie':
          return valeurNumerique < 0.7 || valeurNumerique > 1.26;
        case 'créatinine':
          return valeurNumerique > 12;
        case 'plaquettes':
          return valeurNumerique < 150 || valeurNumerique > 450;
        case 'albuminurie':
          return valeurNumerique > 30;
        case 'glucosurie':
          return valeurNumerique > 0;
        default:
          // Pour les sérologies, vérifier si positif
          return acte.valeur.toLowerCase().includes('positif') || acte.valeur.toLowerCase().includes('+');
      }
    });
  }

  /**
   * Obtenir la classe CSS pour le statut de l'examen
   */
  getStatutClass(examen: ExamenBiologiqueResponse): string {
    return this.hasAnomalies(examen) ? 'status-anomalie' : 'status-normal';
  }

  /**
   * Obtenir l'icône pour le statut de l'examen
   */
  getStatutIcon(examen: ExamenBiologiqueResponse): string {
    return this.hasAnomalies(examen) ? 'warning' : 'check_circle';
  }

  /**
   * Obtenir le texte du statut
   */
  getStatutText(examen: ExamenBiologiqueResponse): string {
    return this.hasAnomalies(examen) ? 'Anomalies détectées' : 'Normal';
  }

  /**
   * Formater les actes biologiques pour l'affichage
   */
  formatActesBiologiques(examen: ExamenBiologiqueResponse): string {
    if (!examen.actesBiologiques || examen.actesBiologiques.length === 0) {
      return 'Aucun acte';
    }

    const actesAvecValeurs = examen.actesBiologiques.filter(acte => acte.valeur && acte.valeur.trim() !== '');
    
    if (actesAvecValeurs.length === 0) {
      return 'Aucune valeur renseignée';
    }

    if (actesAvecValeurs.length <= 3) {
      return actesAvecValeurs.map(acte => `${acte.nom}: ${acte.valeur} ${acte.unite || ''}`).join(' • ');
    }

    return `${actesAvecValeurs.length} acte(s) renseigné(s)`;
  }

  /**
   * Obtenir les actes avec anomalies
   */
  getActesAvecAnomalies(examen: ExamenBiologiqueResponse): ActeBiologiqueResponse[] {
    return examen.actesBiologiques.filter(acte => {
      const valeurNumerique = parseFloat(acte.valeur);
      
      switch (acte.nom.toLowerCase()) {
        case 'hémoglobine':
          return valeurNumerique < 11 || valeurNumerique > 16;
        case 'glycémie':
          return valeurNumerique < 0.7 || valeurNumerique > 1.26;
        case 'créatinine':
          return valeurNumerique > 12;
        case 'plaquettes':
          return valeurNumerique < 150 || valeurNumerique > 450;
        case 'albuminurie':
          return valeurNumerique > 30;
        case 'glucosurie':
          return valeurNumerique > 0;
        default:
          return acte.valeur.toLowerCase().includes('positif') || acte.valeur.toLowerCase().includes('+');
      }
    });
  }

  /**
   * Obtenir les actes critiques
   */
  getActesCritiques(examen: ExamenBiologiqueResponse): ActeBiologiqueResponse[] {
    return examen.actesBiologiques.filter(acte => {
      const valeurNumerique = parseFloat(acte.valeur);
      
      switch (acte.nom.toLowerCase()) {
        case 'hémoglobine':
          return valeurNumerique < 8;
        case 'glycémie':
          return valeurNumerique > 2.0;
        case 'créatinine':
          return valeurNumerique > 20;
        case 'plaquettes':
          return valeurNumerique < 50;
        case 'albuminurie':
          return valeurNumerique > 300;
        default:
          return false;
      }
    });
  }

  /**
   * Formater une date
   */
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Date non définie';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }
      
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      return 'Date invalide';
    }
  }

  /**
   * Actualiser la liste
   */
  onRefresh(): void {
    this.loadExamens();
  }

  /**
   * Fonction de tracking pour la performance
   */
  trackByExamenId(index: number, examen: ExamenBiologiqueResponse): string {
    return examen.id;
  }
} 