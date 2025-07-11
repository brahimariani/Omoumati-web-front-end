import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';

import { VaccinResponseDto } from '../../../../core/models/vaccin/vaccin-response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { VaccinsActions } from '../../../../store/vaccins/vaccins.actions';
import { 
  selectVaccinsByPatient, 
  selectVaccinsByNaissance, 
  selectVaccinsLoading, 
  selectVaccinsError 
} from '../../../../store/vaccins/vaccins.selectors';
import { VaccinFormSidePanelComponent } from '../vaccin-form-side-panel/vaccin-form-side-panel.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SidePanelService } from '../../../../core/services/side-panel.service';

export enum VaccinMode {
  PATIENTE = 'patiente',
  NAISSANCE = 'naissance'
}

@Component({
  selector: 'app-vaccins-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './vaccins-list.component.html',
  styleUrls: ['./vaccins-list.component.css']
})
export class VaccinsListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() patient?: PatienteResponse;
  @Input() mode: VaccinMode = VaccinMode.PATIENTE; // Mode par défaut: PATIENTE
  @Input() naissanceId?: string; // Requis seulement si mode = NAISSANCE

  // Observables pour la gestion d'état
  vaccins$!: Observable<VaccinResponseDto[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  private destroy$ = new Subject<void>();

  // Enum pour l'utilisation dans le template
  VaccinMode = VaccinMode;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sidePanelService: SidePanelService,
    private actions$: Actions
  ) {
    this.loading$ = this.store.select(selectVaccinsLoading);
    this.error$ = this.store.select(selectVaccinsError);
  }

  ngOnInit(): void {
    this.initializeVaccinsObservable();
    this.loadVaccins();
    this.setupErrorHandling();
    this.setupSuccessReload();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Réinitialiser l'observable si le mode ou le naissanceId change
    if (changes['mode'] || changes['naissanceId']) {
      this.initializeVaccinsObservable();
      this.loadVaccins();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser l'observable vaccins selon le mode
   */
  private initializeVaccinsObservable(): void {
    if (this.mode === VaccinMode.NAISSANCE) {
      this.vaccins$ = this.store.select(selectVaccinsByNaissance);
    } else {
      // Mode PATIENTE - filtrer pour exclure les vaccins de naissance
      this.vaccins$ = this.store.select(selectVaccinsByPatient);
    }
  }

  /**
   * Charger les vaccins selon le mode
   */
  loadVaccins(): void {
    if (this.mode === VaccinMode.NAISSANCE && this.naissanceId) {
      this.store.dispatch(VaccinsActions.loadVaccinsByNaissance({ 
        naissanceId: this.naissanceId 
      }));
    } else if (this.mode === VaccinMode.PATIENTE && this.patient?.id) {
      this.store.dispatch(VaccinsActions.loadVaccinsByPatient({ 
        patientId: this.patient.id 
      }));
    }
  }

  /**
   * Configurer la gestion des erreurs
   */
  private setupErrorHandling(): void {
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        this.showErrorMessage(`Erreur: ${error}`);
      }
    });
  }

  /**
   * Configurer le rechargement automatique après succès
   */
  private setupSuccessReload(): void {
    // Écouter les succès de création/modification pour recharger
    this.actions$.pipe(
      ofType(VaccinsActions.createVaccinSuccess, VaccinsActions.updateVaccinSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Petit délai pour laisser le temps au panel de se fermer
      setTimeout(() => {
        this.loadVaccins();
      }, 300);
    });
  }

  /**
   * Ouvrir le side panel pour ajouter un vaccin
   */
  addVaccin(): void {
    const panelData = {
      patient: this.patient,
      naissanceId: this.mode === VaccinMode.NAISSANCE ? this.naissanceId : null,
      vaccinMode: this.mode,
      isEdit: false
    };

    this.sidePanelService.open({
      title: this.getAddVaccinTitle(),
      component: VaccinFormSidePanelComponent,
      data: panelData,
      width: '700px'
    });

    // Le rechargement se fera automatiquement via le component side panel
    // qui émet onClose avec success=true
  }

  /**
   * Ouvrir le side panel pour modifier un vaccin
   */
  editVaccin(vaccin: VaccinResponseDto): void {
    if (!vaccin?.id) {
      this.showErrorMessage('Impossible de modifier ce vaccin');
      return;
    }

    const panelData = {
      patient: this.patient,
      vaccin: vaccin,
      naissanceId: vaccin.naissanceId,
      vaccinMode: this.mode,
      isEdit: true
    };

    this.sidePanelService.open({
      title: this.getEditVaccinTitle(),
      component: VaccinFormSidePanelComponent,
      data: panelData,
      width: '700px'
    });

    // Le rechargement se fera automatiquement via le component side panel
    // qui émet onClose avec success=true
  }

  /**
   * Supprimer un vaccin avec confirmation
   */
  deleteVaccin(vaccin: VaccinResponseDto): void {
    if (!vaccin?.id) {
      this.showErrorMessage('Impossible de supprimer ce vaccin');
      return;
    }

    const modeText = this.getModeDisplayText();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le vaccin ${modeText} "${vaccin.nom}" administré le ${this.formatDate(vaccin.date)} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(VaccinsActions.deleteVaccin({ id: vaccin.id }));
        this.showSuccessMessage(`Vaccin ${modeText} supprimé avec succès`);
      }
    });
  }

  /**
   * Obtenir le nombre de vaccins
   */
  getVaccinsCount(): Observable<number> {
    return this.vaccins$.pipe(map(vaccins => vaccins.length));
  }

  /**
   * Obtenir l'icône selon le mode
   */
  getModeIcon(): string {
    return this.mode === VaccinMode.NAISSANCE ? 'child_care' : 'person';
  }

  /**
   * Obtenir la couleur selon le mode
   */
  getModeColor(): string {
    return this.mode === VaccinMode.NAISSANCE ? 'accent' : 'primary';
  }

  /**
   * Obtenir le texte d'affichage du mode
   */
  getModeDisplayText(): string {
    return this.mode === VaccinMode.NAISSANCE ? 'de naissance' : 'de patiente';
  }

  /**
   * Obtenir le titre de la section
   */
  getSectionTitle(): string {
    return this.mode === VaccinMode.NAISSANCE ? 'Vaccins de Naissance' : 'Vaccins de Patiente';
  }

  /**
   * Vérifier si l'ajout de vaccin est possible
   */
  canAddVaccin(): boolean {
    if (this.mode === VaccinMode.NAISSANCE) {
      return !!this.naissanceId; // Besoin du naissanceId pour les vaccins de naissance
    } else {
      return !!this.patient?.id; // Besoin du patient pour les vaccins de patiente
    }
  }

  /**
   * Formater une date au format français
   */
  formatDate(date: Date | string): string {
    if (!date) return 'Date non disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  }

  /**
   * Fonction de tracking pour optimiser le rendu de la liste
   */
  trackVaccin(index: number, vaccin: VaccinResponseDto): string {
    return vaccin.id || index.toString();
  }

  /**
   * Afficher un message de succès
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Afficher un message d'erreur
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Obtenir le titre pour l'ajout de vaccin
   */
  private getAddVaccinTitle(): string {
    const type = this.mode === VaccinMode.NAISSANCE ? 'de naissance' : 'de patiente';
    return `Ajouter un vaccin ${type}`;
  }

  /**
   * Obtenir le titre pour la modification de vaccin
   */
  private getEditVaccinTitle(): string {
    const type = this.mode === VaccinMode.NAISSANCE ? 'de naissance' : 'de patiente';
    return `Modifier un vaccin ${type}`;
  }
} 