import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';

import { GrossesseRequest } from '../../../../core/models/grossesse/grossesse-request.model';
import { GrossesseResponse } from '../../../../core/models/grossesse/grossesse-response.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { GrossessesActions } from '../../../../store/grossesses/grossesses.actions';
import { PatientsActions } from '../../../../store/patients/patients.actions';
import * as GrossessesSelectors from '../../../../store/grossesses/grossesses.selectors';
import * as PatientsSelectors from '../../../../store/patients/patients.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';

@Component({
  selector: 'app-grossesse-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './grossesse-form.component.html',
  styleUrls: ['./grossesse-form.component.css']
})
export class GrossesseFormComponent implements OnInit, OnDestroy {
  @Input() grossesse?: GrossesseResponse;
  @Input() preselectedPatientId?: string;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();
  
  // Formulaires multi-étapes
  patientSelectionForm: FormGroup = this.fb.group({});
  pregnancyInfoForm: FormGroup = this.fb.group({});
  medicalInfoForm: FormGroup = this.fb.group({});
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  patients$: Observable<PatienteResponse[]>;
  filteredPatients$: Observable<PatienteResponse[]>;
  
  // Options pour les sélecteurs
  gestationOptions = Array.from({length: 15}, (_, i) => i + 1); // 1-15
  pariteOptions = Array.from({length: 10}, (_, i) => i); // 0-9
  
  // Terme de recherche pour filtrer les patientes
  searchTerm = '';
  
  // Vérification de grossesse active pour la patiente sélectionnée
  hasActivePregnancy = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(GrossessesSelectors.selectGrossessesLoading);
    this.error$ = this.store.select(GrossessesSelectors.selectGrossessesError);
    this.patients$ = this.store.select(PatientsSelectors.selectAllPatients);
    
    // Initialiser les patientes filtrées (initialement toutes les patientes)
    this.filteredPatients$ = this.patients$;
    
    this.initializeForms();
  }
  
  private initializeForms(): void {
    // Formulaire de sélection de patiente
    this.patientSelectionForm = this.fb.group({
      idPatient: ['', Validators.required]
    });
    
    // Formulaire des informations de grossesse
    this.pregnancyInfoForm = this.fb.group({
      gestation: [1, [Validators.required, Validators.min(1), Validators.max(15)]],
      parite: [0, [Validators.required, Validators.min(0), Validators.max(9)]],
      dateDerniereRegle: ['', Validators.required],
      estDesiree: [true]
    });
    
    // Formulaire des informations médicales
    this.medicalInfoForm = this.fb.group({
      datePrevueAccouchment: [''],
      dateDepacementTerme: [''],
      observation: ['', Validators.maxLength(1000)]
    });
  }
  
  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(GrossessesActions.createGrossesseSuccess, GrossessesActions.updateGrossesseSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closePanel(true);
    });
  }
  
  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    // Charger la liste des patientes avec une taille plus importante
    this.store.dispatch(PatientsActions.loadPatients({ page: 0, size: 1000 }));
    
    // Debug: vérifier que les patientes sont chargées
    this.patients$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(patients => {
      console.log('Patientes chargées:', patients.length);
    });

    // Pré-sélectionner une patiente si fournie
    if (this.preselectedPatientId) {
      this.patientSelectionForm.patchValue({
        idPatient: this.preselectedPatientId
      });
    }

    // Remplir le formulaire si on est en mode édition
    if (this.isEdit && this.grossesse) {
      this.populateForm(this.grossesse);
    }
    
    // S'abonner aux erreurs
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        // Gestion spécifique de l'erreur de conflit de grossesse active
        if (error.includes('grossesse active en cours') || error.includes('ACTIVE_PREGNANCY_EXISTS')) {
          this.handleActivePregnancyConflict(error);
        } else {
          this.snackBar.open(`Erreur : ${error}`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
    
    // Calculer automatiquement la DPA quand DDR change
    this.pregnancyInfoForm.get('dateDerniereRegle')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(ddr => {
      if (ddr) {
        const dpa = this.calculateDPA(ddr);
        this.medicalInfoForm.patchValue({ datePrevueAccouchment: dpa });
      }
    });

    // Surveiller les changements de sélection de patiente
    this.patientSelectionForm.get('idPatient')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(patientId => {
      if (patientId) {
        this.checkActivePregnancy(patientId);
      } else {
        this.hasActivePregnancy = false;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  populateForm(grossesse: GrossesseResponse): void {
    // Sélection de patiente
    this.patientSelectionForm.patchValue({
      idPatient: grossesse.patiente?.id || ''
    });
    
    // Informations de grossesse
    this.pregnancyInfoForm.patchValue({
      gestation: grossesse.gestation,
      parite: grossesse.parite,
      dateDerniereRegle: grossesse.dateDerniereRegle ? new Date(grossesse.dateDerniereRegle) : null,
      estDesiree: grossesse.estDesiree
    });
    
    // Informations médicales
    this.medicalInfoForm.patchValue({
      datePrevueAccouchment: grossesse.datePrevueAccouchment ? new Date(grossesse.datePrevueAccouchment) : null,
      dateDepacementTerme: grossesse.dateDepacementTerme ? new Date(grossesse.dateDepacementTerme) : null
    });
  }
  
  calculateDPA(ddr: Date): Date {
    const dpa = new Date(ddr);
    dpa.setDate(dpa.getDate() + 280); // 40 semaines = 280 jours
    return dpa;
  }
  
  calculateGestationalAge(): number {
    const ddr = this.pregnancyInfoForm.get('dateDerniereRegle')?.value;
    if (!ddr) return 0;
    
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - ddr.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7); // Semaines
  }
  
  getSelectedPatient(): PatienteResponse | null {
    const patientId = this.patientSelectionForm.get('idPatient')?.value;
    if (!patientId) return null;
    
    let selectedPatient: PatienteResponse | null = null;
    this.patients$.pipe(takeUntil(this.destroy$)).subscribe(patients => {
      selectedPatient = patients.find(p => p.id === patientId) || null;
    });
    return selectedPatient;
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
   * Détermine le titre du formulaire selon le contexte
   */
  get formTitle(): string {
    const action = this.isEdit ? 'Modifier' : 'Ajouter';
    return `${action} une grossesse`;
  }

  onSubmit(): void {
    // Valider tous les formulaires
    const formsToValidate = [
      this.patientSelectionForm,
      this.pregnancyInfoForm,
      this.medicalInfoForm
    ];
    
    let hasErrors = false;
    formsToValidate.forEach(form => {
      if (form.invalid) {
        this.markFormGroupTouched(form);
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    
    // Construire l'objet GrossesseRequest
    const grossesseData: GrossesseRequest = {
      gestation: this.pregnancyInfoForm.value.gestation,
      parite: this.pregnancyInfoForm.value.parite,
      dateDerniereRegle: this.pregnancyInfoForm.value.dateDerniereRegle,
      datePrevueAccouchment: this.medicalInfoForm.value.datePrevueAccouchment,
      dateDepacementTerme: this.medicalInfoForm.value.dateDepacementTerme,
      estDesiree: this.pregnancyInfoForm.value.estDesiree,
      idPatient: this.patientSelectionForm.value.idPatient
    };
    
    if (this.isEdit && this.grossesse?.id) {
      this.store.dispatch(GrossessesActions.updateGrossesse({ 
        id: this.grossesse.id, 
        request: grossesseData 
      }));
    } else {
      this.store.dispatch(GrossessesActions.createGrossesse({ 
        request: grossesseData 
      }));
    }
    
    // Le panel se fermera automatiquement via l'écoute des actions de succès
  }

  onCancel(): void {
    this.closePanel(false);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  calculatePatientAge(dateNaissance: string | Date): number {
    if (!dateNaissance) return 0;
    
    const today = new Date();
    const birthDate = typeof dateNaissance === 'string' ? new Date(dateNaissance) : dateNaissance;
    return today.getFullYear() - birthDate.getFullYear();
  }

  handleActivePregnancyConflict(error: string): void {
    const selectedPatient = this.getSelectedPatient();
    const patientName = selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : 'cette patiente';
    
    // Afficher un message d'erreur détaillé
    this.snackBar.open(
      `⚠️ ${patientName} a déjà une grossesse active en cours. Veuillez sélectionner une autre patiente ou terminer la grossesse existante.`,
      'Compris',
      {
        duration: 8000,
        panelClass: ['warning-snackbar']
      }
    );

    // Réinitialiser le formulaire de sélection de patiente
    this.patientSelectionForm.patchValue({ idPatient: '' });
  }

  filterPatients(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    this.filteredPatients$ = this.patients$.pipe(
      map(patients => patients.filter(patient => 
        patient.nom.toLowerCase().includes(this.searchTerm) ||
        patient.prenom.toLowerCase().includes(this.searchTerm) ||
        patient.cin.toLowerCase().includes(this.searchTerm) ||
        patient.telephone.includes(this.searchTerm)
      ))
    );
  }

  goBack(): void {
    this.closePanel(false);
  }

  /**
   * Détermine si le formulaire peut être soumis
   */
  get canSubmit(): boolean {
    return this.patientSelectionForm.valid && 
           this.pregnancyInfoForm.valid && 
           this.medicalInfoForm.valid;
  }

  checkActivePregnancy(patientId: string): void {
    // Charger les grossesses de cette patiente pour vérifier s'il y en a une active
    this.store.dispatch(GrossessesActions.loadGrossessesByPatient({ patientId }));
    
    // Note: Cette vérification est préventive côté client
    // Le serveur fera la vérification définitive lors de la soumission
    this.hasActivePregnancy = false; // Réinitialiser pour l'instant
  }
} 