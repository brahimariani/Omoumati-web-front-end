import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ComplicationResponse } from '../../../../core/models/complication/complication-response.model';
import { ComplicationFormComponent, ComplicationContextData } from '../complication-form/complication-form.component';
import { ComplicationsActions, selectComplicationsLoading, selectComplicationsError } from '../../../../store/complications';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SidePanelService } from '../../../../core/services/side-panel.service';

@Component({
  selector: 'app-complication-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './complication-list.component.html',
  styleUrl: './complication-list.component.css'
})
export class ComplicationListComponent implements OnInit, OnDestroy {
  @Input() complications: ComplicationResponse[] = [];
  @Input() contextData?: ComplicationContextData;
  @Input() title = 'Complications';
  @Input() canAdd = true;
  @Input() canEdit = true;
  @Input() canDelete = true;
  @Output() complicationAdded = new EventEmitter<ComplicationResponse>();
  @Output() complicationUpdated = new EventEmitter<ComplicationResponse>();
  @Output() complicationDeleted = new EventEmitter<string>();

  loading$ = this.store.select(selectComplicationsLoading);
  error$ = this.store.select(selectComplicationsError);

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    // Pas besoin de charger les données ici car elles sont passées en Input
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Ouvre le side panel pour ajouter une nouvelle complication
   */
  openAddForm(): void {
    const panelData = {
      contextData: this.contextData,
      isEdit: false
    };

    this.sidePanelService.open({
      title: this.getAddComplicationTitle(),
      component: ComplicationFormComponent,
      data: panelData,
      width: '700px'
    });
  }

  /**
   * Ouvre le side panel pour modifier une complication
   */
  openEditForm(complication: ComplicationResponse): void {
    const panelData = {
      complication: complication,
      contextData: this.contextData,
      isEdit: true
    };

    this.sidePanelService.open({
      title: this.getEditComplicationTitle(),
      component: ComplicationFormComponent,
      data: panelData,
      width: '700px'
    });
  }

  /**
   * Supprime une complication
   */
  deleteComplication(complication: ComplicationResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer cette complication "${complication.nature}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(ComplicationsActions.deleteComplication({ id: complication.id }));
        this.complicationDeleted.emit(complication.id);
      }
    });
  }

  /**
   * Obtient la couleur du chip selon la nature de la complication
   */
  getNatureChipColor(nature: string): 'primary' | 'accent' | 'warn' {
    const urgentNatures = ['Hémorragie', 'Rupture utérine', 'Souffrance fœtale', 'Asphyxie néonatale'];
    const moderateNatures = ['Infection', 'Prééclampsie', 'Dystocie', 'Détresse respiratoire'];
    
    if (urgentNatures.includes(nature)) {
      return 'warn';
    } else if (moderateNatures.includes(nature)) {
      return 'accent';
    }
    return 'primary';
  }

  /**
   * Obtient l'icône selon le lieu de la complication
   */
  getLieuIcon(lieu: string): string {
    const iconMap: { [key: string]: string } = {
      'Salle de travail': 'local_hospital',
      'Bloc opératoire': 'medical_services',
      'Salle de réveil': 'bed',
      'Service de gynécologie': 'woman',
      'Service de néonatologie': 'child_care',
      'Domicile': 'home',
      'Transport': 'local_shipping',
      'Autre': 'place'
    };
    return iconMap[lieu] || 'place';
  }

  /**
   * Formate la date en français
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Tronque le texte si trop long
   */
  truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Vérifie s'il y a des complications
   */
  get hasComplications(): boolean {
    return this.complications && this.complications.length > 0;
  }

  /**
   * Obtient le message d'état vide selon le contexte
   */
  get emptyStateMessage(): string {
    if (!this.contextData) {
      return 'Aucune complication enregistrée';
    }
    
    switch (this.contextData.type) {
      case 'grossesse':
        return 'Aucune complication durant cette grossesse';
      case 'accouchement':
        return 'Aucune complication durant cet accouchement';
      case 'naissance':
        return 'Aucune complication pour cette naissance';
      default:
        return 'Aucune complication enregistrée';
    }
  }

  /**
   * Obtient le titre pour l'ajout de complication
   */
  private getAddComplicationTitle(): string {
    const context = this.getContextDisplayText();
    return `Ajouter une complication${context ? ` - ${context}` : ''}`;
  }

  /**
   * Obtient le titre pour la modification de complication
   */
  private getEditComplicationTitle(): string {
    const context = this.getContextDisplayText();
    return `Modifier une complication${context ? ` - ${context}` : ''}`;
  }

  /**
   * Obtient le texte d'affichage du contexte
   */
  private getContextDisplayText(): string {
    if (!this.contextData) return '';
    
    switch (this.contextData.type) {
      case 'grossesse':
        return 'Grossesse';
      case 'accouchement':
        return 'Accouchement';
      case 'naissance':
        return 'Naissance';
      default:
        return '';
    }
  }

  /**
   * Fonction de tracking pour optimiser le rendu
   */
  trackByComplicationId(index: number, complication: ComplicationResponse): string {
    return complication.id;
  }
} 