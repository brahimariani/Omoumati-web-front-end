import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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

import { loadTraitementsByConsultation, loadTraitementStats, deleteTraitement, selectTraitement } from '../../../../store/traitements/traitements.actions';
import * as TraitementsSelectors from '../../../../store/traitements/traitements.selectors';
import { TraitementResponse } from '../../../../core/models/traitement/traitement-response.model';
import { TraitementFormComponent } from '../traitement-form/traitement-form.component';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-traitement-list',
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
  templateUrl: './traitement-list.component.html',
  styleUrls: ['./traitement-list.component.css']
})
export class TraitementListComponent implements OnInit, OnDestroy {
  @Input() consultationId!: string;
  @Input() patienteName?: string;
  @Output() traitementSelected = new EventEmitter<TraitementResponse>();

  // Observables depuis le store
  traitements$: Observable<TraitementResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  stats$: Observable<any>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.traitements$ = this.store.select(TraitementsSelectors.selectTraitementsByConsultation);
    this.loading$ = this.store.select(TraitementsSelectors.selectTraitementsLoading);
    this.error$ = this.store.select(TraitementsSelectors.selectTraitementsError);
    this.stats$ = this.store.select(TraitementsSelectors.selectTraitementsStats);
  }

  ngOnInit(): void {
    if (this.consultationId) {
      this.loadTraitements();
      this.loadStats();
    }

    // Gestion des erreurs
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.notificationService.error(error, 'Erreur');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les traitements pour cette consultation
   */
  loadTraitements(): void {
    this.store.dispatch(loadTraitementsByConsultation({
      consultationId: this.consultationId
    }));
  }

  /**
   * Charger les statistiques des traitements
   */
  loadStats(): void {
    this.store.dispatch(loadTraitementStats({
      consultationId: this.consultationId
    }));
  }

  /**
   * Ajouter un nouveau traitement
   */
  onAddTraitement(): void {
    // Créer un objet consultation minimal avec l'ID disponible
    const consultation = {
      id: this.consultationId,
      date: new Date(),
      observation: '',
      grossesseId: ''
    };

    this.sidePanelService.open({
      title: 'Nouveau traitement',
      component: TraitementFormComponent,
      width: '800px',
      data: {
        consultation: consultation,
        patienteName: this.patienteName,
        isEdit: false
      }
    });
  }

  /**
   * Modifier un traitement existant
   */
  onEditTraitement(traitement: TraitementResponse): void {
    this.sidePanelService.open({
      title: 'Modifier le traitement',
      component: TraitementFormComponent,
      width: '800px',
      data: {
        traitement: traitement,
        consultation: traitement.consultation,
        patienteName: this.patienteName,
        isEdit: true
      }
    });
  }

  /**
   * Supprimer un traitement
   */
  onDeleteTraitement(traitement: TraitementResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer le traitement',
        message: 'Êtes-vous sûr de vouloir supprimer ce traitement ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteTraitement({ id: traitement.id }));
      }
    });
  }

  /**
   * Sélectionner un traitement (pour affichage détaillé)
   */
  onSelectTraitement(traitement: TraitementResponse): void {
    this.store.dispatch(selectTraitement({ id: traitement.id }));
    this.traitementSelected.emit(traitement);
  }

  /**
   * Vérifier si un traitement est actif
   */
  isTraitementActif(traitement: TraitementResponse): boolean {
    const today = new Date();
    const dateFin = new Date(traitement.dateFin);
    return dateFin >= today;
  }

  /**
   * Obtenir la classe CSS pour le statut du traitement
   */
  getStatutClass(traitement: TraitementResponse): string {
    return this.isTraitementActif(traitement) ? 'status-actif' : 'status-termine';
  }

  /**
   * Obtenir l'icône pour le statut du traitement
   */
  getStatutIcon(traitement: TraitementResponse): string {
    return this.isTraitementActif(traitement) ? 'play_circle' : 'stop_circle';
  }

  /**
   * Obtenir le texte du statut
   */
  getStatutText(traitement: TraitementResponse): string {
    return this.isTraitementActif(traitement) ? 'En cours' : 'Terminé';
  }

  /**
   * Formater une date
   */
  formatDate(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  /**
   * Calculer la durée du traitement
   */
  calculateDuree(traitement: TraitementResponse): string {
    const dateDebut = new Date(traitement.dateDebut);
    const dateFin = new Date(traitement.dateFin);
    const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 jour';
    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} mois`;
    return `${Math.round(diffDays / 365)} an(s)`;
  }

  /**
   * Rafraîchir les données
   */
  onRefresh(): void {
    this.loadTraitements();
    this.loadStats();
  }

  /**
   * TrackBy function pour optimiser le rendu de la liste
   */
  trackByTraitementId(index: number, traitement: TraitementResponse): string {
    return traitement.id;
  }
} 