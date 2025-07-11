import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { NaissanceResponse } from '../../../../core/models/naissance/naissance-response.model';
import { VaccinResponseDto } from '../../../../core/models/vaccin/vaccin-response.model';
import { ComplicationResponse } from '../../../../core/models/complication/complication-response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';

// Import des composants vaccins
import { VaccinsListComponent } from '../../../vaccins/components/vaccins-list/vaccins-list.component';
import { VaccinMode } from '../../../vaccins/components/vaccins-list/vaccins-list.component';

// Import des composants complications
import { ComplicationListComponent } from '../../../complications/components/complication-list/complication-list.component';
import { ComplicationContextData } from '../../../complications/components/complication-form/complication-form.component';

// Import des actions et sélecteurs
import { VaccinsActions, selectVaccinsByNaissance } from '../../../../store/vaccins';
import { ComplicationsActions, selectComplicationsByNaissance } from '../../../../store/complications';
import { NaissanceFormDialogComponent, NaissanceDialogData } from '../naissance-form-dialog/naissance-form-dialog.component';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';

// Interface pour les alertes médicales
interface MedicalAlert {
  type: 'info' | 'warning' | 'error';
  icon: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-naissance-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatMenuModule,
    VaccinsListComponent,
    ComplicationListComponent
  ],
  templateUrl: './naissance-details.component.html',
  styleUrls: ['./naissance-details.component.css']
})
export class NaissanceDetailsComponent implements OnInit, OnDestroy {
  @Input() naissance!: NaissanceResponse;
  @Input() accouchement!: AccouchementResponse;
  @Input() showActions: boolean = true;

  // Observables pour les données associées
  complications$: Observable<ComplicationResponse[]>;
  complicationContextData$: Observable<ComplicationContextData | null>;

  // Variables pour les alertes et métriques
  medicalAlerts: MedicalAlert[] = [];
  VaccinMode = VaccinMode;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Configuration des observables - Remove vaccins$ because it's handled by vaccins-list component
    this.complications$ = this.store.select(selectComplicationsByNaissance);
    
    // Contexte pour les complications
    this.complicationContextData$ = this.complications$.pipe(
      map((complications) => this.naissance ? {
        type: 'naissance' as const,
        naissance: this.naissance,
      } : null)
    );
  }

  ngOnInit(): void {
    if (this.naissance?.id) {
      this.loadAssociatedData();
      this.evaluateMedicalStatus();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les données associées (complications seulement - vaccins gérés par vaccins-list)
   */
  private loadAssociatedData(): void {
    if (!this.naissance?.id) return;
    // Charger les complications de naissance
    this.store.dispatch(ComplicationsActions.loadComplicationsByNaissance({ 
      naissanceId: this.naissance.id 
    }));

    this.store.dispatch(VaccinsActions.loadVaccinsByNaissance({ 
      naissanceId: this.naissance.id 
    }));
  }

  /**
   * Évaluer le statut médical et générer des alertes
   */
  private evaluateMedicalStatus(): void {
    this.medicalAlerts = [];

    if (!this.naissance) return;

    // Alerte si décès
    if (!this.naissance.estVivant) {
      this.medicalAlerts.push({
        type: 'error',
        icon: 'dangerous',
        title: 'Décès néonatal',
        message: 'L\'enfant est décédé à la naissance. Suivi spécialisé requis.'
      });
    }

    // Évaluation du poids
    if (this.naissance.poids < 2500) {
      this.medicalAlerts.push({
        type: 'warning',
        icon: 'warning',
        title: 'Faible poids de naissance',
        message: `Poids de ${this.naissance.poids}g inférieur à la normale (< 2500g). Surveillance nutritionnelle renforcée.`
      });
    } else if (this.naissance.poids > 4000) {
      this.medicalAlerts.push({
        type: 'warning',
        icon: 'warning',
        title: 'Macrosomie fœtale',
        message: `Poids de ${this.naissance.poids}g supérieur à la normale (> 4000g). Surveillance glycémique recommandée.`
      });
    }

    // Évaluation du périmètre crânien
    if (this.naissance.perimetreCranien < 32) {
      this.medicalAlerts.push({
        type: 'warning',
        icon: 'psychology',
        title: 'Microcéphalie possible',
        message: `Périmètre crânien de ${this.naissance.perimetreCranien}cm inférieur à la normale. Consultation neurologique requise.`
      });
    } else if (this.naissance.perimetreCranien > 37) {
      this.medicalAlerts.push({
        type: 'warning',
        icon: 'psychology',
        title: 'Macrocéphalie possible',
        message: `Périmètre crânien de ${this.naissance.perimetreCranien}cm supérieur à la normale. Surveillance neurologique recommandée.`
      });
    }
  }

  /**
   * Actions pour la naissance
   */
  onEditNaissance(): void {
    if (!this.naissance ) return;

    const dialogData: NaissanceDialogData = {
      accouchement: { id: 'temp' } as any, // Type temporaire - il faudra récupérer l'accouchement complet
      naissance: this.naissance,
      isEdit: true
    };

    const dialogRef = this.dialog.open(NaissanceFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccessMessage('Naissance modifiée avec succès');
        this.evaluateMedicalStatus();
      }
    });
  }

  onViewFullNaissance(): void {
    if (this.naissance?.id) {
      this.router.navigate(['/naissances', this.naissance.id]);
    }
  }

  /**
   * Gestionnaires d'événements pour les complications
   */
  onComplicationAdded(complication: ComplicationResponse): void {
    console.log('Complication ajoutée:', complication);
    this.showSuccessMessage('Complication ajoutée avec succès');
  }

  onComplicationUpdated(complication: ComplicationResponse): void {
    console.log('Complication mise à jour:', complication);
    this.showSuccessMessage('Complication mise à jour avec succès');
  }

  onComplicationDeleted(complicationId: string): void {
    console.log('Complication supprimée:', complicationId);
    this.showSuccessMessage('Complication supprimée avec succès');
  }

  /**
   * Méthodes utilitaires pour l'affichage
   */
  formatDate(date: string | Date): string {
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

  getNaissanceStatusColor(): 'primary' | 'warn' {
    return this.naissance?.estVivant ? 'primary' : 'warn';
  }

  getNaissanceStatusLabel(): string {
    return this.naissance?.estVivant ? 'Vivant' : 'Décédé';
  }

  getSexeIcon(): string {
    if (!this.naissance?.sexe) return 'help';
    return this.naissance.sexe === 'M' ? 'male' : this.naissance.sexe === 'F' ? 'female' : 'help';
  }

  getSexeLabel(): string {
    if (!this.naissance?.sexe) return 'Indéterminé';
    return this.naissance.sexe === 'M' ? 'Masculin' : this.naissance.sexe === 'F' ? 'Féminin' : 'Indéterminé';
  }

  getPoidsEvaluation(): { status: string; color: string; message: string } {
    if (!this.naissance?.poids) return { status: '', color: '', message: '' };

    const poids = this.naissance.poids;
    if (poids < 2500) {
      return {
        status: 'Faible poids',
        color: 'warn',
        message: 'Poids inférieur à la normale (< 2500g)'
      };
    } else if (poids > 4000) {
      return {
        status: 'Macrosomie',
        color: 'accent',
        message: 'Poids supérieur à la normale (> 4000g)'
      };
    } else {
      return {
        status: 'Normal',
        color: 'primary',
        message: 'Poids dans les normes (2500-4000g)'
      };
    }
  }

  getPerimetreEvaluation(): { status: string; color: string; message: string } {
    if (!this.naissance?.perimetreCranien) return { status: '', color: '', message: '' };

    const perimetre = this.naissance.perimetreCranien;
    if (perimetre < 32) {
      return {
        status: 'Microcéphalie',
        color: 'warn',
        message: 'Périmètre inférieur à la normale (< 32cm)'
      };
    } else if (perimetre > 37) {
      return {
        status: 'Macrocéphalie',
        color: 'accent',
        message: 'Périmètre supérieur à la normale (> 37cm)'
      };
    } else {
      return {
        status: 'Normal',
        color: 'primary',
        message: 'Périmètre dans les normes (32-37cm)'
      };
    }
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
} 