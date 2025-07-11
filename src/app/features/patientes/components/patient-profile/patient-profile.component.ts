import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';
import { PatientsActions } from '../../../../store/patients/patients.actions';
import { selectSelectedPatient, selectPatientsLoading, selectPatientsError } from '../../../../store/patients/patients.selectors';
import { AccouchementsActions } from '../../../../store/accouchements/accouchements.actions';
import { selectAccouchementsByPatient, selectAccouchementsLoading } from '../../../../store/accouchements/accouchements.selectors';
import { Groupage } from '../../../../core/models/patiente/groupage.model';
import { Rhesus } from '../../../../core/models/patiente/rhesus.model';
import { NiveauInstruction } from '../../../../core/models/patiente/niveauinstruction.model';
import { Sexe } from '../../../../core/models/patiente/sexe.model';
import { PatientAntecedentsComponent } from '../patient-antecedents/patient-antecedents.component';
import { VaccinsListComponent } from '../../../vaccins/components/vaccins-list/vaccins-list.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatListModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    PatientAntecedentsComponent,
    VaccinsListComponent
  ],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent implements OnInit, OnDestroy {
  patientId: string | null = null;
  patient$: Observable<PatienteResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  // Observables pour les accouchements antérieurs
  accouchementsAnterieurs$: Observable<AccouchementResponse[]>;
  accouchementsLoading$: Observable<boolean>;
  
  // Enums pour l'affichage
  Sexe = Sexe;
  Groupage = Groupage;
  Rhesus = Rhesus;
  NiveauInstruction = NiveauInstruction;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.patient$ = this.store.select(selectSelectedPatient);
    this.loading$ = this.store.select(selectPatientsLoading);
    this.error$ = this.store.select(selectPatientsError);
    this.accouchementsAnterieurs$ = this.store.select(selectAccouchementsByPatient);
    this.accouchementsLoading$ = this.store.select(selectAccouchementsLoading);
  }
  
  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = id;
        this.store.dispatch(PatientsActions.loadPatient({ id }));
        this.loadAccouchementsAnterieurs();
      }
    });
    
    // S'abonner aux erreurs
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        this.snackBar.open(`Erreur : ${error}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });

    // S'abonner aux succès de suppression d'accouchement pour recharger la liste
    this.actions$.pipe(
      ofType(AccouchementsActions.deleteAccouchementSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Recharger les accouchements après une suppression réussie
      this.loadAccouchementsAnterieurs();
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  editPatient(): void {
    if (this.patientId) {
      this.router.navigate(['/patientes', this.patientId, 'edit']);
    }
  }
  
  deletePatient(): void {
    if (this.patientId) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmer la suppression',
          message: 'Êtes-vous sûr de vouloir supprimer cette patiente ? Cette action supprimera également tous les données associées (grossesses, accouchements, etc.) et est irréversible.',
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          confirmColor: 'warn'
        } as ConfirmDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.patientId) {
          this.store.dispatch(PatientsActions.deletePatient({ id: this.patientId }));
          this.router.navigate(['/patientes']);
        }
      });
    }
  }
  
  printProfile(): void {
    window.print();
  }
  

  
  goBack(): void {
    this.router.navigate(['/patientes']);
  }
  
  // Méthodes pour les accouchements antérieurs
  addAccouchementAnterieur(): void {
    if (this.patientId) {
      // Naviguer vers le formulaire d'accouchement avec l'ID de la patiente
      this.router.navigate(['/accouchements/new'], { 
        queryParams: { patienteId: this.patientId } 
      });
    }
  }
  
  viewAccouchementDetails(accouchement: AccouchementResponse): void {
    if (accouchement.id) {
      this.router.navigate(['/accouchements', accouchement.id]);
    }
  }
  
  editAccouchementAnterieur(accouchement: AccouchementResponse): void {
    if (accouchement.id) {
      this.router.navigate(['/accouchements', accouchement.id, 'edit'], {
        queryParams: { patienteId: this.patientId }
      });
    }
  }
  
  deleteAccouchementAnterieur(accouchement: AccouchementResponse): void {
    if (accouchement.id) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmer la suppression',
          message: 'Êtes-vous sûr de vouloir supprimer cet accouchement ? Cette action est irréversible.',
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          confirmColor: 'warn'
        } as ConfirmDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.store.dispatch(AccouchementsActions.deleteAccouchement({ id: accouchement.id }));
        }
      });
    }
  }
  
  private loadAccouchementsAnterieurs(): void {
    if (this.patientId) {
      this.store.dispatch(AccouchementsActions.loadAccouchementsByPatient({ 
        patientId: this.patientId 
      }));
    }
  }
  
  // Méthodes pour les grossesses
  addGrossesse(): void {
    if (this.patientId) {
      this.router.navigate(['/grossesses/new'], { 
        queryParams: { patienteId: this.patientId } 
      });
    }
  }
  
  viewAllGrossesses(): void {
    if (this.patientId) {
      this.router.navigate(['/grossesses'], { 
        queryParams: { patientId: this.patientId } 
      });
    }
  }
  
  // Utilitaires pour l'affichage
  getAge(dateNaissance: Date): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  getBloodTypeDisplay(groupage: Groupage, rhesus: Rhesus): string {
    const rhesusSymbol = rhesus === Rhesus.POSITIF ? '+' : '-';
    return `${groupage}${rhesusSymbol}`;
  }
  
  getSexeDisplay(sexe: Sexe): string {
    return sexe === Sexe.FEMME ? 'Féminin' : 'Masculin';
  }
  
  formatDate(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }
  
  getNiveauInstructionDisplay(niveau: NiveauInstruction): string {
    switch (niveau) {
      case NiveauInstruction.SANS: return 'Sans instruction';
      case NiveauInstruction.PRIMAIRE: return 'Primaire';
      case NiveauInstruction.QUALIFIANT: return 'Qualifiant';
      case NiveauInstruction.NIVEAU_BAC: return 'Niveau Bac';
      case NiveauInstruction.BAC: return 'Baccalauréat';
      case NiveauInstruction.BAC_2: return 'Bac+2';
      case NiveauInstruction.BAC_3: return 'Bac+3';
      case NiveauInstruction.BAC_5: return 'Bac+5';
      case NiveauInstruction.DOCTORANT: return 'Doctorant';
      case NiveauInstruction.AUTRES: return 'Autres';
      default: return 'Non spécifié';
    }
  }
  
  exportProfile(): void {
    // TODO: Implémenter l'export du profil
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
