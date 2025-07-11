import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { NaissanceRequest } from '../../../../core/models/naissance/naissance-request.model';
import { NaissanceResponse } from '../../../../core/models/naissance/naissance-response.model';
import { NaissancesActions } from '../../../../store/naissances';

@Component({
  selector: 'app-naissance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatSliderModule
  ],
  templateUrl: './naissance-form.component.html',
  styleUrl: './naissance-form.component.css'
})

//TODO : move this to naissance feature module
export class NaissanceFormComponent implements OnInit, OnDestroy {
  @Input() naissance?: NaissanceResponse;
  @Input() accouchementId?: string;
  @Output() formSubmit = new EventEmitter<NaissanceRequest>();
  @Output() formCancel = new EventEmitter<void>();

  naissanceForm!: FormGroup;
  isEditMode = false;
  private destroy$ = new Subject<void>();

  // Options pour les sélecteurs
  sexeOptions = [
    { value: 'MASCULIN', label: 'Masculin', icon: 'male', color: '#2196f3' },
    { value: 'FEMININ', label: 'Féminin', icon: 'female', color: '#e91e63' },
    { value: 'INDETERMINE', label: 'Indéterminé', icon: 'help', color: '#9e9e9e' }
  ];

  // Plages de poids pour évaluation
  poidsRanges = {
    tresFaible: { min: 0, max: 1500, label: 'Très faible poids', color: '#f44336', icon: 'warning' },
    faible: { min: 1500, max: 2500, label: 'Faible poids', color: '#ff9800', icon: 'info' },
    normal: { min: 2500, max: 4000, label: 'Poids normal', color: '#4caf50', icon: 'check_circle' },
    eleve: { min: 4000, max: 6000, label: 'Poids élevé', color: '#ff9800', icon: 'info' },
    tresEleve: { min: 6000, max: 10000, label: 'Très élevé', color: '#f44336', icon: 'warning' }
  };

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.naissance;
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.naissanceForm = this.fb.group({
      // Poids en grammes
      poids: [
        this.naissance?.poids || 3000, 
        [Validators.required, Validators.min(500), Validators.max(8000)]
      ],
      
      // Périmètre crânien en cm
      perimetreCranien: [
        this.naissance?.perimetreCranien || 35, 
        [Validators.required, Validators.min(25), Validators.max(45)]
      ],
      
      // Sexe du bébé
      sexe: [
        this.naissance?.sexe || '', 
        [Validators.required]
      ],
      
      // État vital
      estVivant: [
        this.naissance?.estVivant ?? true
      ],
      
      // ID de l'accouchement (caché)
      accouchement: [
        null, 
        [Validators.required]
      ]
    });
  }

  onSubmit(): void {
    if (this.naissanceForm.valid) {
      const formValue = this.naissanceForm.value;
      
      const naissanceData: NaissanceRequest = {
        poids: formValue.poids,
        perimetreCranien: formValue.perimetreCranien,
        sexe: formValue.sexe,
        estVivant: formValue.estVivant,
        accouchement: formValue.accouchement
      };

      if (this.isEditMode && this.naissance?.id) {
        this.store.dispatch(NaissancesActions.updateNaissance({
          id: this.naissance.id,
          request: naissanceData
        }));
      } else {
        this.store.dispatch(NaissancesActions.createNaissance({
          request: naissanceData
        }));
      }

      this.formSubmit.emit(naissanceData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.naissanceForm.controls).forEach(key => {
      const control = this.naissanceForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour faciliter l'accès aux contrôles dans le template
  get poids() { return this.naissanceForm.get('poids'); }
  get perimetreCranien() { return this.naissanceForm.get('perimetreCranien'); }
  get sexe() { return this.naissanceForm.get('sexe'); }
  get estVivant() { return this.naissanceForm.get('estVivant'); }

  // Méthodes utilitaires
  isFormValid(): boolean {
    return this.naissanceForm.valid;
  }

  getSexeIcon(sexe: string): string {
    const found = this.sexeOptions.find(s => s.value === sexe);
    return found ? found.icon : 'help';
  }

  getSexeColor(sexe: string): string {
    const found = this.sexeOptions.find(s => s.value === sexe);
    return found ? found.color : '#9e9e9e';
  }

  getPoidsEvaluation(): any {
    const poids = this.poids?.value || 0;
    
    for (const [key, range] of Object.entries(this.poidsRanges)) {
      if (poids >= range.min && poids < range.max) {
        return range;
      }
    }
    
    return this.poidsRanges.normal;
  }

  isPoidsNormal(): boolean {
    const poids = this.poids?.value || 0;
    return poids >= 2500 && poids < 4000;
  }

  isPoidsPreoccupant(): boolean {
    const poids = this.poids?.value || 0;
    return poids < 1500 || poids > 4500;
  }

  getPerimetreCranienEvaluation(): string {
    const pc = this.perimetreCranien?.value || 0;
    
    if (pc < 32) return 'Microcéphalie possible';
    if (pc > 38) return 'Macrocéphalie possible';
    return 'Périmètre normal';
  }

  isPerimetreCranienNormal(): boolean {
    const pc = this.perimetreCranien?.value || 0;
    return pc >= 32 && pc <= 38;
  }

  formatPoids(poids: number): string {
    if (poids >= 1000) {
      return `${(poids / 1000).toFixed(2)} kg`;
    }
    return `${poids} g`;
  }

  getIMCEstime(): number {
    // Estimation très approximative pour un nouveau-né
    const poids = this.poids?.value || 0;
    const pc = this.perimetreCranien?.value || 0;
    
    if (pc === 0) return 0;
    
    // Formule approximative basée sur le périmètre crânien
    const tailleEstimee = pc * 1.5; // cm
    return poids / ((tailleEstimee / 100) ** 2);
  }
} 