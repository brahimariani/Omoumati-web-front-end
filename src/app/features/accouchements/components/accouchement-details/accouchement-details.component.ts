import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { AccouchementsActions } from '../../../../store/accouchements';
import * as AccouchementsSelectors from '../../../../store/accouchements/accouchements.selectors';
import { NaissancesActions, selectNaissancesByAccouchement } from '../../../../store/naissances';
import { ComplicationsActions, selectComplicationsByAccouchement } from '../../../../store/complications';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';
import { NaissanceResponse } from '../../../../core/models/naissance/naissance-response.model';
import { ComplicationResponse } from '../../../../core/models/complication/complication-response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';

// Import des nouveaux composants
import { NaissanceFormDialogComponent, NaissanceDialogData } from '../../../naissances/components/naissance-form-dialog/naissance-form-dialog.component';
import { NaissanceDetailsComponent } from '../../../naissances/components/naissance-details/naissance-details.component';
import { ComplicationListComponent } from '../../../complications/components/complication-list/complication-list.component';
import { ComplicationContextData } from '../../../complications/components/complication-form/complication-form.component';

// Interface pour les alertes médicales
interface Alert {
  severity: 'info' | 'warning' | 'error';
  icon: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-accouchement-details',
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
    NaissanceDetailsComponent,
    ComplicationListComponent
  ],
  templateUrl: './accouchement-details.component.html',
  styleUrl: './accouchement-details.component.css'
})
export class AccouchementDetailsComponent implements OnInit, OnDestroy {
  accouchement$: Observable<AccouchementResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  naissances$: Observable<NaissanceResponse[]>;
  complications$: Observable<ComplicationResponse[]>;
  complicationContextData$: Observable<ComplicationContextData | null>;

  // Variable pour la patiente (à récupérer depuis l'accouchement)
  patient$: Observable<PatienteResponse | null>;

  private destroy$ = new Subject<void>();
  private accouchementId: string | null = null;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.accouchement$ = this.store.select(AccouchementsSelectors.selectSelectedAccouchement);
    this.loading$ = this.store.select(AccouchementsSelectors.selectAccouchementsLoading);
    this.error$ = this.store.select(AccouchementsSelectors.selectAccouchementsError);
    
    // Sélecteurs pour les naissances et complications
    this.naissances$ = this.store.select(selectNaissancesByAccouchement);
    this.complications$ = this.store.select(selectComplicationsByAccouchement);
    
    // Récupérer la patiente depuis l'accouchement
    this.patient$ = this.accouchement$.pipe(
      map((accouchement: AccouchementResponse | null) => {
        // Pour l'instant, on va retourner null car AccouchementResponse ne contient pas directement la patiente
        // Il faudra charger la grossesse pour récupérer la patiente
        return null;
      })
    );
    
    // Contexte pour les complications
    this.complicationContextData$ = this.accouchement$.pipe(
      map((accouchement: AccouchementResponse | null) => accouchement ? {
        type: 'accouchement' as const,
        accouchement
      } : null)
    );
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.accouchementId = params['id'];
      if (this.accouchementId) {
        this.store.dispatch(AccouchementsActions.loadAccouchement({ id: this.accouchementId }));
        this.loadNaissances();
        this.loadComplications();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthodes de navigation
  onBack(): void {
    this.router.navigate(['/accouchements']);
  }

  onEditAccouchement(): void {
    if (this.accouchementId) {
      this.router.navigate(['/accouchements', this.accouchementId, 'edit']);
    }
  }

  onRetry(): void {
    if (this.accouchementId) {
      this.store.dispatch(AccouchementsActions.loadAccouchement({ id: this.accouchementId }));
    }
  }

  // Méthodes pour les naissances avec le nouveau dialog
  onAddNaissance(accouchement: AccouchementResponse): void {
    if (!accouchement) return;

    const dialogData: NaissanceDialogData = {
      accouchement,
      isEdit: false
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
        this.loadNaissances();
        this.showSuccessMessage('Naissance enregistrée avec succès');
      }
    });
  }

  onEditNaissance(naissance: NaissanceResponse, accouchement: AccouchementResponse): void {
    if (!naissance || !accouchement) return;

    const dialogData: NaissanceDialogData = {
      accouchement,
      naissance,
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
        this.loadNaissances();
        this.showSuccessMessage('Naissance modifiée avec succès');
      }
    });
  }

  onViewNaissance(naissanceId: string): void {
    this.router.navigate(['/naissances', naissanceId]);
  }

  onDeleteNaissance(naissanceId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette naissance ?')) {
      this.store.dispatch(NaissancesActions.deleteNaissance({ id: naissanceId }));
      this.showSuccessMessage('Naissance supprimée avec succès');
    }
  }

  // Méthodes pour les complications
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

  // Méthodes utilitaires
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

  formatDateOnly(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  getModaliteIcon(modalite: string): string {
    const iconMap: { [key: string]: string } = {
      'Voie basse': 'child_care',
      'Césarienne': 'medical_services',
      'Forceps': 'build',
      'Ventouse': 'healing',
      'Autre': 'help'
    };
    return iconMap[modalite] || 'help';
  }

  getModaliteChipColor(modalite: string): 'primary' | 'accent' | 'warn' {
    if (modalite === 'Césarienne') return 'warn';
    if (modalite === 'Forceps' || modalite === 'Ventouse') return 'accent';
    return 'primary';
  }

  getNaissanceStatusColor(estVivant: boolean): 'primary' | 'warn' {
    return estVivant ? 'primary' : 'warn';
  }

  getNaissanceStatusLabel(estVivant: boolean): string {
    return estVivant ? 'Vivant' : 'Mort-né';
  }

  getSexeIcon(sexe: string): string {
    return sexe === 'M' ? 'male' : sexe === 'F' ? 'female' : 'help';
  }

  getSexeLabel(sexe: string): string {
    return sexe === 'M' ? 'Masculin' : sexe === 'F' ? 'Féminin' : 'Indéterminé';
  }

  evaluatePoidsNaissance(poids: number): { status: string; color: string; message: string } {
    if (poids < 2500) {
      return {
        status: 'Faible poids',
        color: 'warn',
        message: 'Poids de naissance inférieur à la normale'
      };
    } else if (poids > 4000) {
      return {
        status: 'Macrosomie',
        color: 'accent',
        message: 'Poids de naissance supérieur à la normale'
      };
    } else {
      return {
        status: 'Normal',
        color: 'primary',
        message: 'Poids de naissance dans les normes'
      };
    }
  }

  evaluatePerimetreCranien(perimetre: number): { status: string; color: string; message: string } {
    if (perimetre < 32) {
      return {
        status: 'Microcéphalie',
        color: 'warn',
        message: 'Périmètre crânien inférieur à la normale'
      };
    } else if (perimetre > 37) {
      return {
        status: 'Macrocéphalie',
        color: 'accent',
        message: 'Périmètre crânien supérieur à la normale'
      };
    } else {
      return {
        status: 'Normal',
        color: 'primary',
        message: 'Périmètre crânien dans les normes'
      };
    }
  }

  getAutomaticAlerts(accouchement: AccouchementResponse, naissances: NaissanceResponse[]): Alert[] {
    const alerts: Alert[] = [];

    // Alertes basées sur l'accouchement
    if (accouchement.modaliteExtraction === 'Césarienne') {
      alerts.push({
        severity: 'warning',
        icon: 'medical_services',
        title: 'Accouchement par césarienne',
        message: 'Surveillance post-opératoire requise.'
      });
    }

    if (!accouchement.assisstanceQualifiee) {
      alerts.push({
        severity: 'error',
        icon: 'warning',
        title: 'Absence d\'assistance qualifiée',
        message: 'Accouchement sans assistance médicale qualifiée.'
      });
    }

    // Alertes basées sur les naissances
    naissances.forEach(naissance => {
      if (!naissance.estVivant) {
        alerts.push({
          severity: 'error',
          icon: 'dangerous',
          title: 'Mort-né',
          message: 'Une naissance avec décès néonatal a été enregistrée.'
        });
      }

      if (naissance.poids < 2500) {
        alerts.push({
          severity: 'warning',
          icon: 'warning',
          title: 'Faible poids de naissance',
          message: `Nouveau-né avec un poids de ${naissance.poids}g (< 2500g).`
        });
      }

      if (naissance.poids > 4000) {
        alerts.push({
          severity: 'warning',
          icon: 'warning',
          title: 'Macrosomie fœtale',
          message: `Nouveau-né avec un poids de ${naissance.poids}g (> 4000g).`
        });
      }
    });

    return alerts;
  }

  private loadNaissances(): void {
    if (this.accouchementId) {
      this.store.dispatch(NaissancesActions.loadNaissancesByAccouchement({ 
        accouchementId: this.accouchementId 
      }));
    }
  }

  private loadComplications(): void {
    if (this.accouchementId) {
      this.store.dispatch(ComplicationsActions.loadComplicationsByAccouchement({ 
        accouchementId: this.accouchementId 
      }));
    }
  }

  /**
   * TrackBy function pour optimiser le rendu de la liste des naissances
   */
  trackByNaissanceId(index: number, naissance: NaissanceResponse): string {
    return naissance.id;
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