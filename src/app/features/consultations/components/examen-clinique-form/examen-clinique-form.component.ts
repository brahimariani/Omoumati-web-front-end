import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { ExamenCliniqueRequest } from '../../../../core/models/examen_clinique/examen-clinique-request.model';
import { ExamenCliniqueResponse } from '../../../../core/models/examen_clinique/examen-clinique-response.model';
import { updateExamen, createExamen } from '../../../../store/examens-cliniques/examens-cliniques.actions';
import { selectExamensLoading } from '../../../../store/examens-cliniques/examens-cliniques.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExamenCliniqueService } from '../../../../core/services/examen-clinique.service';
import { ConsultationResponse } from '../../../../core/models/consultation/consultation-response.model';

@Component({
  selector: 'app-examen-clinique-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './examen-clinique-form.component.html',
  styleUrls: ['./examen-clinique-form.component.css']
})
export class ExamenCliniqueFormComponent implements OnInit, OnDestroy {
  @Input() examen?: ExamenCliniqueResponse;
  @Input() consultation!: ConsultationResponse;
  @Input() patienteName?: string;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();

  examenForm!: FormGroup;
  loading$: Observable<boolean>;
  
  // Options pour les sélections
  etatOptions = ['Normal', 'Anormal', 'Pathologique', 'Non évalué'];
  presentationOptions = ['Céphalique', 'Siège', 'Transverse', 'Non déterminée'];
  etatColOptions = ['Fermé', 'Ouvert', 'En voie d\'ouverture', 'Effacé'];
  bassinOptions = ['Normal', 'Limite', 'Rétréci'];
  
  // Calculs automatiques
  imcCalcule: number = 0;
  categorieIMC: string = '';
  alertesSignesVitaux: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private sidePanelService: SidePanelService,
    private notificationService: NotificationService,
    private examenCliniqueService: ExamenCliniqueService
  ) {
    this.loading$ = this.store.select(selectExamensLoading);
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.isEdit && this.examen) {
      this.populateForm(this.examen);
    }
    
    // Observer les changements pour les calculs automatiques
    this.setupCalculations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le formulaire avec tous les champs d'examen clinique
   */
  private initializeForm(): void {
    this.examenForm = this.fb.group({
      // Mesures physiques
      poids: ['', [Validators.required, Validators.min(30), Validators.max(200)]],
      taille: ['', [Validators.required, Validators.min(100), Validators.max(220)]],
      
      // Signes vitaux
      tensionArterielle: ['', [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
      temperature: ['', [Validators.required, Validators.min(34), Validators.max(42)]],
      frequenceCardiaque: ['', [Validators.required, Validators.min(40), Validators.max(180)]],
      
      // Examen physique général
      anomalieSquelette: [''],
      etatConjonctives: [''],
      etatSeins: [''],
      oedemes: [''],
      
      // Examen obstétrical
      mouvements: [''],
      hu: ['', [Validators.min(0), Validators.max(50)]],
      bcf: ['', [Validators.min(100), Validators.max(180)]],
      
      // Examen gynécologique
      speculum: [''],
      toucherVaginalEtatCol: [''],
      toucherVaginalPresentation: [''],
      toucherVaginalBassin: [''],
      
      // Observations
      observation: ['']
    });
  }

  /**
   * Configurer les calculs automatiques
   */
  private setupCalculations(): void {
    // Calcul IMC automatique
    this.examenForm.get('poids')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.calculateIMC());
    
    this.examenForm.get('taille')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.calculateIMC());

    // Évaluation des signes vitaux
    this.examenForm.get('tensionArterielle')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.evaluateSignesVitaux());
    
    this.examenForm.get('temperature')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.evaluateSignesVitaux());
    
    this.examenForm.get('frequenceCardiaque')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.evaluateSignesVitaux());
  }

  /**
   * Calculer l'IMC automatiquement
   */
  private calculateIMC(): void {
    const poids = this.examenForm.get('poids')?.value;
    const taille = this.examenForm.get('taille')?.value;
    
    if (poids && taille && poids > 0 && taille > 0) {
      this.imcCalcule = this.examenCliniqueService.calculerIMC(poids, taille);
      
      // Déterminer la catégorie IMC
      if (this.imcCalcule < 18.5) {
        this.categorieIMC = 'Maigreur';
      } else if (this.imcCalcule < 25) {
        this.categorieIMC = 'Normal';
      } else if (this.imcCalcule < 30) {
        this.categorieIMC = 'Surpoids';
      } else {
        this.categorieIMC = 'Obésité';
      }
    }
  }

  /**
   * Évaluer les signes vitaux et générer des alertes
   */
  private evaluateSignesVitaux(): void {
    this.alertesSignesVitaux = [];
    
    const tension = this.examenForm.get('tensionArterielle')?.value;
    const temperature = this.examenForm.get('temperature')?.value;
    const frequence = this.examenForm.get('frequenceCardiaque')?.value;

    // Évaluation tension artérielle
    if (tension) {
      const [systolique, diastolique] = tension.split('/').map(Number);
      if (systolique >= 140 || diastolique >= 90) {
        this.alertesSignesVitaux.push('Tension artérielle élevée');
      } else if (systolique < 90 || diastolique < 60) {
        this.alertesSignesVitaux.push('Tension artérielle basse');
      }
    }

    // Évaluation température
    if (temperature) {
      if (temperature >= 38) {
        this.alertesSignesVitaux.push('Fièvre détectée');
      } else if (temperature < 36) {
        this.alertesSignesVitaux.push('Hypothermie');
      }
    }

    // Évaluation fréquence cardiaque
    if (frequence) {
      if (frequence > 100) {
        this.alertesSignesVitaux.push('Tachycardie');
      } else if (frequence < 60) {
        this.alertesSignesVitaux.push('Bradycardie');
      }
    }
  }

  /**
   * Remplir le formulaire avec les données existantes
   */
  private populateForm(examen: ExamenCliniqueResponse): void {
    this.examenForm.patchValue({
      poids: examen.poids,
      taille: examen.taille,
      tensionArterielle: examen.tensionArterielle,
      temperature: examen.temperature,
      frequenceCardiaque: examen.frequenceCardiaque,
      anomalieSquelette: examen.anomalieSquelette,
      etatConjonctives: examen.etatConjonctives,
      etatSeins: examen.etatSeins,
      oedemes: examen.oedemes,
      mouvements: examen.mouvements,
      hu: examen.hu,
      bcf: examen.bcf,
      speculum: examen.speculum,
      toucherVaginalEtatCol: examen.toucherVaginalEtatCol,
      toucherVaginalPresentation: examen.toucherVaginalPresentation,
      toucherVaginalBassin: examen.toucherVaginalBassin,
      observation: examen.observation
    });
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.examenForm.valid) {
      const formData = this.examenForm.value;
      
      const examenRequest: ExamenCliniqueRequest = {
        poids: parseFloat(formData.poids),
        taille: parseFloat(formData.taille),
        tensionArterielle: formData.tensionArterielle,
        temperature: parseFloat(formData.temperature),
        frequenceCardiaque: parseInt(formData.frequenceCardiaque),
        anomalieSquelette: formData.anomalieSquelette || '',
        etatConjonctives: formData.etatConjonctives || '',
        etatSeins: formData.etatSeins || '',
        oedemes: formData.oedemes || '',
        mouvements: formData.mouvements || '',
        hu: formData.hu ? parseFloat(formData.hu) : 0,
        bcf: formData.bcf ? parseInt(formData.bcf) : 0,
        speculum: formData.speculum || '',
        toucherVaginalEtatCol: formData.toucherVaginalEtatCol || '',
        toucherVaginalPresentation: formData.toucherVaginalPresentation || '',
        toucherVaginalBassin: formData.toucherVaginalBassin || '',
        observation: formData.observation || '',
        consultation: this.consultation
      };

      if (this.isEdit && this.examen) {
        this.store.dispatch(updateExamen({ 
          id: this.examen.id, 
          request: examenRequest 
        }));
      } else {
        this.store.dispatch(createExamen({ 
          request: examenRequest 
        }));
      }
      
      this.closePanel(true);
    } else {
      this.markFormGroupTouched();
      this.notificationService.error('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.examenForm.controls).forEach(key => {
      this.examenForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Obtenir l'erreur d'un champ
   */
  getFieldError(fieldName: string): string | null {
    const control = this.examenForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return 'Ce champ est requis';
      }
      if (control.errors['min']) {
        return `Valeur minimale: ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Valeur maximale: ${control.errors['max'].max}`;
      }
      if (control.errors['pattern']) {
        return 'Format invalide (ex: 120/80)';
      }
    }
    return null;
  }

  /**
   * Annuler le formulaire
   */
  cancel(): void {
    this.closePanel(false);
  }

  /**
   * Fermer le panel
   */
  private closePanel(success: boolean = false): void {
    this.sidePanelService.close();
    this.onClose.emit(success);
  }

  /**
   * Obtenir le titre du formulaire
   */
  get formTitle(): string {
    return this.isEdit ? 'Modifier l\'examen clinique' : 'Nouvel examen clinique';
  }

  /**
   * Obtenir la classe CSS pour l'IMC
   */
  get imcClass(): string {
    if (this.imcCalcule < 18.5) return 'imc-maigreur';
    if (this.imcCalcule < 25) return 'imc-normal';
    if (this.imcCalcule < 30) return 'imc-surpoids';
    return 'imc-obesite';
  }

  /**
   * Vérifier si des alertes sont présentes
   */
  get hasAlertes(): boolean {
    return this.alertesSignesVitaux.length > 0;
  }

  /**
   * Suggestions pour les champs texte
   */
  applySuggestion(fieldName: string, value: string): void {
    this.examenForm.get(fieldName)?.setValue(value);
  }
} 