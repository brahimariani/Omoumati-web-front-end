import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ConsultationsActions } from '../../../store/consultations/consultations.actions';
import * as ConsultationsSelectors from '../../../store/consultations/consultations.selectors';
import { ConsultationRequest } from '../../../core/models/consultation/consultation-request.model';
import { ConsultationResponse } from '../../../core/models/consultation/consultation-response.model';
import { SidePanelService } from '../../../core/services/side-panel.service';

export interface ConsultationFormData {
  grossesseId: string;
  patienteName?: string;
  consultation?: ConsultationResponse;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-consultation-form',
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
    MatDividerModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './consultation-form.component.html',
  styleUrls: ['./consultation-form.component.css']
})
export class ConsultationFormComponent implements OnInit, OnDestroy {
  consultationForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  data: ConsultationFormData;
  
  readonly maxDate = new Date();
  readonly minDate = new Date(new Date().getFullYear() - 1, 0, 1);

  // Modèles de consultation prédéfinis
  predefinedObservations = [
    'Consultation de routine - Évolution normale de la grossesse',
    'Contrôle tensionnel - Surveillance de l\'hypertension',
    'Douleurs abdominales - Examen clinique normal',
    'Nausées et vomissements - Conseils diététiques donnés',
    'Mouvements fœtaux présents - Développement normal',
    'Contrôle du poids - Prise pondérale dans les normes',
    'Écoute des bruits du cœur fœtal - Rythme cardiaque normal',
    'Mesure de la hauteur utérine - Croissance fœtale normale'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(ConsultationsSelectors.selectConsultationsLoading);
    this.error$ = this.store.select(ConsultationsSelectors.selectConsultationsError);
    
    this.consultationForm = this.createForm();
    
    // Récupérer les données depuis le service side panel
    const config = this.sidePanelService.currentConfig;
    this.data = config?.data || {
      grossesseId: '',
      mode: 'create'
    };
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.consultation) {
      this.populateForm(this.data.consultation);
    }

    // Écouter les changements de loading pour fermer le panel après succès
    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      if (!loading && this.consultationForm.disabled) {
        // Re-enable form after successful operation
        this.consultationForm.enable();
        // Fermer le panel après succès
        setTimeout(() => {
          this.sidePanelService.close();
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: [new Date(), [Validators.required]],
      observation: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000)
      ]]
    });
  }

  private populateForm(consultation: ConsultationResponse): void {
    this.consultationForm.patchValue({
      date: new Date(consultation.date),
      observation: consultation.observation
    });
  }

  onPredefinedObservation(observation: string): void {
    const currentObservation = this.consultationForm.get('observation')?.value || '';
    const newObservation = currentObservation ? 
      `${currentObservation}\n\n${observation}` : 
      observation;
    
    this.consultationForm.patchValue({ observation: newObservation });
  }

  onSubmit(): void {
    if (this.consultationForm.valid) {
      this.consultationForm.disable();
      
      const formValue = this.consultationForm.value;
      const request: ConsultationRequest = {
        date: formValue.date,
        observation: formValue.observation.trim(),
        grossesseId: this.data.grossesseId
      };

      if (this.data.mode === 'create') {
        this.store.dispatch(ConsultationsActions.createConsultation({ request }));
      } else if (this.data.consultation) {
        this.store.dispatch(ConsultationsActions.updateConsultation({ 
          id: this.data.consultation.id, 
          request 
        }));
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.sidePanelService.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.consultationForm.controls).forEach(key => {
      const control = this.consultationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get dateControl() { return this.consultationForm.get('date'); }
  get observationControl() { return this.consultationForm.get('observation'); }

  // Méthodes utilitaires
  getFormTitle(): string {
    return this.data.mode === 'create' ? 
      'Nouvelle Consultation' : 
      'Modifier la Consultation';
  }

  getPatientInfo(): string {
    return this.data.patienteName ? 
      `Patiente: ${this.data.patienteName}` : 
      'Consultation de grossesse';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getCharacterCount(): string {
    const observation = this.observationControl?.value || '';
    return `${observation.length}/2000`;
  }

  isCharacterLimitNear(): boolean {
    const observation = this.observationControl?.value || '';
    return observation.length > 1800;
  }
} 