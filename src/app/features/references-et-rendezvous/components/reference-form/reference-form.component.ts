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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, switchMap, filter } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { ReferenceRequest } from '../../../../core/models/reference/reference-request.model';
import { ReferenceResponse } from '../../../../core/models/reference/reference-response.model';
import { StatutReference } from '../../../../core/models/reference/statut.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { CentreResponse } from '../../../../core/models/centre/centre.response.model';

import { ReferenceService } from '../../../../core/services/reference.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';

import * as ReferencesActions from '../../../../store/references/references.actions';
import { PatientsActions } from '../../../../store/patients/patients.actions';
import { CentresActions } from '../../../../store/centres/centres.actions';
import { 
  selectSelectedReference,
  selectReferencesLoading,
  selectReferencesError
} from '../../../../store/references/references.selectors';
import * as PatientsSelectors from '../../../../store/patients/patients.selectors';
import * as CentresSelectors from '../../../../store/centres/centres.selectors';
import * as AuthSelectors from '../../../../store/auth/auth.selectors';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reference-form',
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
    MatTooltipModule,
    MatCheckboxModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  templateUrl: './reference-form.component.html',
  styleUrls: ['./reference-form.component.css']
})
export class ReferenceFormComponent implements OnInit, OnDestroy {
  @Input() reference?: ReferenceResponse;
  @Input() preselectedPatientId?: string;
  @Input() isEdit: boolean = false;
  @Input() viewOnly: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();

  referenceForm!: FormGroup;
  isEditMode = false;
  referenceId: string | null = null;
  
  // Observables du store
  selectedReference$ = this.store.select(selectSelectedReference);
  loading$ = this.store.select(selectReferencesLoading);
  error$ = this.store.select(selectReferencesError);
  patients$ = this.store.select(PatientsSelectors.selectAllPatients);
  centres$ = this.store.select(CentresSelectors.selectAllCentres);
  currentUserCentre$ = this.store.select(AuthSelectors.selectCurrentUserCentre);

  // Données filtrées pour les autocompletes
  filteredPatients$!: Observable<PatienteResponse[]>;
  filteredCentresDestination$!: Observable<CentreResponse[]>;

  // Options de statut
  statutOptions = Object.values(StatutReference);

  // Terme de recherche pour filtrer les patientes
  searchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private referenceService: ReferenceService,
    private authService: AuthService,
    private sidePanelService: SidePanelService,
    private snackBar: MatSnackBar,
    private actions$: Actions
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(ReferencesActions.createReferenceSuccess, ReferencesActions.updateReferenceSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closePanel(true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.referenceForm = this.fb.group({
      // Sélection de patiente
      patienteId: ['', [Validators.required]],
      
      // Informations de référence
      motif: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      
      // Centres
      centreOrigineId: [''], // Sera rempli automatiquement
      centreDestinationId: ['', [Validators.required]],
      centreDestinationSearch: [''],
      
      // Autres informations
      dateReference: [new Date(), [Validators.required]]
    });
  }

  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    // Charger les données nécessaires
    this.loadInitialData();
    
    // Configurer les observables de filtrage
    this.setupFilteredObservables();
    
    // Pré-remplir le centre d'origine avec le centre de l'utilisateur
    this.setUserCentreAsOrigine();
    
         // Vérifier si on utilise des inputs (mode side panel)
     if (this.reference && this.isEdit) {
       // Mode side panel avec référence fournie
       this.isEditMode = true;
       this.referenceId = this.reference.id;
       this.populateForm(this.reference);
     } else if (this.reference && this.viewOnly) {
       // Mode consultation uniquement
       this.isEditMode = false;
       this.populateForm(this.reference);
       this.referenceForm.disable(); // Désactiver le formulaire en mode lecture
     } else if (!this.reference && this.isEdit) {
       // Mode side panel sans référence (cas d'erreur)
       console.error('Mode édition mais aucune référence fournie');
     } else if (!this.reference && !this.isEdit) {
       // Mode side panel nouvelle référence
       this.isEditMode = false;
     } else {
       // Mode route classique
       this.handleRouteMode();
     }

    // Pré-sélectionner une patiente si fournie
    if (this.preselectedPatientId) {
      this.referenceForm.patchValue({
        patienteId: this.preselectedPatientId
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

  /**
   * Gérer le mode route classique (non side panel)
   */
  private handleRouteMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'nouveau') {
      // Mode édition via route
      this.isEditMode = true;
      this.referenceId = id;
      this.store.dispatch(ReferencesActions.loadReference({ id }));
      
      // S'abonner à la référence sélectionnée
      this.selectedReference$.pipe(
        takeUntil(this.destroy$),
        filter(ref => !!ref)
      ).subscribe(reference => {
        if (reference) {
          this.populateForm(reference);
        }
      });
    } else {
      // Mode création via route
      this.isEditMode = false;
    }
  }

  private loadInitialData(): void {
    // Charger les patientes avec une taille plus importante
    this.store.dispatch(PatientsActions.loadPatients({ page: 0, size: 1000 }));
    
    // Charger les centres
    this.store.dispatch(CentresActions.loadCentres({ page: 0, size: 1000 }));
  }

  private setupFilteredObservables(): void {
    // Initialiser avec tous les patients
    this.filteredPatients$ = this.patients$.pipe(
      map(patients => patients.slice(0, 50)) // Limiter l'affichage initial
    );

    // Filtrage des centres de destination
    this.filteredCentresDestination$ = this.referenceForm.get('centreDestinationSearch')!.valueChanges.pipe(
      startWith(''),
      switchMap(value => 
        combineLatest([this.centres$, this.currentUserCentre$]).pipe(
          map(([centres, userCentre]) => 
            this.filterCentresDestination(centres, value, userCentre)
          )
        )
      )
    );
  }

  private setUserCentreAsOrigine(): void {
    // Utiliser la méthode du service de référence pour obtenir l'ID du centre utilisateur
    this.authService.getCurrentUser().pipe(
      map(user => user?.centre?.id || null),
      takeUntil(this.destroy$)
    ).subscribe(centreId => {
      console.log('Centre ID utilisateur reçu:', centreId);
      if (centreId) {
        this.referenceForm.patchValue({
          centreOrigineId: centreId
        });
        console.log('Centre d\'origine défini:', centreId);
      } else {
        console.warn('Aucun centre défini pour l\'utilisateur actuel');
      }
    });
  }

  private populateForm(reference: ReferenceResponse): void {
    this.referenceForm.patchValue({
      patienteId: reference.patiente?.id || '',
      motif: reference.motif,
      centreOrigineId: reference.centreOrigine?.id || '',
      centreDestinationId: reference.centreDestination?.id || '',
      centreDestinationSearch: reference.centreDestination?.nom || '',
      statut: reference.statut,
      dateReference: new Date(reference.date)
    });
  }



  private filterCentresDestination(centres: CentreResponse[], searchTerm: any, userCentre: CentreResponse | null): CentreResponse[] {
    // Exclure le centre de l'utilisateur actuel
    let filteredCentres = centres.filter(centre => 
      !userCentre || centre.id !== userCentre.id
    );
    
    // Gérer le cas où searchTerm est un objet (option sélectionnée) ou une string
    const searchValue = typeof searchTerm === 'string' ? searchTerm : (searchTerm?.nom || '');
    
    if (!searchValue || searchValue.trim() === '') {
      return filteredCentres.slice(0, 50);
    }
    
    const filterValue = searchValue.toLowerCase();
    return filteredCentres.filter(centre => 
      centre.nom.toLowerCase().includes(filterValue) ||
      centre.adresse?.toLowerCase().includes(filterValue)
    ).slice(0, 50);
  }

  /**
   * Filtrer les patientes selon le terme de recherche (méthode publique comme dans grossesse-form)
   */
  filterPatients(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    this.filteredPatients$ = this.patients$.pipe(
      map(patients => patients.filter(patient => 
        patient.nom.toLowerCase().includes(this.searchTerm) ||
        patient.prenom.toLowerCase().includes(this.searchTerm) ||
        patient.cin?.toLowerCase().includes(this.searchTerm) ||
        patient.telephone?.includes(this.searchTerm)
      ).slice(0, 50))
    );
  }

  /**
   * Récupérer la patiente sélectionnée (comme dans grossesse-form)
   */
  getSelectedPatient(): PatienteResponse | null {
    const patientId = this.referenceForm.get('patienteId')?.value;
    if (!patientId) return null;
    
    let selectedPatient: PatienteResponse | null = null;
    this.patients$.pipe(takeUntil(this.destroy$)).subscribe(patients => {
      selectedPatient = patients.find(p => p.id === patientId) || null;
    });
    return selectedPatient;
  }



  // Méthodes pour la sélection de centre de destination
  onCentreDestinationSelected(centre: CentreResponse): void {
    this.referenceForm.patchValue({
      centreDestinationId: centre.id,
      centreDestinationSearch: centre.nom
    });
  }

  displayCentre(centre: CentreResponse): string {
    return centre ? centre.nom : '';
  }

  /**
   * Récupérer le centre de destination sélectionné
   */
  getSelectedCentreDestination(): CentreResponse | null {
    const centreId = this.referenceForm.get('centreDestinationId')?.value;
    if (!centreId) return null;
    
    let selectedCentre: CentreResponse | null = null;
    this.centres$.pipe(takeUntil(this.destroy$)).subscribe(centres => {
      selectedCentre = centres.find(c => c.id === centreId) || null;
    });
    return selectedCentre;
  }



  getStatutLabel(statut: StatutReference): string {
    return this.referenceService.getStatutLabel(statut);
  }

  onSubmit(): void {
    if (this.referenceForm.valid) {
      const referenceData: ReferenceRequest = {
        patiente: this.referenceForm.value.patienteId,
        motif: this.referenceForm.value.motif,
        centreOrigine: this.referenceForm.value.centreOrigineId,
        centreDestination: this.referenceForm.value.centreDestinationId,
        statut: StatutReference.PENDING,
        date: this.referenceForm.value.dateReference
      };

      if (this.isEditMode && this.referenceId) {
        // Mise à jour
        this.store.dispatch(ReferencesActions.updateReference({ 
          id: this.referenceId, 
          reference: referenceData 
        }));
      } else {
        // Création
        this.store.dispatch(ReferencesActions.createReference({ reference: referenceData }));
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.referenceForm.controls).forEach(key => {
      const control = this.referenceForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifier si on est dans le side panel
   */
  private isInSidePanel(): boolean {
    return this.reference !== undefined || this.isEdit !== undefined;
  }

  /**
   * Annuler l'opération
   */
  cancel(): void {
    if (this.isInSidePanel()) {
      this.closePanel(false);
    } else {
      this.goBack();
    }
  }

  onCancel(): void {
    this.cancel();
  }

  onReset(): void {
    this.referenceForm.reset();
    this.referenceForm.patchValue({
      dateReference: new Date()
    });
    this.setUserCentreAsOrigine();
  }

  /**
   * Fermer le side panel et émettre l'événement
   */
  closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }

  /**
   * Retourner à la page précédente (mode route)
   */
  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  get formTitle(): string {
    if (this.viewOnly) {
      return 'Détails de la référence';
    }
    return this.isEditMode ? 'Modifier la référence' : 'Nouvelle référence';
  }

  // Méthodes de validation et d'erreur
  get patienteError(): string {
    const control = this.referenceForm.get('patienteId');
    if (control?.hasError('required') && control?.touched) {
      return 'La patiente est obligatoire';
    }
    return '';
  }

  get motifError(): string {
    const control = this.referenceForm.get('motif');
    if (control?.hasError('required') && control?.touched) {
      return 'Le motif est obligatoire';
    }
    if (control?.hasError('minlength') && control?.touched) {
      return 'Le motif doit contenir au moins 10 caractères';
    }
    if (control?.hasError('maxlength') && control?.touched) {
      return 'Le motif ne peut pas dépasser 500 caractères';
    }
    return '';
  }

  get centreDestinationError(): string {
    const control = this.referenceForm.get('centreDestinationId');
    if (control?.hasError('required') && control?.touched) {
      return 'Le centre de destination est obligatoire';
    }
    return '';
  }

  get dateError(): string {
    const control = this.referenceForm.get('dateReference');
    if (control?.hasError('required') && control?.touched) {
      return 'La date de référence est obligatoire';
    }
    return '';
  }

  /**
   * Calculer l'âge d'une patiente
   */
  calculatePatientAge(dateNaissance: string | Date): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Obtenir le nom du centre d'origine
   */
  get centreOrigineName(): Observable<string> {
    return this.authService.getCurrentUser().pipe(
      map(user => user?.centre?.nom || 'Centre non défini')
    );
  }
}
