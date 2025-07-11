import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, startWith, map, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { TraitementRequest } from '../../../../core/models/traitement/traitement-request.model';
import { TraitementResponse } from '../../../../core/models/traitement/traitement-response.model';
import { updateTraitement, createTraitement } from '../../../../store/traitements/traitements.actions';
import { selectTraitementsLoading } from '../../../../store/traitements/traitements.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Import des constantes
import {
  ANTIBIOTIQUES_SUGGESTIONS,
  VITAMINES_SUPPLEMENTS_SUGGESTIONS,
  ANTALGIQUES_SUGGESTIONS,
  ANTISPASMODIQUES_SUGGESTIONS,
  HORMONES_SUGGESTIONS,
  POSOLOGIES_COURANTES,
  DUREES_TRAITEMENT,
  MEDICAMENTS_POSOLOGIES,
  INSTRUCTIONS_SPECIALES
} from '../../../../core/models/traitement/traitement-constants.model';
import { ConsultationResponse } from '../../../../core/models/consultation/consultation-response.model';

@Component({
  selector: 'app-traitement-form',
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
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './traitement-form.component.html',
  styleUrls: ['./traitement-form.component.css']
})
export class TraitementFormComponent implements OnInit, OnDestroy {
  @Input() traitement?: TraitementResponse;
  @Input() consultation!: ConsultationResponse;
  @Input() patienteName?: string;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();

  traitementForm!: FormGroup;
  loading$: Observable<boolean>;
  
  // Suggestions pour l'autocomplétion
  medicamentSuggestions: string[] = [];
  posologieSuggestions: string[] = [];
  filteredMedicaments$!: Observable<string[]>;
  filteredPosologies$!: Observable<string[]>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService
  ) {
    this.loading$ = this.store.select(selectTraitementsLoading);
    this.initializeForm();
    this.setupSuggestions();
  }

  ngOnInit(): void {
    this.setupAutocomplete();
    
    if (this.isEdit && this.traitement) {
      this.populateForm(this.traitement);
    } else {
      // Mode création - dates par défaut
      this.setDefaultDates();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le formulaire
   */
  private initializeForm(): void {
    this.traitementForm = this.fb.group({
      medicament: ['', [Validators.required, Validators.minLength(2)]],
      posologie: ['', [Validators.required]],
      dateDebut: [new Date(), Validators.required],
      dateFin: ['', Validators.required],
      observation: ['']
    });
  }

  /**
   * Configurer les suggestions de médicaments
   */
  private setupSuggestions(): void {
    this.medicamentSuggestions = [
      ...ANTIBIOTIQUES_SUGGESTIONS,
      ...VITAMINES_SUPPLEMENTS_SUGGESTIONS,
      ...ANTALGIQUES_SUGGESTIONS,
      ...ANTISPASMODIQUES_SUGGESTIONS,
      ...HORMONES_SUGGESTIONS
    ].sort();

    this.posologieSuggestions = POSOLOGIES_COURANTES;
  }

  /**
   * Configurer l'autocomplétion
   */
  private setupAutocomplete(): void {
    this.filteredMedicaments$ = this.traitementForm.get('medicament')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterMedicaments(value || ''))
    );

    this.filteredPosologies$ = this.traitementForm.get('posologie')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterPosologies(value || ''))
    );
  }

  /**
   * Filtrer les médicaments
   */
  private filterMedicaments(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.medicamentSuggestions.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Filtrer les posologies
   */
  private filterPosologies(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.posologieSuggestions.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Remplir le formulaire avec les données existantes
   */
  private populateForm(traitement: TraitementResponse): void {
    this.traitementForm.patchValue({
      medicament: traitement.medicament,
      posologie: traitement.posologie,
      dateDebut: new Date(traitement.dateDebut),
      dateFin: new Date(traitement.dateFin),
      observation: traitement.observation
    });
  }

  /**
   * Définir les dates par défaut (aujourd'hui + 7 jours)
   */
  private setDefaultDates(): void {
    const today = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(today.getDate() + 7);

    this.traitementForm.patchValue({
      dateDebut: today,
      dateFin: defaultEndDate
    });
  }

  /**
   * Sélectionner un médicament et suggérer une posologie
   */
  onMedicamentSelected(medicament: string): void {
    // Suggérer automatiquement une posologie courante pour ce médicament
    const posologiesSuggerees = MEDICAMENTS_POSOLOGIES[medicament];
    if (posologiesSuggerees && posologiesSuggerees.length > 0) {
      this.traitementForm.patchValue({
        posologie: posologiesSuggerees[0]
      });
    }
  }

  /**
   * Appliquer une durée prédéfinie
   */
  applyDuration(durationText: string): void {
    const dateDebut = this.traitementForm.get('dateDebut')?.value;
    if (!dateDebut) return;

    const startDate = new Date(dateDebut);
    let endDate = new Date(startDate);

    // Parser la durée et calculer la date de fin
    if (durationText.includes('jour')) {
      const days = parseInt(durationText);
      endDate.setDate(startDate.getDate() + days);
    } else if (durationText.includes('semaine')) {
      const weeks = parseInt(durationText);
      endDate.setDate(startDate.getDate() + (weeks * 7));
    } else if (durationText.includes('mois')) {
      const months = parseInt(durationText);
      endDate.setMonth(startDate.getMonth() + months);
    }

    this.traitementForm.patchValue({
      dateFin: endDate
    });
  }

  /**
   * Valider les dates
   */
  validateDates(): boolean {
    const dateDebut = this.traitementForm.get('dateDebut')?.value;
    const dateFin = this.traitementForm.get('dateFin')?.value;

    if (dateDebut && dateFin) {
      if (new Date(dateFin) <= new Date(dateDebut)) {
        this.notificationService.error('La date de fin doit être postérieure à la date de début', 'Dates invalides');
        return false;
      }
    }
    return true;
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.traitementForm.valid && this.validateDates()) {
      const formData = this.traitementForm.value;
      
      const request: TraitementRequest = {
        medicament: formData.medicament,
        posologie: formData.posologie,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        observation: formData.observation || '',
        consultation: this.consultation
      };

      if (this.isEdit && this.traitement) {
        this.store.dispatch(updateTraitement({
          id: this.traitement.id,
          request: request
        }));
      } else {
        this.store.dispatch(createTraitement({ request }));
      }

      this.closePanel(true);
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.traitementForm.controls).forEach(key => {
      const control = this.traitementForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtenir l'erreur pour un champ
   */
  getFieldError(fieldName: string): string | null {
    const field = this.traitementForm.get(fieldName);
    
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return 'Ce champ est requis';
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['email']) {
        return 'Format email invalide';
      }
    }
    
    return null;
  }

  /**
   * Annuler et fermer le formulaire
   */
  cancel(): void {
    this.closePanel(false);
  }

  /**
   * Fermer le panel
   */
  private closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }

  /**
   * Obtenir le titre du formulaire
   */
  get formTitle(): string {
    return this.isEdit ? 'Modifier le traitement' : 'Nouveau traitement';
  }

  /**
   * Obtenir les durées de traitement disponibles
   */
  get availableDurations(): string[] {
    return DUREES_TRAITEMENT;
  }

  /**
   * Obtenir les instructions spéciales disponibles
   */
  get availableInstructions(): string[] {
    return INSTRUCTIONS_SPECIALES;
  }

  /**
   * Ajouter une instruction prédéfinie aux observations
   */
  addInstruction(instruction: string): void {
    const currentObservation = this.traitementForm.get('observation')?.value || '';
    const newObservation = currentObservation 
      ? `${currentObservation}\n- ${instruction}`
      : `- ${instruction}`;
    
    this.traitementForm.patchValue({
      observation: newObservation
    });
  }
} 