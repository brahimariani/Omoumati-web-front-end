import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil, Observable, map, startWith } from 'rxjs';

import { ComplicationRequest } from '../../../../core/models/complication/complication-request.model';
import { ComplicationResponse } from '../../../../core/models/complication/complication-response.model';
import { GrossesseResponse } from '../../../../core/models/grossesse/grossesse-response.model';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';
import { NaissanceResponse } from '../../../../core/models/naissance/naissance-response.model';
import { ComplicationsActions } from '../../../../store/complications';
import { selectComplicationsLoading } from '../../../../store/complications/complications.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';

/**
 * Type de contexte pour lequel la complication est créée
 */
export type ComplicationContext = 'grossesse' | 'accouchement' | 'naissance';

/**
 * Interface pour les données de contexte
 */
export interface ComplicationContextData {
  type: ComplicationContext;
  grossesse?: GrossesseResponse;
  accouchement?: AccouchementResponse;
  naissance?: NaissanceResponse;
}

@Component({
  selector: 'app-complication-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './complication-form.component.html',
  styleUrl: './complication-form.component.css'
})
export class ComplicationFormComponent implements OnInit, OnDestroy {
  @Input() complication?: ComplicationResponse;
  @Input() contextData?: ComplicationContextData;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();

  complicationForm!: FormGroup;
  loading$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();

  // Options pour l'autocomplétion
  naturesComplications = [
    'Hémorragie',
    'Infection',
    'Hypertension',
    'Diabète gestationnel',
    'Prééclampsie',
    'Rupture utérine',
    'Souffrance fœtale',
    'Dystocie',
    'Déchirure périnéale',
    'Rétention placentaire',
    'Asphyxie néonatale',
    'Détresse respiratoire',
    'Malformation congénitale',
    'Autre'
  ];

  lieuxComplications = [
    'Salle de travail',
    'Bloc opératoire',
    'Salle de réveil',
    'Service de gynécologie',
    'Service de néonatologie',
    'Domicile',
    'Transport',
    'Autre'
  ];

  // Observables pour l'autocomplétion
  filteredNatures$!: Observable<string[]>;
  filteredLieux$!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(selectComplicationsLoading);
  }

  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(ComplicationsActions.createComplicationSuccess, ComplicationsActions.updateComplicationSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closePanel(true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    this.initializeForm();
    this.setupAutocomplete();
    
    if (this.isEdit && this.complication) {
      this.populateForm();
    }
  }

  /**
   * Initialise le formulaire avec les validateurs appropriés
   */
  private initializeForm(): void {
    this.complicationForm = this.fb.group({
      nature: ['', [Validators.required, Validators.maxLength(200)]],
      date: [new Date(), Validators.required],
      lieu: ['', [Validators.required, Validators.maxLength(100)]],
      observation: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  /**
   * Configure l'autocomplétion pour les champs
   */
  private setupAutocomplete(): void {
    this.filteredNatures$ = this.complicationForm.get('nature')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value || '', this.naturesComplications))
    );

    this.filteredLieux$ = this.complicationForm.get('lieu')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value || '', this.lieuxComplications))
    );
  }

  /**
   * Filtre les options pour l'autocomplétion
   */
  private filterOptions(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  /**
   * Remplit le formulaire avec les données de la complication existante
   */
  private populateForm(): void {
    if (this.complication) {
      this.complicationForm.patchValue({
        nature: this.complication.nature,
        date: new Date(this.complication.date),
        lieu: this.complication.lieu,
        observation: this.complication.observation
      });
      
      // Déclencher l'autocomplétion après le patch
      this.complicationForm.get('nature')?.updateValueAndValidity();
      this.complicationForm.get('lieu')?.updateValueAndValidity();
    }
  }

  /**
   * Détermine le titre du formulaire selon le contexte
   */
  get formTitle(): string {
    const action = this.isEdit ? 'Modifier' : 'Ajouter';
    const context = this.getContextLabel();
    return `${action} une complication - ${context}`;
  }

  /**
   * Retourne le libellé du contexte
   */
  getContextLabel(): string {
    if (!this.contextData) return 'Contexte non défini';
    
    switch (this.contextData.type) {
      case 'grossesse':
        return 'Grossesse';
      case 'accouchement':
        return 'Accouchement';
      case 'naissance':
        return 'Naissance';
      default:
        return 'Contexte inconnu';
    }
  }

  /**
   * Fermer le panel
   */
  closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }

  /**
   * Annuler et fermer
   */
  cancel(): void {
    this.closePanel(false);
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (!this.complicationForm.valid) {
      this.markFormGroupTouched();
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const formData = this.complicationForm.value;
    
    // Debug : vérifier les données reçues
    console.log('Form data:', formData);
    console.log('Context data:', this.contextData);
    console.log('Context type:', this.contextData?.type);
    console.log('Grossesse data:', this.contextData?.grossesse);
    console.log('Accouchement data:', this.contextData?.accouchement);
    console.log('Naissance data:', this.contextData?.naissance);
    
    // Déterminer les objets selon le contexte
    let complicationData: ComplicationRequest = {
      ...formData,
      grossesse: null,
      accouchement: null,
      naissance: null
    };
    
    if (this.contextData) {
      switch (this.contextData.type) {
        case 'grossesse':
          console.log('Grossesse ID:', this.contextData.grossesse?.id);
          complicationData.grossesse = this.contextData.grossesse || null;
          console.log('Grossesse complication data:', complicationData);
          break;
        case 'accouchement':
          console.log('Accouchement ID:', this.contextData.accouchement?.id);
          complicationData.accouchement = this.contextData.accouchement || null;
          console.log('Accouchement complication data:', complicationData);
          break;
        case 'naissance':
          console.log('Naissance ID:', this.contextData.naissance?.id);
          complicationData.naissance = this.contextData.naissance || null;
          console.log('Naissance complication data:', complicationData);
          break;
        default:
          console.log('Default complication data:', complicationData);
      }
    } else {
      console.log('No context - complication data:', complicationData);
    }

    if (this.isEdit && this.complication?.id) {
      this.store.dispatch(ComplicationsActions.updateComplication({
        id: this.complication.id,
        request: complicationData
      }));
    } else {
      this.store.dispatch(ComplicationsActions.createComplication({
        request: complicationData
      }));
    }
    
    // Le panel se fermera automatiquement via l'écoute des actions de succès
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.complicationForm.controls).forEach(key => {
      const control = this.complicationForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifie si un champ a une erreur spécifique
   */
  hasError(field: string, errorType: string): boolean {
    const control = this.complicationForm.get(field);
    return !!(control && control.hasError(errorType) && control.touched);
  }

  /**
   * Retourne le message d'erreur pour un champ
   */
  getErrorMessage(field: string): string {
    const control = this.complicationForm.get(field);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return `Le champ ${field} est requis`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères`;
    }
    return '';
  }

  /**
   * Détermine si le formulaire peut être soumis
   */
  get canSubmit(): boolean {
    return this.complicationForm.valid;
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