import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, startWith, map, Subject, takeUntil } from 'rxjs';
import { AntecedentService } from '../../../../core/services/antecedent.service';
import { AntecedentRequest, NATURES, TYPES_FEMME, TYPES_HEREDITAIRE, TYPES_OBSTETRICAL } from '../../../../core/models/antecedent/antecedent.request.model';
import { AntecedentResponse } from '../../../../core/models/antecedent/antecedent.response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { SidePanelService } from '../../../../core/services/side-panel.service';

export interface AntecedentFormData {
  patient: PatienteResponse;
  antecedent?: AntecedentResponse;
  nature?: string;
  isEdit: boolean;
  onClose?: (success: boolean) => void;
}

@Component({
  selector: 'app-antecedent-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  templateUrl: './antecedent-form-dialog.component.html',
  styleUrls: ['./antecedent-form-dialog.component.css']
})
export class AntecedentFormDialogComponent implements OnInit, OnDestroy {
  @Input() patient?: PatienteResponse;
  @Input() antecedent?: AntecedentResponse;
  @Input() nature?: string;
  @Input() isEdit: boolean = false;
  @Input() onCloseCallback?: (success: boolean) => void;
  
  @Output() onClose = new EventEmitter<boolean>();

  antecedentForm: FormGroup;
  loading = false;
  
  // Constantes pour les suggestions
  readonly NATURES = NATURES;
  readonly TYPES_FEMME = TYPES_FEMME;
  readonly TYPES_HEREDITAIRE = TYPES_HEREDITAIRE;
  readonly TYPES_OBSTETRICAL = TYPES_OBSTETRICAL;

  // Observables pour l'autocomplétion
  filteredNatures$: Observable<string[]>;
  filteredTypes$: Observable<string[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private antecedentService: AntecedentService,
    private snackBar: MatSnackBar,
    private sidePanelService: SidePanelService
  ) {
    this.antecedentForm = this.createForm();
    this.filteredNatures$ = this.setupNatureFilter();
    this.filteredTypes$ = this.setupTypeFilter();
  }

  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    if (this.nature) {
      this.antecedentForm.patchValue({ nature: this.nature });
    }

    if (this.isEdit && this.antecedent) {
      this.loadAntecedentData();
    }
  }

  /**
   * Créer le formulaire réactif
   */
  private createForm(): FormGroup {
    return this.fb.group({
      nature: ['', [Validators.required]],
      type: ['', [Validators.required]],
      observation: [''],
      date: [new Date(), [Validators.required]],
      lieu: [''],
      ageGestationnel: [null],
      membreFamille: ['']
    });
  }

  /**
   * Configurer le filtre pour les natures
   */
  private setupNatureFilter(): Observable<string[]> {
    return this.antecedentForm.get('nature')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, this.NATURES)),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Configurer le filtre pour les types
   */
  private setupTypeFilter(): Observable<string[]> {
    return this.antecedentForm.get('type')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const nature = this.antecedentForm.get('nature')?.value;
        const types = this.getTypesForNature(nature);
        return this.filterOptions(value, types);
      }),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Filtrer les options d'autocomplétion
   */
  private filterOptions(value: string, options: string[]): string[] {
    if (!value) return options;
    const filterValue = value.toLowerCase();
    return options.filter(option => 
      option.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Obtenir les types selon la nature sélectionnée
   */
  getTypesForNature(nature: string): string[] {
    switch (nature) {
      case 'Femme': return this.TYPES_FEMME;
      case 'Héréditaire': return this.TYPES_HEREDITAIRE;
      case 'Obstetrical': return this.TYPES_OBSTETRICAL;
      default: return [];
    }
  }

  /**
   * Charger les données de l'antécédent à modifier
   */
  private loadAntecedentData(): void {
    if (!this.antecedent) return;

    const antecedent = this.antecedent;
    this.antecedentForm.patchValue({
      nature: antecedent.nature,
      type: antecedent.type,
      observation: antecedent.observation,
      date: new Date(antecedent.date),
      lieu: antecedent.lieu,
      ageGestationnel: antecedent.ageGestationnel,
      membreFamille: antecedent.membreFamille
    });
  }

  /**
   * Gérer le changement de nature
   */
  onNatureChange(): void {
    // Réinitialiser le type quand la nature change
    this.antecedentForm.patchValue({ type: '' });
    
    // Mettre à jour les validateurs selon la nature
    this.updateValidators();
  }

  /**
   * Mettre à jour les validateurs selon la nature
   */
  private updateValidators(): void {
    const nature = this.antecedentForm.get('nature')?.value;
    const ageGestationnel = this.antecedentForm.get('ageGestationnel');
    const membreFamille = this.antecedentForm.get('membreFamille');

    // Réinitialiser les validateurs
    ageGestationnel?.clearValidators();
    membreFamille?.clearValidators();

    // Ajouter des validateurs spécifiques selon la nature
    if (nature === 'Obstetrical') {
      ageGestationnel?.setValidators([Validators.min(0), Validators.max(42)]);
    }

    if (nature === 'Héréditaire') {
      membreFamille?.setValidators([Validators.required]);
    }

    // Mettre à jour la validation
    ageGestationnel?.updateValueAndValidity();
    membreFamille?.updateValueAndValidity();
  }

  /**
   * Vérifier si un champ est requis selon la nature
   */
  isFieldRequired(fieldName: string): boolean {
    const nature = this.antecedentForm.get('nature')?.value;
    
    switch (fieldName) {
      case 'ageGestationnel':
        return nature === 'Obstetrical';
      case 'membreFamille':
        return nature === 'Héréditaire';
      default:
        return false;
    }
  }

  /**
   * Obtenir le label d'un champ selon la nature
   */
  getFieldLabel(fieldName: string): string {
    const nature = this.antecedentForm.get('nature')?.value;
    
    switch (fieldName) {
      case 'ageGestationnel':
        return 'Âge gestationnel (semaines)';
      case 'membreFamille':
        return 'Membre de la famille concerné';
      case 'lieu':
        return nature === 'Obstetrical' ? 'Lieu d\'accouchement/intervention' : 'Lieu';
      default:
        return fieldName;
    }
  }

  /**
   * Vérifier si un champ doit être affiché selon la nature
   */
  shouldShowField(fieldName: string): boolean {
    const nature = this.antecedentForm.get('nature')?.value;
    
    switch (fieldName) {
      case 'ageGestationnel':
        return nature === 'Obstetrical';
      case 'membreFamille':
        return nature === 'Héréditaire';
      case 'lieu':
        return nature === 'Femme' || nature === 'Obstetrical';
      default:
        return true;
    }
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.antecedentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.patient) {
      this.showErrorMessage('Aucune patiente sélectionnée');
      return;
    }

    this.loading = true;
    const formValue = this.antecedentForm.value;
    
    const antecedentRequest: AntecedentRequest = {
      ...formValue,
      patienteId: this.patient.id
    };

    const operation = this.isEdit && this.antecedent
      ? this.antecedentService.updateAntecedent(this.antecedent.id, antecedentRequest)
      : this.antecedentService.createAntecedent(antecedentRequest);

    operation.subscribe({
      next: (result) => {
        this.loading = false;
        this.showSuccessMessage(
          this.isEdit ? 'Antécédent modifié avec succès' : 'Antécédent créé avec succès'
        );
        this.closePanel(true);
      },
      error: (error) => {
        this.loading = false;
        this.showErrorMessage('Erreur lors de la sauvegarde de l\'antécédent');
        this.closePanel(false);
      }
    });
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.antecedentForm.controls).forEach(key => {
      const control = this.antecedentForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const control = this.antecedentForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    if (control.errors['min']) {
      return `La valeur doit être supérieure à ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `La valeur doit être inférieure à ${control.errors['max'].max}`;
    }

    return 'Valeur invalide';
  }

  /**
   * Annuler et fermer le panel
   */
  onCancel(): void {
    this.closePanel(false);
  }

  /**
   * Fermer le side panel et exécuter le callback
   */
  closePanel(success: boolean = false): void {
    // Appeler le callback s'il est défini
    if (this.onCloseCallback) {
      this.onCloseCallback(success);
    }
    
    // Émettre l'événement
    this.onClose.emit(success);
    
    // Fermer le side panel
    this.sidePanelService.close();
  }

  /**
   * Annuler
   */
  cancel(): void {
    this.closePanel(false);
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
   * Obtenir le titre du formulaire
   */
  get formTitle(): string {
    if (this.isEdit) {
      return 'Modifier l\'antécédent';
    }
    return this.nature 
      ? `Nouvel antécédent ${this.nature.toLowerCase()}`
      : 'Nouvel antécédent';
  }
} 