import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { loadExamensByConsultation, deleteExamen, selectExamen, evaluateSignesVitaux } from '../../../../store/examens-cliniques/examens-cliniques.actions';
import * as ExamensCliniquesSelectors from '../../../../store/examens-cliniques/examens-cliniques.selectors';
import { ExamenCliniqueResponse } from '../../../../core/models/examen_clinique/examen-clinique-response.model';
import { ExamenCliniqueFormComponent } from '../examen-clinique-form/examen-clinique-form.component';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-examen-clinique-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './examen-clinique-list.component.html',
  styleUrls: ['./examen-clinique-list.component.css']
})
export class ExamenCliniqueListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() consultationId!: string;
  @Input() patienteName?: string;
  @Output() examenSelected = new EventEmitter<ExamenCliniqueResponse>();

  // Observables depuis le store
  examens$: Observable<ExamenCliniqueResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.examens$ = this.store.select(ExamensCliniquesSelectors.selectExamensByConsultation);
    this.loading$ = this.store.select(ExamensCliniquesSelectors.selectExamensLoading);
    this.error$ = this.store.select(ExamensCliniquesSelectors.selectExamensError);
  }

  ngOnInit(): void {
    if (this.consultationId) {
      this.loadExamens();
    }

    // Gestion des erreurs
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.notificationService.error(error, 'Erreur');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationId'] && changes['consultationId'].currentValue) {
      this.loadExamens();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les examens cliniques pour cette consultation
   */
  loadExamens(): void {
    this.store.dispatch(loadExamensByConsultation({
      consultationId: this.consultationId
    }));
  }

  /**
   * Ajouter un nouvel examen clinique
   */
  onAddExamen(): void {
    // Créer un objet consultation minimal avec l'ID disponible
    const consultation = {
      id: this.consultationId,
      date: new Date(),
      observation: '',
      grossesseId: ''
    };

    this.sidePanelService.open({
      title: 'Nouvel examen clinique',
      component: ExamenCliniqueFormComponent,
      width: '900px',
      data: {
        consultation: consultation,
        patienteName: this.patienteName,
        isEdit: false
      }
    });
  }

  /**
   * Modifier un examen clinique existant
   */
  onEditExamen(examen: ExamenCliniqueResponse): void {

    const consultation = {
      id: this.consultationId,
      date: new Date(),
      observation: '',
      grossesseId: ''
    };
    this.sidePanelService.open({
      title: 'Modifier l\'examen clinique',
      component: ExamenCliniqueFormComponent,
      width: '900px',
      data: {
        examen: examen,
        consultation: consultation,
        patienteName: this.patienteName,
        isEdit: true
      }
    });
  }

  /**
   * Supprimer un examen clinique
   */
  onDeleteExamen(examen: ExamenCliniqueResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'examen clinique',
        message: 'Êtes-vous sûr de vouloir supprimer cet examen clinique ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteExamen({ id: examen.id }));
      }
    });
  }

  /**
   * Sélectionner un examen (pour affichage détaillé)
   */
  onSelectExamen(examen: ExamenCliniqueResponse): void {
    this.store.dispatch(selectExamen({ id: examen.id }));
    this.examenSelected.emit(examen);
  }

  /**
   * Évaluer les signes vitaux d'un examen
   */
  onEvaluateSignesVitaux(examen: ExamenCliniqueResponse): void {
    this.store.dispatch(evaluateSignesVitaux({
      examen: examen
    }));
  }

  /**
   * Calculer l'IMC d'un examen
   */
  calculateIMC(examen: ExamenCliniqueResponse): number {
    if (examen.poids && examen.taille && examen.taille > 0) {
      const tailleEnMetres = examen.taille / 100;
      return examen.poids / (tailleEnMetres * tailleEnMetres);
    }
    return 0;
  }

  /**
   * Obtenir la catégorie IMC
   */
  getIMCCategory(imc: number): string {
    if (imc < 18.5) return 'Maigreur';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Surpoids';
    return 'Obésité';
  }

  /**
   * Obtenir la classe CSS pour l'IMC
   */
  getIMCClass(imc: number): string {
    if (imc < 18.5) return 'imc-maigreur';
    if (imc < 25) return 'imc-normal';
    if (imc < 30) return 'imc-surpoids';
    return 'imc-obesite';
  }

  /**
   * Vérifier si un examen a des anomalies
   */
  hasAnomalies(examen: ExamenCliniqueResponse): boolean {
    // Vérifier les signes vitaux
    if (examen.tensionArterielle) {
      const [systolique, diastolique] = examen.tensionArterielle.split('/').map(Number);
      if (systolique >= 140 || diastolique >= 90 || systolique < 90 || diastolique < 60) {
        return true;
      }
    }
    
    if (examen.temperature >= 38 || examen.temperature < 36) {
      return true;
    }
    
    if (examen.frequenceCardiaque > 100 || examen.frequenceCardiaque < 60) {
      return true;
    }

    // Vérifier l'IMC
    const imc = this.calculateIMC(examen);
    if (imc < 18.5 || imc >= 30) {
      return true;
    }

    return false;
  }

  /**
   * Obtenir la classe CSS pour le statut de l'examen
   */
  getStatutClass(examen: ExamenCliniqueResponse): string {
    return this.hasAnomalies(examen) ? 'status-anomalie' : 'status-normal';
  }

  /**
   * Obtenir l'icône pour le statut de l'examen
   */
  getStatutIcon(examen: ExamenCliniqueResponse): string {
    return this.hasAnomalies(examen) ? 'warning' : 'check_circle';
  }

  /**
   * Obtenir le texte du statut
   */
  getStatutText(examen: ExamenCliniqueResponse): string {
    return this.hasAnomalies(examen) ? 'Anomalies détectées' : 'Normal';
  }

  /**
   * Formater une date
   */
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Date non définie';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Vérifier si la date est valide
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
   * Formater les signes vitaux pour l'affichage
   */
  formatSignesVitaux(examen: ExamenCliniqueResponse): string {
    const elements = [];
    
    if (examen.tensionArterielle) {
      elements.push(`TA: ${examen.tensionArterielle}`);
    }
    
    if (examen.temperature) {
      elements.push(`T°: ${examen.temperature}°C`);
    }
    
    if (examen.frequenceCardiaque) {
      elements.push(`FC: ${examen.frequenceCardiaque} bpm`);
    }
    
    return elements.length > 0 ? elements.join(' • ') : 'Aucune donnée';
  }

  /**
   * Formater les mesures physiques
   */
  formatMesuresPhysiques(examen: ExamenCliniqueResponse): string {
    const elements = [];
    
    if (examen.poids) {
      elements.push(`${examen.poids} kg`);
    }
    
    if (examen.taille) {
      elements.push(`${examen.taille} cm`);
    }
    
    return elements.length > 0 ? elements.join(' • ') : 'Aucune mesure';
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
  trackByExamenId(index: number, examen: ExamenCliniqueResponse): string {
    return examen.id;
  }
} 