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

import { RendezVousRequestDto } from '../../../../core/models/rendez-vous/rendez-vous-request.model';
import { RendezVousResponseDto } from '../../../../core/models/rendez-vous/rendez-vous-response.model';
import { StatutRendezVous } from '../../../../core/models/rendez-vous/statut.model';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { CentreResponse } from '../../../../core/models/centre/centre.response.model';

import { RendezVousService } from '../../../../core/services/rendez-vous.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';

import * as RendezVousActions from '../../../../store/rendez-vous/rendez-vous.actions';
import { PatientsActions } from '../../../../store/patients/patients.actions';
import { CentresActions } from '../../../../store/centres/centres.actions';
import { 
  selectSelectedRendezVous,
  selectRendezVousLoading,
  selectRendezVousError
} from '../../../../store/rendez-vous/rendez-vous.selectors';
import * as PatientsSelectors from '../../../../store/patients/patients.selectors';
import * as CentresSelectors from '../../../../store/centres/centres.selectors';
import * as AuthSelectors from '../../../../store/auth/auth.selectors';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-rendez-vous-form',
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
  templateUrl: './rendez-vous-form.component.html',
  styleUrls: ['./rendez-vous-form.component.css']
})
export class RendezVousFormComponent implements OnInit, OnDestroy {
  @Input() rendezVous?: RendezVousResponseDto;
  @Input() preselectedPatientId?: string;
  @Input() isEdit: boolean = false;
  @Input() viewOnly: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();

  rendezVousForm!: FormGroup;
  isEditMode = false;
  rendezVousId: string | null = null;
  
  // Observables du store
  selectedRendezVous$ = this.store.select(selectSelectedRendezVous);
  loading$ = this.store.select(selectRendezVousLoading);
  error$ = this.store.select(selectRendezVousError);
  
  // Observables pour les patients et centres
  patients$ = this.store.select(PatientsSelectors.selectAllPatients);
  centres$ = this.store.select(CentresSelectors.selectAllCentres);
  currentUser$ = this.store.select(AuthSelectors.selectCurrentUser);
  
  // Observables filtrées pour l'autocomplétion
  filteredPatients$!: Observable<PatienteResponse[]>;
  filteredCentres$!: Observable<CentreResponse[]>;
  centreUserName$!: Observable<string>;
  
  // Options de statut
  statutOptions = Object.values(StatutRendezVous);
  
  // Heures disponibles
  heuresDisponibles: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private rendezVousService: RendezVousService,
    private sidePanelService: SidePanelService,
    private authService: AuthService,
    private actions$: Actions
  ) {
    this.initializeForm();
    this.generateHeuresDisponibles();
  }

  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(RendezVousActions.createRendezVousSuccess, RendezVousActions.updateRendezVousSuccess),
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
    this.rendezVousForm = this.fb.group({
      // Sélection de patiente
      patienteId: ['', [Validators.required]],
      patienteSearch: [''],
      
      // Informations de rendez-vous
      motif: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      
      // Date et heure
      dateRendezVous: [new Date(), [Validators.required]],
      heure: ['', [Validators.required]],
      
      // Centre
      centreId: [''], // Sera rempli automatiquement
      centreSearch: [''],
      
      // Statut (pour modification)
      statut: [StatutRendezVous.PENDING]
    });
  }

  /**
   * Générer les heures disponibles (de 8h à 18h par tranches de 30 minutes)
   */
  private generateHeuresDisponibles(): void {
    const heures = [];
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const heure = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        heures.push(heure);
      }
    }
    this.heuresDisponibles = heures;
  }

  /**
   * Initialiser le composant une fois les données assignées
   */
  private initializeComponent(): void {
    // Charger les données nécessaires
    this.loadInitialData();
    
    // Configurer les observables de filtrage
    this.setupFilteredObservables();
    
    // Pré-remplir le centre avec le centre de l'utilisateur
    this.setUserCentreAsDefault();
    
    // Vérifier si on utilise des inputs (mode side panel)
    if (this.rendezVous && this.isEdit) {
      // Mode side panel avec rendez-vous fourni
      this.isEditMode = true;
      this.rendezVousId = this.rendezVous.id;
      this.populateForm(this.rendezVous);
    } else if (this.rendezVous && this.viewOnly) {
      // Mode consultation uniquement
      this.isEditMode = false;
      this.populateForm(this.rendezVous);
      this.rendezVousForm.disable(); // Désactiver le formulaire en mode lecture
    } else if (!this.rendezVous && this.isEdit) {
      // Mode side panel sans rendez-vous (cas d'erreur)
      console.error('Mode édition mais aucun rendez-vous fourni');
    } else if (!this.rendezVous && !this.isEdit) {
      // Mode side panel nouveau rendez-vous
      this.isEditMode = false;
    } else {
      // Mode route classique
      this.handleRouteMode();
    }

    // Pré-sélectionner une patiente si fournie
    if (this.preselectedPatientId) {
      this.rendezVousForm.patchValue({
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
      this.rendezVousId = id;
      this.store.dispatch(RendezVousActions.loadRendezVousById({ id }));
      
      // S'abonner au rendez-vous sélectionné
      this.selectedRendezVous$.pipe(
        takeUntil(this.destroy$),
        filter(rdv => !!rdv)
      ).subscribe(rendezVous => {
        if (rendezVous) {
          this.populateForm(rendezVous);
        }
      });
    } else {
      // Mode création via route
      this.isEditMode = false;
    }
  }

  /**
   * Charger les données initiales
   */
  private loadInitialData(): void {
    // Charger les patients
    this.store.dispatch(PatientsActions.loadPatients({ 
      page: 0, 
      size: 1000 
    }));
    
    // Charger les centres
    this.store.dispatch(CentresActions.loadCentres({ 
      page: 0, 
      size: 1000 
    }));
  }

  /**
   * Configurer les observables de filtrage
   */
  private setupFilteredObservables(): void {
    // Filtrage des patients
    this.filteredPatients$ = this.rendezVousForm.get('patienteSearch')!.valueChanges.pipe(
      startWith(''),
      switchMap(value => 
        this.patients$.pipe(
          map(patients => this.filterPatientsInternal(patients || [], value || ''))
        )
      )
    );

    // Filtrage des centres
    this.filteredCentres$ = this.rendezVousForm.get('centreSearch')!.valueChanges.pipe(
      startWith(''),
      switchMap(value => 
        this.centres$.pipe(
          map(centres => this.filterCentresInternal(centres || [], value || ''))
        )
      )
    );

    // Nom du centre utilisateur
    this.centreUserName$ = this.currentUser$.pipe(
      map(user => user?.centre?.nom || 'Non assigné')
    );
  }

  /**
   * Filtrer les patients par recherche (privé)
   */
  private filterPatientsInternal(patients: PatienteResponse[], search: string | any): PatienteResponse[] {
    if (!search) return patients;
    
    // Si search est un objet (sélection d'autocomplétion), extraire le nom
    let searchString = '';
    if (typeof search === 'string') {
      searchString = search;
    } else if (search && typeof search === 'object' && search.nom && search.prenom) {
      searchString = `${search.prenom} ${search.nom}`;
    } else {
      return patients;
    }
    
    const searchLower = searchString.trim().toLowerCase();
    return patients.filter(patient => 
      patient.nom.toLowerCase().includes(searchLower) ||
      patient.prenom.toLowerCase().includes(searchLower) ||
      patient.cin?.toLowerCase().includes(searchLower) ||
      patient.telephone?.includes(searchString)
    );
  }

  /**
   * Filtrer les centres par recherche (privé)
   */
  private filterCentresInternal(centres: CentreResponse[], search: string | any): CentreResponse[] {
    if (!search) return centres;
    
    // Si search est un objet (sélection d'autocomplétion), extraire le nom
    let searchString = '';
    if (typeof search === 'string') {
      searchString = search;
    } else if (search && typeof search === 'object' && search.nom) {
      searchString = search.nom;
    } else {
      return centres;
    }
    
    const searchLower = searchString.trim().toLowerCase();
    return centres.filter(centre => 
      centre.nom.toLowerCase().includes(searchLower) ||
      centre.adresse?.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Filtrer les patients pour la recherche (utilisé dans le template)
   */
  filterPatients(searchTerm: string): void {
    this.rendezVousForm.patchValue({
      patienteSearch: searchTerm
    });
  }

  /**
   * Pré-remplir le centre avec le centre de l'utilisateur
   */
  private setUserCentreAsDefault(): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$),
      filter(user => !!user?.centre)
    ).subscribe(user => {
      if (user?.centre) {
        this.rendezVousForm.patchValue({
          centreId: user.centre.id,
          centreSearch: user.centre.nom
        });
      }
    });
  }

  /**
   * Remplir le formulaire avec les données existantes
   */
  private populateForm(rendezVous: RendezVousResponseDto): void {
    // Extraire la date et l'heure
    const dateRendezVous = new Date(rendezVous.date);
    const heure = `${dateRendezVous.getHours().toString().padStart(2, '0')}:${dateRendezVous.getMinutes().toString().padStart(2, '0')}`;
    
    this.rendezVousForm.patchValue({
      patienteId: rendezVous.patiente?.id || '',
      patienteSearch: rendezVous.patiente ? `${rendezVous.patiente.prenom} ${rendezVous.patiente.nom}` : '',
      motif: rendezVous.motif,
      dateRendezVous: dateRendezVous,
      heure: heure,
      centreId: rendezVous.centre?.id || '',
      centreSearch: rendezVous.centre?.nom || '',
      statut: rendezVous.statut
    });
  }

  /**
   * Sélectionner une patiente
   */
  onPatienteSelected(patiente: PatienteResponse): void {
    this.rendezVousForm.patchValue({
      patienteId: patiente.id,
      patienteSearch: `${patiente.prenom} ${patiente.nom}`
    });
  }

  /**
   * Sélectionner un centre
   */
  onCentreSelected(centre: CentreResponse): void {
    this.rendezVousForm.patchValue({
      centreId: centre.id,
      centreSearch: centre.nom
    });
  }

  /**
   * Vérifier les conflits d'horaires
   */
  checkConflicts(): void {
    const formValue = this.rendezVousForm.value;
    if (formValue.dateRendezVous && formValue.heure && formValue.patienteId) {
      const dateTime = new Date(formValue.dateRendezVous);
      const [heures, minutes] = formValue.heure.split(':');
      dateTime.setHours(parseInt(heures), parseInt(minutes));
      
      this.store.dispatch(RendezVousActions.checkConflitsHoraires({
        date: dateTime.toISOString(),
        patienteId: formValue.patienteId,
        rendezVousId: this.isEditMode && this.rendezVousId ? this.rendezVousId : undefined
      }));
    }
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.rendezVousForm.valid) {
      const formValue = this.rendezVousForm.value;
      
      // Combiner date et heure
      const dateRendezVous = new Date(formValue.dateRendezVous);
      const [heures, minutes] = formValue.heure.split(':');
      dateRendezVous.setHours(parseInt(heures), parseInt(minutes));
      
      const rendezVousData: RendezVousRequestDto = {
        date: dateRendezVous.toISOString(),
        motif: formValue.motif,
        statut: formValue.statut,
        patiente: formValue.patienteId,
        centre: formValue.centreId
      };

      if (this.isEditMode && this.rendezVousId) {
        this.store.dispatch(RendezVousActions.updateRendezVous({
          id: this.rendezVousId,
          rendezVous: rendezVousData
        }));
      } else {
        this.store.dispatch(RendezVousActions.createRendezVous({
          rendezVous: rendezVousData
        }));
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  /**
   * Fonctions d'affichage pour l'autocomplétion
   */
  displayPatiente(patiente: PatienteResponse): string {
    return patiente ? `${patiente.prenom} ${patiente.nom}` : '';
  }

  displayCentre(centre: CentreResponse): string {
    return centre ? centre.nom : '';
  }

  /**
   * Getters pour les erreurs de formulaire
   */
  get motifError(): string | null {
    const control = this.rendezVousForm.get('motif');
    if (control?.hasError('required') && control?.touched) {
      return 'Le motif est requis';
    }
    if (control?.hasError('minlength') && control?.touched) {
      return 'Le motif doit contenir au moins 5 caractères';
    }
    if (control?.hasError('maxlength') && control?.touched) {
      return 'Le motif ne peut pas dépasser 500 caractères';
    }
    return null;
  }

  get patienteError(): string | null {
    const control = this.rendezVousForm.get('patienteId');
    if (control?.hasError('required') && control?.touched) {
      return 'La sélection d\'une patiente est requise';
    }
    return null;
  }

  get dateError(): string | null {
    const control = this.rendezVousForm.get('dateRendezVous');
    if (control?.hasError('required') && control?.touched) {
      return 'La date du rendez-vous est requise';
    }
    return null;
  }

  get heureError(): string | null {
    const control = this.rendezVousForm.get('heure');
    if (control?.hasError('required') && control?.touched) {
      return 'L\'heure du rendez-vous est requise';
    }
    return null;
  }

  get centreError(): string | null {
    const control = this.rendezVousForm.get('centreId');
    if (control?.hasError('required') && control?.touched) {
      return 'La sélection d\'un centre est requise';
    }
    return null;
  }

  /**
   * Fonctions utilitaires
   */
  getStatutLabel(statut: StatutRendezVous): string {
    return this.rendezVousService.getStatutLabel(statut);
  }

  getStatutClass(statut: StatutRendezVous): string {
    return this.rendezVousService.getStatutClass(statut);
  }

  getStatutColor(statut: StatutRendezVous): string {
    return this.rendezVousService.getStatutColor(statut);
  }

  /**
   * Marquer tous les champs comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.rendezVousForm.controls).forEach(key => {
      const control = this.rendezVousForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifier si on est dans le side panel
   */
  private isInSidePanel(): boolean {
    return this.rendezVous !== undefined || this.isEdit !== undefined;
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
    this.rendezVousForm.reset();
    this.rendezVousForm.patchValue({
      dateRendezVous: new Date(),
      statut: StatutRendezVous.PENDING
    });
    this.setUserCentreAsDefault();
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
      return 'Détails du rendez-vous';
    }
    return this.isEditMode ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous';
  }
} 