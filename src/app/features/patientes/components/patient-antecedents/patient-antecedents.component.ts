import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AntecedentService } from '../../../../core/services/antecedent.service';
import { AntecedentResponse } from '../../../../core/models/antecedent/antecedent.response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { NATURES, TYPES_FEMME, TYPES_HEREDITAIRE, TYPES_OBSTETRICAL } from '../../../../core/models/antecedent/antecedent.request.model';
import { AntecedentFormDialogComponent } from '../antecedent-form-dialog/antecedent-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SidePanelService } from '../../../../core/services/side-panel.service';

@Component({
  selector: 'app-patient-antecedents',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-antecedents.component.html',
  styleUrls: ['./patient-antecedents.component.css']
})
export class PatientAntecedentsComponent implements OnInit, OnDestroy {
  @Input() patient!: PatienteResponse;

  antecedents: AntecedentResponse[] = [];
  antecedentsFemme: AntecedentResponse[] = [];
  antecedentsHereditaire: AntecedentResponse[] = [];
  antecedentsObstetrical: AntecedentResponse[] = [];
  
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  // Constantes pour les suggestions
  readonly NATURES = NATURES;
  readonly TYPES_FEMME = TYPES_FEMME;
  readonly TYPES_HEREDITAIRE = TYPES_HEREDITAIRE;
  readonly TYPES_OBSTETRICAL = TYPES_OBSTETRICAL;

  constructor(
    private antecedentService: AntecedentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    this.loadAntecedents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger tous les antécédents de la patiente
   */
  loadAntecedents(): void {
    if (!this.patient?.id) return;

    this.loading = true;
    this.error = null;

    this.antecedentService.getAntecedentsByPatiente(this.patient.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (antecedents) => {
          this.antecedents = antecedents;
          this.categorizeAntecedents();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des antécédents';
          this.loading = false;
          this.showErrorMessage('Erreur lors du chargement des antécédents');
        }
      });
  }

  /**
   * Catégoriser les antécédents par nature
   */
  private categorizeAntecedents(): void {
    this.antecedentsFemme = this.antecedents.filter(a => a.nature === 'Femme');
    this.antecedentsHereditaire = this.antecedents.filter(a => a.nature === 'Héréditaire');
    this.antecedentsObstetrical = this.antecedents.filter(a => a.nature === 'Obstetrical');
  }

  /**
   * Ouvrir le side panel pour ajouter un antécédent
   */
  addAntecedent(nature?: string): void {
    this.sidePanelService.open({
      title: nature ? `Nouvel antécédent ${nature.toLowerCase()}` : 'Nouvel antécédent',
      component: AntecedentFormDialogComponent,
      width: '700px',
      data: {
        patient: this.patient,
        nature: nature,
        isEdit: false,
        onCloseCallback: (success: boolean) => {
          if (success) {
            this.loadAntecedents();
            this.showSuccessMessage('Antécédent ajouté avec succès');
          }
        }
      }
    });
  }

  /**
   * Ouvrir le side panel pour modifier un antécédent
   */
  editAntecedent(antecedent: AntecedentResponse): void {
    this.sidePanelService.open({
      title: 'Modifier l\'antécédent',
      component: AntecedentFormDialogComponent,
      width: '700px',
      data: {
        patient: this.patient,
        antecedent: antecedent,
        isEdit: true,
        onCloseCallback: (success: boolean) => {
          if (success) {
            this.loadAntecedents();
            this.showSuccessMessage('Antécédent modifié avec succès');
          }
        }
      }
    });
  }

  /**
   * Supprimer un antécédent
   */
  deleteAntecedent(antecedent: AntecedentResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer cet antécédent de type "${antecedent.type}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.antecedentService.deleteAntecedent(antecedent.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadAntecedents();
              this.showSuccessMessage('Antécédent supprimé avec succès');
            },
            error: () => {
              this.showErrorMessage('Erreur lors de la suppression de l\'antécédent');
            }
          });
      }
    });
  }

  /**
   * Obtenir l'icône pour un type d'antécédent
   */
  getAntecedentIcon(nature: string): string {
    switch (nature) {
      case 'Femme': return 'person';
      case 'Héréditaire': return 'family_restroom';
      case 'Obstetrical': return 'pregnant_woman';
      default: return 'medical_services';
    }
  }

  /**
   * Obtenir la couleur pour un type d'antécédent
   */
  getAntecedentColor(nature: string): string {
    switch (nature) {
      case 'Femme': return 'primary';
      case 'Héréditaire': return 'accent';
      case 'Obstetrical': return 'warn';
      default: return 'primary';
    }
  }

  /**
   * Formater la date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Afficher un message de succès
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Afficher un message d'erreur
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
} 