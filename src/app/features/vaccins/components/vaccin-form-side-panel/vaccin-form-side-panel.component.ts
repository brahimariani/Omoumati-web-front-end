import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { Observable, startWith, map, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { VaccinRequestDto } from '../../../../core/models/vaccin/vaccin-request.model';
import { VaccinResponseDto } from '../../../../core/models/vaccin/vaccin-response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { VACCINS_SUGGESTIONS } from '../../../../core/models/vaccin/vaccin-request.model';
import { VaccinsActions } from '../../../../store/vaccins/vaccins.actions';
import { selectVaccinsLoading } from '../../../../store/vaccins/vaccins.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';

export enum VaccinMode {
  PATIENTE = 'patiente',
  NAISSANCE = 'naissance'
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

@Component({
  selector: 'app-vaccin-form-side-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  templateUrl: './vaccin-form-side-panel.component.html',
  styleUrls: ['./vaccin-form-side-panel.component.css']
})
export class VaccinFormSidePanelComponent implements OnInit, OnDestroy {
  @Input() patient?: PatienteResponse;
  @Input() vaccin?: VaccinResponseDto;
  @Input() naissanceId?: string;
  @Input() vaccinMode?: VaccinMode;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();

  vaccinForm!: FormGroup;
  loading$: Observable<boolean>;
  
  // Constantes pour les suggestions
  readonly VACCINS_SUGGESTIONS = VACCINS_SUGGESTIONS;
  readonly VACCINS_PATIENTE_SUGGESTIONS = VACCINS_PATIENTE_SUGGESTIONS;
  readonly VACCINS_NAISSANCE_SUGGESTIONS = VACCINS_NAISSANCE_SUGGESTIONS;
  readonly VaccinMode = VaccinMode;

  // Observable pour l'autocomplétion
  filteredVaccins$!: Observable<string[]>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(selectVaccinsLoading);
    // Ne pas créer le formulaire ici - attendre ngOnInit
  }

  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(VaccinsActions.createVaccinSuccess, VaccinsActions.updateVaccinSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closePanel(true);
    });
  }

  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    // Créer le formulaire maintenant que les @Input() sont disponibles
    this.vaccinForm = this.createForm();
    this.filteredVaccins$ = this.setupVaccinFilter();
    
    if (this.isEdit && this.vaccin) {
      this.loadVaccinData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Créer le formulaire réactif
   */
  private createForm(): FormGroup {
    // Debug: vérifier les valeurs disponibles
    console.log('Creating form with:', {
      patient: this.patient,
      naissanceId: this.naissanceId,
      mode: this.vaccinMode,
      isNaissance: this.isNaissanceVaccin()
    });

    const patienteId = this.patient?.id || null;
    const naissanceId = this.naissanceId || null;

    console.log('Form values:', { patienteId, naissanceId });

    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      date: [new Date(), [Validators.required]],
      patienteId: [patienteId],
      naissanceId: [naissanceId]
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
    return this.vaccinMode === VaccinMode.NAISSANCE || !!this.naissanceId;
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
    if (!this.vaccin) return;

    const vaccin = this.vaccin;
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
    
    // Debug: vérifier les données soumises
    console.log('Submitting vaccin data:', vaccinData);
    console.log('Form raw value:', this.vaccinForm.getRawValue());
    console.log('Current inputs:', {
      patient: this.patient,
      naissanceId: this.naissanceId,
      mode: this.vaccinMode,
      isEdit: this.isEdit
    });

    if (this.isEdit && this.vaccin) {
      // Mise à jour
      this.store.dispatch(VaccinsActions.updateVaccin({ 
        id: this.vaccin.id, 
        request: vaccinData 
      }));
    } else {
      // Création
      this.store.dispatch(VaccinsActions.createVaccin({ 
        request: vaccinData 
      }));
    }
    
    // Le panel se fermera automatiquement via l'écoute des actions de succès
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
   * Annuler et fermer le panel
   */
  onCancel(): void {
    this.closePanel(false);
  }

  /**
   * Fermer le panel
   */
  closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }

  /**
   * Obtenir le titre du panel
   */
  getPanelTitle(): string {
    const action = this.isEdit ? 'Modifier' : 'Ajouter';
    const type = this.isNaissanceVaccin() ? 'de naissance' : 'de patiente';
    return `${action} un vaccin ${type}`;
  }

  /**
   * Obtenir le texte du bouton de validation
   */
  getSubmitButtonText(): string {
    return this.isEdit ? 'Mettre à jour' : 'Ajouter';
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