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
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';

import { Groupage } from '../../../../core/models/patiente/groupage.model';
import { Rhesus } from '../../../../core/models/patiente/rhesus.model';
import { PatienteRequest } from '../../../../core/models/patiente/patiente.request.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { AntecedentRequest } from '../../../../core/models/antecedent/antecedent.request.model';
import { AntecedentResponse } from '../../../../core/models/antecedent/antecedent.response.model';
import { PatientsActions } from '../../../../store/patients/patients.actions';
import { selectSelectedPatient, selectPatientsLoading, selectPatientsError } from '../../../../store/patients/patients.selectors';
import { NiveauInstruction } from '../../../../core/models/patiente/niveauinstruction.model';
import { Sexe } from '../../../../core/models/patiente/sexe.model';
import { SidePanelService } from '../../../../core/services/side-panel.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit, OnDestroy {
  @Input() patient?: PatienteResponse;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();
  
  isEditMode = false;
  patientId: string | null = null;
  
  // Formulaires multi-étapes
  personalInfoForm: FormGroup = this.fb.group({});
  contactInfoForm: FormGroup = this.fb.group({});
  spouseInfoForm: FormGroup = this.fb.group({});
  medicalInfoForm: FormGroup = this.fb.group({});
  antecedentsForm: FormGroup = this.fb.group({});
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  patient$: Observable<PatienteResponse | null>;
  
  // Options pour les sélecteurs
  groupeSanguins = Object.values(Groupage);
  rhesusOptions = Object.values(Rhesus);
  sexes = Object.values(Sexe);
  niveauxInstruction = Object.values(NiveauInstruction);
  
  // Types d'antécédents
  typesAntecedents = [
    'MEDICAL',
    'CHIRURGICAL',
    'OBSTETRICAL',
    'GYNECOLOGIQUE',
    'FAMILIAL',
    'ALLERGIQUE',
    'MEDICAMENTEUX'
  ];
  
  naturesAntecedents = [
    'HYPERTENSION',
    'DIABETE',
    'CARDIOPATHIE',
    'ASTHME',
    'EPILEPSIE',
    'DEPRESSION',
    'CESARIENNE',
    'FAUSSE_COUCHE',
    'ACCOUCHEMENT_PREMATURE',
    'MORT_FOETALE',
    'MALFORMATION',
    'AUTRE'
  ];
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(selectPatientsLoading);
    this.error$ = this.store.select(selectPatientsError);
    this.patient$ = this.store.select(selectSelectedPatient);
    
    this.initializeForms();
  }
  
  private initializeForms(): void {
    // Formulaire des informations personnelles
    this.personalInfoForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dateNaissance: ['', Validators.required],
      cin: ['', [Validators.required, Validators.maxLength(20)]],
      sexe: [Sexe.FEMME, Validators.required],
      niveauInstruction: [NiveauInstruction.SANS, Validators.required],
      profession: ['', [Validators.maxLength(100)]]
    });
    
    // Formulaire des coordonnées
    this.contactInfoForm = this.fb.group({
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      adresse: ['', [Validators.required, Validators.maxLength(255)]]
    });
    
    // Formulaire des informations du conjoint
    this.spouseInfoForm = this.fb.group({
      telephoneMari: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      professionMari: ['', [Validators.maxLength(100)]]
    });
    
    // Formulaire des informations médicales
    this.medicalInfoForm = this.fb.group({
      groupageSanguin: ['', Validators.required],
      rhesus: ['', Validators.required],
      consanguinite: [false],
      observation: ['', [Validators.maxLength(1000)]]
    });
    
    // Formulaire des antécédents
    this.antecedentsForm = this.fb.group({
      antecedents: this.fb.array([])
    });
  }
  
  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(PatientsActions.createPatientSuccess, PatientsActions.updatePatientSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closePanel(true);
    });
  }
  
  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    // Vérifier si on utilise des inputs (mode side panel)
    if (this.patient && this.isEdit) {
      // Mode side panel avec patient fourni
      this.isEditMode = true;
      this.patientId = this.patient.id;
      this.populateForm(this.patient);
    } else if (!this.patient && this.isEdit) {
      // Mode side panel sans patient (cas d'erreur)
      console.error('Mode édition mais aucun patient fourni');
    } else if (!this.patient && !this.isEdit) {
      // Mode side panel création (rien à faire, formulaire vide)
      this.isEditMode = false;
    } else {
      // Mode route classique
      this.route.paramMap.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.patientId = id;
          this.store.dispatch(PatientsActions.loadPatient({ id }));
          
          // Souscrire aux changements de la patiente sélectionnée
          this.patient$.pipe(
            takeUntil(this.destroy$)
          ).subscribe(patient => {
            if (patient) {
              this.populateForm(patient);
            }
          });
        }
      });
    }
    
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
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  populateForm(patient: PatienteResponse): void {
    // Informations personnelles
    this.personalInfoForm.patchValue({
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance ? new Date(patient.dateNaissance) : null,
      cin: patient.cin || '',
      sexe: patient.sexe,
      niveauInstruction: patient.niveauInstruction,
      profession: patient.profession || ''
    });
    
    // Coordonnées
    this.contactInfoForm.patchValue({
      telephone: patient.telephone,
      email: patient.email || '',
      adresse: patient.adresse || ''
    });
    
    // Informations du conjoint
    this.spouseInfoForm.patchValue({
      telephoneMari: patient.telephoneMari || '',
      professionMari: patient.professionMari || ''
    });
    
    // Informations médicales
    this.medicalInfoForm.patchValue({
      groupageSanguin: patient.groupageSanguin,
      rhesus: patient.rhesus,
      consanguinite: patient.consanguinite || false,
      observation: patient.observation || ''
    });
  }
  
  onSubmit(): void {
    // Valider tous les formulaires
    const formsToValidate = [
      this.personalInfoForm,
      this.contactInfoForm,
      this.spouseInfoForm,
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
    
    // Construire l'objet PatienteRequest avec toutes les informations
    const patientData: PatienteRequest = {
      // Informations personnelles
      nom: this.personalInfoForm.value.nom,
      prenom: this.personalInfoForm.value.prenom,
      dateNaissance: this.personalInfoForm.value.dateNaissance,
      cin: this.personalInfoForm.value.cin,
      sexe: this.personalInfoForm.value.sexe,
      niveauInstruction: this.personalInfoForm.value.niveauInstruction,
      profession: this.personalInfoForm.value.profession,
      
      // Coordonnées
      telephone: this.contactInfoForm.value.telephone,
      email: this.contactInfoForm.value.email,
      adresse: this.contactInfoForm.value.adresse,
      
      // Informations du conjoint
      telephoneMari: this.spouseInfoForm.value.telephoneMari,
      professionMari: this.spouseInfoForm.value.professionMari,
      
      // Informations médicales
      groupageSanguin: this.medicalInfoForm.value.groupageSanguin,
      rhesus: this.medicalInfoForm.value.rhesus,
      consanguinite: this.medicalInfoForm.value.consanguinite,
      observation: this.medicalInfoForm.value.observation
    };
    
    try {
      if (this.isEditMode && this.patientId) {
        this.store.dispatch(PatientsActions.updatePatient({ 
          id: this.patientId, 
          request: patientData 
        }));
      } else {
        this.store.dispatch(PatientsActions.createPatient({ request: patientData }));
      }
      
      // Si ce n'est pas un side panel, rediriger vers la liste
      if (!this.isInSidePanel()) {
        setTimeout(() => {
          this.router.navigate(['/patientes']);
        }, 1500);
      }
      // Sinon, le panel se fermera automatiquement via l'écoute des actions de succès
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  /**
   * Vérifier si le composant est dans un side panel
   */
  private isInSidePanel(): boolean {
    return this.onClose.observed; // Si quelqu'un écoute l'événement onClose, c'est un side panel
  }
  
  /**
   * Annuler et fermer (pour side panel)
   */
  cancel(): void {
    this.closePanel(false);
  }
  
  /**
   * Détermine le titre du formulaire selon le contexte
   */
  get formTitle(): string {
    const action = this.isEditMode ? 'Modifier' : 'Ajouter';
    return `${action} une patiente`;
  }
  
  // Utilitaire pour marquer tous les contrôles d'un FormGroup comme touchés
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/patientes']);
  }
  
  /**
   * Fermer le panel
   */
  closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }
}
