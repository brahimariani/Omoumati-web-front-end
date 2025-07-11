import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { AccouchementRequest } from '../../../../core/models/accouchement/accouchement-request.model';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';
import { GrossesseResponse } from '../../../../core/models/grossesse/grossesse-response.model';
import { AccouchementsActions } from '../../../../store/accouchements/accouchements.actions';
import { GrossessesActions } from '../../../../store/grossesses/grossesses.actions';
import { selectSelectedGrossesse, selectGrossessesLoading } from '../../../../store/grossesses/grossesses.selectors';
import { selectSelectedAccouchement } from '../../../../store/accouchements/accouchements.selectors';

@Component({
  selector: 'app-accouchement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './accouchement-form.component.html',
  styleUrl: './accouchement-form.component.css'
})
export class AccouchementFormComponent implements OnInit, OnDestroy {
  @Input() accouchement?: AccouchementResponse;
  @Input() grossesseId?: string;
  @Input() patienteId?: string;
  @Output() formSubmit = new EventEmitter<AccouchementRequest>();
  @Output() formCancel = new EventEmitter<void>();

  accouchementForm!: FormGroup;
  isEditMode = false;
  isForGrossesse = false;
  private destroy$ = new Subject<void>();
  
  // Observables pour les données
  grossesse$: Observable<GrossesseResponse | null>;
  loading$: Observable<boolean>;
  
  // IDs récupérés depuis l'URL ou les inputs
  private currentGrossesseId: string | null = null;
  private currentPatienteId: string | null = null;

  // Options pour les sélecteurs
  modalitesExtraction = [
    { value: 'VOIE_BASSE', label: 'Voie basse', icon: 'child_care' },
    { value: 'CESARIENNE', label: 'Césarienne', icon: 'medical_services' },
    { value: 'FORCEPS', label: 'Forceps', icon: 'build' },
    { value: 'VENTOUSE', label: 'Ventouse', icon: 'healing' },
    { value: 'SPATULES', label: 'Spatules', icon: 'construction' }
  ];

  lieuxAccouchement = [
    { value: 'DOMICILE', label: 'Domicile', icon: 'home' },
    { value: 'HOPITAL', label: 'Hôpital', icon: 'local_hospital' },
    { value: 'CLINIQUE', label: 'Clinique', icon: 'business' },
    { value: 'MATERNITE', label: 'Maternité', icon: 'pregnant_woman' },
    { value: 'AUTRE', label: 'Autre', icon: 'location_on' }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.grossesse$ = this.store.select(selectSelectedGrossesse);
    this.loading$ = this.store.select(selectGrossessesLoading);
  }

  ngOnInit(): void {
    // Détecter le mode édition basé sur l'URL
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      // Si nous avons un paramètre 'id' dans l'URL et que l'URL contient 'edit', c'est un mode édition
      if (params['id'] && this.router.url.includes('/edit')) {
        this.isEditMode = true;
        this.initializeForm();
        this.determineFormModeFromExistingData();
      } else {
        this.isEditMode = !!this.accouchement;
        
        if (this.isEditMode) {
          this.initializeForm();
          this.determineFormModeFromExistingData();
        } else {
          this.determineFormMode();
          this.initializeForm();
          this.loadRequiredData();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private determineFormMode(): void {
    if (this.grossesseId) {
      this.isForGrossesse = true;
      this.currentGrossesseId = this.grossesseId;
    } else if (this.patienteId) {
      this.isForGrossesse = false;
      this.currentPatienteId = this.patienteId;
    } else {
      this.route.params.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        if (params['id']) {
          this.isForGrossesse = true;
          this.currentGrossesseId = params['id'];
        }
      });

      this.route.queryParams.pipe(
        takeUntil(this.destroy$)
      ).subscribe(queryParams => {
        if (queryParams['patienteId']) {
          this.isForGrossesse = false;
          this.currentPatienteId = queryParams['patienteId'];
        }
      });
    }
  }

  private determineFormModeFromExistingData(): void {
    // Si nous avons déjà l'accouchement en input, utiliser ses données
    if (this.accouchement) {
      this.setupFormForExistingAccouchement();
    } else {
      // Sinon, charger l'accouchement depuis l'URL
      this.route.params.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        if (params['id']) {
          this.store.dispatch(AccouchementsActions.loadAccouchement({ id: params['id'] }));
          
          // S'abonner à l'accouchement chargé
          this.store.select(selectSelectedAccouchement).pipe(
            takeUntil(this.destroy$),
            filter(accouchement => !!accouchement)
          ).subscribe(accouchement => {
            if (accouchement) {
              this.accouchement = accouchement;
              // Réinitialiser le formulaire avec les données de l'accouchement
              this.initializeForm();
              this.setupFormForExistingAccouchement();
            }
          });
        }
      });
    }
  }

  private setupFormForExistingAccouchement(): void {
    // Déterminer le mode basé sur les query params ou les données de l'accouchement
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(queryParams => {
      if (queryParams['patienteId']) {
        // Mode patiente (accouchement antérieur)
        this.isForGrossesse = false;
        this.currentPatienteId = queryParams['patienteId'];
        if (this.currentPatienteId) {
          this.updateFormWithPatienteData(this.currentPatienteId);
        }
      } else {
        // Essayer de déterminer depuis les données de l'accouchement
        // Si l'accouchement a un idPatient, c'est un accouchement antérieur
        // Si l'accouchement a une grossesse, c'est lié à une grossesse
        this.determineFormModeFromAccouchementData();
      }
    });
  }

  private determineFormModeFromAccouchementData(): void {
    if (this.accouchement) {
      // Logique pour déterminer le mode basé sur les données de l'accouchement
      // Cette logique dépend de la structure de votre AccouchementResponse
      // Pour l'instant, on assume que c'est un accouchement antérieur si on arrive ici
      this.isForGrossesse = false;
      // Vous devrez adapter cette logique selon votre modèle de données
    }
  }

  private loadRequiredData(): void {
    if (this.isForGrossesse && this.currentGrossesseId) {
      this.store.dispatch(GrossessesActions.loadGrossesse({ id: this.currentGrossesseId }));
      
      this.grossesse$.pipe(
        takeUntil(this.destroy$),
        filter(grossesse => !!grossesse)
      ).subscribe(grossesse => {
        if (grossesse) {
          this.updateFormWithGrossesseData(grossesse);
        }
      });
    } else if (!this.isForGrossesse && this.currentPatienteId) {
      this.updateFormWithPatienteData(this.currentPatienteId);
    }
  }

  private initializeForm(): void {
    this.accouchementForm = this.fb.group({
      date: [
        this.accouchement?.date || new Date(), 
        [Validators.required]
      ],
      
      modaliteExtraction: [
        this.accouchement?.modaliteExtraction || '', 
        [Validators.required]
      ],
      
      lieu: [
        this.accouchement?.lieu || '', 
        [Validators.required]
      ],
      
      assisstanceQualifiee: [
        this.accouchement?.assisstanceQualifiee ?? true
      ],
      
      observation: [
        this.accouchement?.observation || '',
        [Validators.maxLength(1000)]
      ],
      
      grossesse: [
        null
      ],
      
      idPatient: [
        ''
      ]
    });

    this.addConditionalValidation();
  }

  private addConditionalValidation(): void {
    this.accouchementForm.addValidators((control) => {
      const grossesse = control.get('grossesse')?.value;
      const idPatient = control.get('idPatient')?.value;
      
      if (!grossesse && !idPatient) {
        return { missingReference: true };
      }
      
      if (grossesse && idPatient) {
        return { conflictingReferences: true };
      }
      
      return null;
    });
  }
  
  private updateFormWithGrossesseData(grossesse: GrossesseResponse): void {
    this.accouchementForm.patchValue({
      grossesse: grossesse,
      idPatient: ''
    });
  }

  private updateFormWithPatienteData(patienteId: string): void {
    this.accouchementForm.patchValue({
      grossesse: null,
      idPatient: patienteId
    });
  }

  onSubmit(): void {
    if (this.accouchementForm.valid) {
      const formValue = this.accouchementForm.value;
      
      const accouchementData: AccouchementRequest = {
        date: formValue.date,
        modaliteExtraction: formValue.modaliteExtraction,
        lieu: formValue.lieu,
        assisstanceQualifiee: formValue.assisstanceQualifiee,
        observation: formValue.observation,
        grossesse: formValue.grossesse || null,
        idPatient: formValue.idPatient || ''
      };

      if (this.isEditMode && this.accouchement?.id) {
        this.store.dispatch(AccouchementsActions.updateAccouchement({
          id: this.accouchement.id,
          request: accouchementData
        }));
      } else {
        this.store.dispatch(AccouchementsActions.createAccouchement({
          request: accouchementData
        }));
      }

      this.formSubmit.emit(accouchementData);
      this.navigateAfterSubmit();
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
    this.navigateAfterCancel();
  }

  private navigateAfterSubmit(): void {
    if (this.isForGrossesse && this.currentGrossesseId) {
      this.router.navigate(['/grossesses', this.currentGrossesseId]);
    } else if (!this.isForGrossesse && this.currentPatienteId) {
      this.router.navigate(['/patientes', this.currentPatienteId]);
    } else {
      this.router.navigate(['/grossesses']);
    }
  }

  private navigateAfterCancel(): void {
    if (this.isForGrossesse && this.currentGrossesseId) {
      this.router.navigate(['/grossesses', this.currentGrossesseId]);
    } else if (!this.isForGrossesse && this.currentPatienteId) {
      this.router.navigate(['/patientes', this.currentPatienteId]);
    } else {
      this.router.navigate(['/grossesses']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.accouchementForm.controls).forEach(key => {
      const control = this.accouchementForm.get(key);
      control?.markAsTouched();
    });
  }

  get date() { return this.accouchementForm.get('date'); }
  get modaliteExtraction() { return this.accouchementForm.get('modaliteExtraction'); }
  get lieu() { return this.accouchementForm.get('lieu'); }
  get assisstanceQualifiee() { return this.accouchementForm.get('assisstanceQualifiee'); }
  get observation() { return this.accouchementForm.get('observation'); }

  isFormValid(): boolean {
    return this.accouchementForm.valid;
  }

  getFormTitle(): string {
    if (this.isEditMode) {
      return 'Modifier l\'accouchement';
    }
    return this.isForGrossesse ? 'Nouvel accouchement' : 'Accouchement antérieur';
  }

  getFormSubtitle(): string {
    if (this.isEditMode) {
      return 'Mettre à jour les informations d\'accouchement';
    }
    return this.isForGrossesse 
      ? 'Enregistrer un nouvel accouchement pour cette grossesse'
      : 'Enregistrer un accouchement antérieur pour cette patiente';
  }

  getModaliteIcon(modalite: string): string {
    const iconMap: { [key: string]: string } = {
      'VOIE_BASSE': 'child_care',
      'CESARIENNE': 'medical_services',
      'FORCEPS': 'build',
      'VENTOUSE': 'healing',
      'SPATULES': 'construction'
    };
    return iconMap[modalite] || 'help_outline';
  }

  getLieuIcon(lieu: string): string {
    const iconMap: { [key: string]: string } = {
      'DOMICILE': 'home',
      'HOPITAL': 'local_hospital',
      'CLINIQUE': 'business',
      'MATERNITE': 'pregnant_woman',
      'AUTRE': 'location_on'
    };
    return iconMap[lieu] || 'help_outline';
  }

  isNaturalDelivery(): boolean {
    return this.modaliteExtraction?.value === 'VOIE_BASSE';
  }

  isCesarean(): boolean {
    return this.modaliteExtraction?.value === 'CESARIENNE';
  }

  requiresSpecialCare(): boolean {
    const modalite = this.modaliteExtraction?.value;
    return ['CESARIENNE', 'FORCEPS', 'VENTOUSE'].includes(modalite);
  }
} 