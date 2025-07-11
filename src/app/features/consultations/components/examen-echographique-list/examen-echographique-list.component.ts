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
import { MatDividerModule } from '@angular/material/divider';

import { ExamenEchographiqueResponse } from '../../../../core/models/examen_echographique/examen-echographique-response.model';
import { ImageEchographiqueResponse } from '../../../../core/models/examen_echographique/image_echographique/image-echographique-response.model';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExamenEchographiqueService } from '../../../../core/services/examen-echographique.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ImageViewerService } from '../../../../shared/services/image-viewer.service';

import * as ExamensEchographiquesActions from '../../../../store/examens-echographiques/examens-echographiques.actions';
import * as ExamensEchographiquesSelectors from '../../../../store/examens-echographiques/examens-echographiques.selectors';

import { ExamenEchographiqueFormComponent } from '../examen-echographique-form/examen-echographique-form.component';

@Component({
  selector: 'app-examen-echographique-list',
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
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './examen-echographique-list.component.html',
  styleUrl: './examen-echographique-list.component.css'
})
export class ExamenEchographiqueListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() consultationId!: string;
  @Input() patienteName?: string;
  @Output() examenSelected = new EventEmitter<ExamenEchographiqueResponse>();

  // Observables du store
  examens$: Observable<ExamenEchographiqueResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService,
    private examenEchographiqueService: ExamenEchographiqueService,
    private dialog: MatDialog,
    private imageViewerService: ImageViewerService
  ) {
    // Initialisation des observables
    this.examens$ = this.store.select(ExamensEchographiquesSelectors.selectExamensByConsultation(this.consultationId));
    this.loading$ = this.store.select(ExamensEchographiquesSelectors.selectExamensEchographiquesLoading);
    this.error$ = this.store.select(ExamensEchographiquesSelectors.selectExamensEchographiquesError);
  }

  ngOnInit(): void {
    // Charger les examens pour cette consultation
    this.loadExamens();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationId'] && this.consultationId) {
      // Mettre à jour l'observable quand consultationId change
      this.examens$ = this.store.select(ExamensEchographiquesSelectors.selectExamensByConsultation(this.consultationId));
      this.loadExamens();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les examens échographiques pour la consultation
   */
  private loadExamens(): void {
    if (this.consultationId) {
      this.store.dispatch(ExamensEchographiquesActions.loadExamensByConsultation({ 
        consultationId: this.consultationId 
      }));
    }
  }

  /**
   * Ajouter un nouvel examen échographique
   */
  onAddExamen(): void {
    this.sidePanelService.open({
      title: 'Nouvel examen échographique',
      component: ExamenEchographiqueFormComponent,
      width: '1000px',
      data: {
        consultation: {
          id: this.consultationId
        },
        patienteName: this.patienteName,
        isEdit: false
      }
    });
  }

  /**
   * Modifier un examen échographique
   */
  onEditExamen(examen: ExamenEchographiqueResponse): void {
    this.sidePanelService.open({
      title: 'Modifier l\'examen échographique',
      component: ExamenEchographiqueFormComponent,
      width: '1000px',
      data: {
        examen: examen,
        consultation: {
          id: this.consultationId
        },
        patienteName: this.patienteName,
        isEdit: true
      }
    });
  }

  /**
   * Supprimer un examen échographique
   */
  onDeleteExamen(examen: ExamenEchographiqueResponse): void {
    const dialogData: ConfirmDialogData = {
      title: 'Supprimer l\'examen échographique',
      message: `Êtes-vous sûr de vouloir supprimer cet examen échographique ? Cette action est irréversible.`,
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
        this.store.dispatch(ExamensEchographiquesActions.deleteExamenEchographique({ id: examen.id }));
        
        // Rafraîchir la liste après suppression
        setTimeout(() => {
          this.store.dispatch(ExamensEchographiquesActions.loadExamensByConsultation({
            consultationId: this.consultationId
          }));
        }, 500);
      }
    });
  }

  /**
   * Sélectionner un examen (pour affichage détaillé)
   */
  onSelectExamen(examen: ExamenEchographiqueResponse): void {
    this.store.dispatch(ExamensEchographiquesActions.selectExamen({ id: examen.id }));
    this.examenSelected.emit(examen);
  }

  /**
   * Voir les images d'un examen
   */
  onViewImages(examen: ExamenEchographiqueResponse): void {
    if (examen.images && examen.images.length > 0) {
      this.imageViewerService.openImageViewer({
        images: examen.images,
        selectedIndex: 0,
        title: `Images - Examen du ${this.formatDate(examen.id)}`,
        allowDownload: true,
        allowFullscreen: true
      });
    } else {
      this.notificationService.info('Aucune image disponible pour cet examen');
    }
  }

  /**
   * Analyser les mesures d'un examen
   */
  analyserMesures(examen: ExamenEchographiqueResponse): void {
    this.store.dispatch(ExamensEchographiquesActions.analyserMesuresEchographiques({ examen }));
  }

  

  /**
   * Vérifier si un examen a des anomalies
   */
  hasAnomalies(examen: ExamenEchographiqueResponse): boolean {
    // Vérifications basiques selon les mesures
    const anomalies = [
      // Nombre d'embryons anormal
      examen.nbEmbryons === 0 || examen.nbEmbryons > 2,
      
      // Clarté nucale élevée (> 3mm)
      examen.cn && parseFloat(examen.cn) > 3,
      
      // Placenta praevia
      examen.placenta && examen.placenta.toLowerCase().includes('praevia'),
      
      // Oligoamnios ou polyhydramnios
      examen.liquideAmniotique && 
      (examen.liquideAmniotique.toLowerCase().includes('oligo') || 
       examen.liquideAmniotique.toLowerCase().includes('poly'))
    ];

    return anomalies.some(anomalie => anomalie === true);
  }

  /**
   * Obtenir la classe CSS pour le statut de l'examen
   */
  getStatutClass(examen: ExamenEchographiqueResponse): string {
    if (this.hasAnomalies(examen)) {
      return 'statut-anomalie';
    }
    
    // Vérifier si l'examen est complet
    const mesuresCompletes = this.getNombreMesures(examen) >= 3;
    const hasImages = examen.images && examen.images.length > 0;
    
    if (mesuresCompletes && hasImages) {
      return 'statut-complet';
    } else if (mesuresCompletes || hasImages) {
      return 'statut-partiel';
    }
    
    return 'statut-minimal';
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatutIcon(examen: ExamenEchographiqueResponse): string {
    const statutClass = this.getStatutClass(examen);
    
    switch (statutClass) {
      case 'statut-anomalie': return 'warning';
      case 'statut-complet': return 'check_circle';
      case 'statut-partiel': return 'info';
      default: return 'radio_button_unchecked';
    }
  }

  /**
   * Obtenir le texte du statut
   */
  getStatutText(examen: ExamenEchographiqueResponse): string {
    const statutClass = this.getStatutClass(examen);
    
    switch (statutClass) {
      case 'statut-anomalie': return 'Anomalies détectées';
      case 'statut-complet': return 'Examen complet';
      case 'statut-partiel': return 'Examen partiel';
      default: return 'Données minimales';
    }
  }

  /**
   * Obtenir le nombre de mesures renseignées
   */
  getNombreMesures(examen: ExamenEchographiqueResponse): number {
    let count = 0;
    
    if (examen.lcc && examen.lcc.trim()) count++;
    if (examen.cn && examen.cn.trim()) count++;
    if (examen.bip && examen.bip.trim()) count++;
    if (examen.dat && examen.dat.trim()) count++;
    if (examen.longueurFemoral > 0) count++;
    if (examen.placenta && examen.placenta.trim()) count++;
    if (examen.liquideAmniotique && examen.liquideAmniotique.trim()) count++;
    
    return count;
  }

  /**
   * Formater les mesures principales
   */
  formatMesuresPrincipales(examen: ExamenEchographiqueResponse): string {
    const mesures = [];
    
    if (examen.lcc && examen.lcc.trim()) {
      mesures.push(`LCC: ${examen.lcc}`);
    }
    if (examen.cn && examen.cn.trim()) {
      mesures.push(`CN: ${examen.cn}`);
    }
    if (examen.bip && examen.bip.trim()) {
      mesures.push(`BIP: ${examen.bip}`);
    }
    if (examen.dat && examen.dat.trim()) {
      mesures.push(`DAT: ${examen.dat}`);
    }
    
    return mesures.length > 0 ? mesures.join(' • ') : 'Aucune mesure';
  }

  /**
   * Obtenir les mesures avec anomalies
   */
  getMesuresAvecAnomalies(examen: ExamenEchographiqueResponse): string[] {
    const anomalies = [];
    
    if (examen.nbEmbryons === 0) {
      anomalies.push('Aucun embryon détecté');
    } else if (examen.nbEmbryons > 2) {
      anomalies.push('Grossesse multiple');
    }
    
    if (examen.cn && parseFloat(examen.cn) > 3) {
      anomalies.push('Clarté nucale élevée');
    }
    
    if (examen.placenta && examen.placenta.toLowerCase().includes('praevia')) {
      anomalies.push('Placenta praevia');
    }
    
    if (examen.liquideAmniotique) {
      if (examen.liquideAmniotique.toLowerCase().includes('oligo')) {
        anomalies.push('Oligoamnios');
      } else if (examen.liquideAmniotique.toLowerCase().includes('poly')) {
        anomalies.push('Polyhydramnios');
      }
    }
    
    return anomalies;
  }

  /**
   * Formater une date
   */
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Date inconnue';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  /**
   * Rafraîchir la liste
   */
  onRefresh(): void {
    this.loadExamens();
  }

  /**
   * Fonction de suivi pour la liste
   */
  trackByExamenId(index: number, examen: ExamenEchographiqueResponse): string {
    return examen.id;
  }
}
