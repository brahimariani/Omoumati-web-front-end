import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, startWith, map, Subject, takeUntil, filter } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { VaccinRequestDto } from '../../../../core/models/vaccin/vaccin-request.model';
import { VaccinResponseDto } from '../../../../core/models/vaccin/vaccin-response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { VACCINS_SUGGESTIONS } from '../../../../core/models/vaccin/vaccin-request.model';
import { VaccinsActions } from '../../../../store/vaccins/vaccins.actions';
import { selectVaccinsLoading } from '../../../../store/vaccins/vaccins.selectors';

export enum VaccinMode {
  PATIENTE = 'patiente',
  NAISSANCE = 'naissance'
}

export interface VaccinDialogData {
  patient?: PatienteResponse;
  vaccin?: VaccinResponseDto;
  naissanceId?: string;
  vaccinMode?: VaccinMode;
  isEdit: boolean;
}

// Suggestions spécifiques par type de vaccin
const VACCINS_PATIENTE_SUGGESTIONS = [
  'VAT 1',
  'VAT 2', 
  'VAT 3',
  'VAT 4',
  'VAT 5',
  'Rubéole',
  'Hépatite B', 
  'Frottis cervical',
  'IVA (mois de 3 ans)'
] as const;

const VACCINS_NAISSANCE_SUGGESTIONS = [
  'BCG',
  'HB',
  'Polio 0',
  'Penta 1',
  'Penta 2',
  'Penta 3',
  'Polio 1',
  'Polio 2',
  'Polio 3',
  'RR 1',
  'RR 2'
] as const;

//TODO : convert vaccin-form-dialog to side panel

@Component({
  selector: 'app-vaccin-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './vaccin-form-dialog.component.html',
  styleUrls: ['./vaccin-form-dialog.component.css']
})
export class VaccinFormDialogComponent implements OnInit, OnDestroy {
  vaccinForm: FormGroup;
  loading$: Observable<boolean>;
  
  // Constantes pour les suggestions
  readonly VACCINS_SUGGESTIONS = VACCINS_SUGGESTIONS;
  readonly VACCINS_PATIENTE_SUGGESTIONS = VACCINS_PATIENTE_SUGGESTIONS;
  readonly VACCINS_NAISSANCE_SUGGESTIONS = VACCINS_NAISSANCE_SUGGESTIONS;
  readonly VaccinMode = VaccinMode;

  // Observable pour l'autocomplétion
  filteredVaccins$: Observable<string[]>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    public dialogRef: MatDialogRef<VaccinFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VaccinDialogData
  ) {
    this.vaccinForm = this.createForm();
    this.filteredVaccins$ = this.setupVaccinFilter();
    this.loading$ = this.store.select(selectVaccinsLoading);
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.vaccin) {
      this.loadVaccinData();
    }
    
    // Écouter les succès de création/modification pour fermer le dialog
    this.actions$.pipe(
      ofType(VaccinsActions.createVaccinSuccess, VaccinsActions.updateVaccinSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Créer le formulaire réactif
   */
  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      date: [new Date(), [Validators.required]],
      patienteId: [this.data.patient?.id || null],
      naissanceId: [this.data.naissanceId || null]
    });
  }

  /**
   * Configurer le filtre pour l'autocomplétion des vaccins
   */
  private setupVaccinFilter(): Observable<string[]> {
    return this.vaccinForm.get('nom')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterVaccins(value))
    );
  }

  /**
   * Filtrer les suggestions de vaccins selon le type
   */
  private filterVaccins(value: string): string[] {
    const suggestions = this.getVaccinSuggestions();
    if (!value) return [...suggestions];
    
    const filterValue = value.toLowerCase();
    return suggestions.filter(vaccin => 
      vaccin.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Obtenir les suggestions de vaccins selon le type
   */
  getVaccinSuggestions(): string[] {
    const isNaissanceVaccin = this.isNaissanceVaccin();
    return isNaissanceVaccin ? [...VACCINS_NAISSANCE_SUGGESTIONS] : [...VACCINS_PATIENTE_SUGGESTIONS];
  }

  /**
   * Vérifier si c'est un vaccin de naissance
   */
  isNaissanceVaccin(): boolean {
    return this.data.vaccinMode === VaccinMode.NAISSANCE || !!this.data.naissanceId;
  }

  /**
   * Obtenir le type de vaccin pour l'affichage
   */
  getVaccinTypeDisplay(): string {
    return this.isNaissanceVaccin() ? 'Vaccin de naissance' : 'Vaccin de patiente';
  }

  /**
   * Obtenir l'icône du type de vaccin
   */
  getVaccinTypeIcon(): string {
    return this.isNaissanceVaccin() ? 'child_care' : 'person';
  }

  /**
   * Charger les données du vaccin à modifier
   */
  private loadVaccinData(): void {
    if (!this.data.vaccin) return;

    const vaccin = this.data.vaccin;
    this.vaccinForm.patchValue({
      nom: vaccin.nom,
      date: new Date(vaccin.date),
      patienteId: vaccin.patienteId,
      naissanceId: vaccin.naissanceId
    });
  }

  /**
   * Sélectionner un vaccin depuis les suggestions
   */
  onVaccinSelected(vaccin: string): void {
    this.vaccinForm.patchValue({ nom: vaccin });
  }

  /**
   * Vérifier si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.vaccinForm.valid;
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.vaccinForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    
    if (errors['required']) {
      switch (fieldName) {
        case 'nom': return 'Le nom du vaccin est requis';
        case 'date': return 'La date de vaccination est requise';
        default: return 'Ce champ est requis';
      }
    }
    
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères`;
    }
    
    return '';
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.markFormGroupTouched();
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const vaccinData: VaccinRequestDto = this.vaccinForm.value;

    if (this.data.isEdit && this.data.vaccin) {
      // Mise à jour
      this.store.dispatch(VaccinsActions.updateVaccin({ 
        id: this.data.vaccin.id, 
        request: vaccinData 
      }));
    } else {
      // Création
      this.store.dispatch(VaccinsActions.createVaccin({ 
        request: vaccinData 
      }));
    }
    
    // Le dialog se fermera automatiquement via l'écoute des actions de succès
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.vaccinForm.controls).forEach(key => {
      const control = this.vaccinForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Annuler et fermer le dialog
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Obtenir le titre du dialog
   */
  getDialogTitle(): string {
    const action = this.data.isEdit ? 'Modifier' : 'Ajouter';
    const type = this.isNaissanceVaccin() ? 'de naissance' : 'de patiente';
    return `${action} un vaccin ${type}`;
  }

  /**
   * Obtenir le texte du bouton de validation
   */
  getSubmitButtonText(): string {
    return this.data.isEdit ? 'Mettre à jour' : 'Ajouter';
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
} 