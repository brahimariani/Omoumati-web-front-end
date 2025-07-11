import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { Observable, Subject, startWith, map, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExamenBiologiqueRequest } from '../../../../core/models/examen_biologique/examen-biologique-request.model';
import { ExamenBiologiqueResponse } from '../../../../core/models/examen_biologique/examen-biologique-response.model';
import { ActeBiologiqueRequest } from '../../../../core/models/examen_biologique/acte_biologique/acte-biologique-request.model';
import { ACTES_BIOLOGIQUES_STANDARDS } from '../../../../core/models/examen_biologique/acte_biologique/acte-biologique.constants';
import { NotificationService } from '../../../../core/services/notification.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';

import * as ExamensBiologiquesActions from '../../../../store/examens-biologiques/examens-biologiques.actions';
import * as ExamensBiologiquesSelectors from '../../../../store/examens-biologiques/examens-biologiques.selectors';
import * as ConsultationsSelectors from '../../../../store/consultations/consultations.selectors';

export interface ExamenBiologiqueFormData {
  examen?: ExamenBiologiqueResponse;
  consultationId: string;
  patienteName?: string;
  isEdit: boolean;
}

@Component({
  selector: 'app-examen-biologique-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './examen-biologique-form.component.html',
  styleUrl: './examen-biologique-form.component.css'
})
export class ExamenBiologiqueFormComponent implements OnInit, OnDestroy {
  
  examenForm!: FormGroup;
  isEdit: boolean = false;
  consultationId: string = '';
  patienteName?: string;
  data: ExamenBiologiqueFormData;
  
  // Actes biologiques standards
  actesBiologiquesStandards = ACTES_BIOLOGIQUES_STANDARDS;
  
  // Observables du store
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  consultation$: Observable<any>;
  
  // Autocomplete pour nouveaux actes
  filteredActes$: Observable<string[]> = new Observable();
  nouveauxActesOptions: string[] = [
    'TSH', 'T3', 'T4', 'Ferritine', 'Vitamine D', 'Vitamine B12',
    'Acide folique', 'CRP', 'VS', 'Fibrinogène', 'D-Dimères',
    'Troponine', 'BNP', 'PSA', 'CA 125', 'CA 15-3', 'CA 19-9',
    'AFP', 'HCG', 'Prolactine', 'Cortisol', 'DHEA-S'
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private notificationService: NotificationService,
    private sidePanelService: SidePanelService
  ) {
    // Récupérer les données du SidePanel
    const panelConfig = this.sidePanelService.currentConfig;
    this.data = panelConfig?.data || {
      consultationId: '',
      isEdit: false
    };
    
    this.isEdit = this.data.isEdit;
    this.consultationId = this.data.consultationId;
    this.patienteName = this.data.patienteName;
    
    // Initialisation des observables
    this.loading$ = this.store.select(ExamensBiologiquesSelectors.selectExamensBiologiquesLoading);
    this.error$ = this.store.select(ExamensBiologiquesSelectors.selectExamensBiologiquesError);
    this.consultation$ = this.store.select(ConsultationsSelectors.selectConsultationById(this.consultationId));
    
    this.initializeForm();
  }

  ngOnInit(): void {
    // Charger les actes biologiques standards si pas déjà fait
    this.store.dispatch(ExamensBiologiquesActions.loadActesBiologiquesStandards());
    
    // Si mode édition, pré-remplir le formulaire
    if (this.isEdit && this.data.examen) {
      this.populateForm(this.data.examen);
    }
    
    // Initialiser l'autocomplete
    this.setupAutocomplete();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le formulaire avec les actes standards
   */
  private initializeForm(): void {
    this.examenForm = this.fb.group({
      observation: [''],
      actesBiologiques: this.fb.array([])
    });

    // Ajouter les actes biologiques standards
    this.addActesBiologiquesStandards();
  }

  /**
   * Ajouter les actes biologiques standards au formulaire
   */
  private addActesBiologiquesStandards(): void {
    const actesArray = this.getActesFormArray();
    
    this.actesBiologiquesStandards.forEach(acteStandard => {
      const acteGroup = this.fb.group({
        nom: [acteStandard.nom, Validators.required],
        valeur: [''], // Pas de validation required car optionnel
        unite: [acteStandard.unite || ''],
        normesRef: [acteStandard.normesRef || ''],
        isStandard: [true] // Marquer comme acte standard
      });
      
      actesArray.push(acteGroup);
    });
  }

  /**
   * Obtenir le FormArray des actes biologiques
   */
  getActesFormArray(): FormArray {
    return this.examenForm.get('actesBiologiques') as FormArray;
  }

  /**
   * Obtenir un FormGroup d'acte par index
   */
  getActeFormGroup(index: number): FormGroup {
    return this.getActesFormArray().at(index) as FormGroup;
  }

  /**
   * Pré-remplir le formulaire en mode édition
   */
  private populateForm(examen: ExamenBiologiqueResponse): void {
    // Remplir l'observation
    this.examenForm.patchValue({
      observation: examen.observation || ''
    });

    // Remplir les valeurs des actes existants
    const actesArray = this.getActesFormArray();
    
    examen.actesBiologiques.forEach(acteExistant => {
      // Chercher l'acte correspondant dans le formulaire
      for (let i = 0; i < actesArray.length; i++) {
        const acteControl = actesArray.at(i) as FormGroup;
        if (acteControl.get('nom')?.value === acteExistant.nom) {
          acteControl.patchValue({
            valeur: acteExistant.valeur || '',
            unite: acteExistant.unite || '',
            normesRef: acteExistant.normesRef || ''
          });
          break;
        }
      }
    });

    // Ajouter les actes non-standards s'ils existent
    examen.actesBiologiques.forEach(acteExistant => {
      const isStandard = this.actesBiologiquesStandards.some(
        standard => standard.nom === acteExistant.nom
      );
      
      if (!isStandard) {
        this.ajouterNouvelActe(acteExistant.nom, acteExistant.valeur, acteExistant.unite, acteExistant.normesRef);
      }
    });
  }

  /**
   * Configurer l'autocomplete pour les nouveaux actes
   */
  private setupAutocomplete(): void {
    // Cette méthode sera utilisée dans le template pour l'autocomplete
    this.filteredActes$ = new Observable<string[]>(observer => {
      observer.next(this.nouveauxActesOptions);
    });
  }

  /**
   * Ajouter un nouvel acte biologique
   */
  ajouterNouvelActe(nom: string = '', valeur: string = '', unite: string = '', normesRef: string = ''): void {
    const actesArray = this.getActesFormArray();
    
    const nouvelActeGroup = this.fb.group({
      nom: [nom, Validators.required],
      valeur: [valeur],
      unite: [unite],
      normesRef: [normesRef],
      isStandard: [false] // Marquer comme acte personnalisé
    });
    
    actesArray.push(nouvelActeGroup);
  }

  /**
   * Supprimer un acte biologique (seulement les non-standards)
   */
  supprimerActe(index: number): void {
    const acteGroup = this.getActeFormGroup(index);
    const isStandard = acteGroup.get('isStandard')?.value;
    
    if (!isStandard) {
      const actesArray = this.getActesFormArray();
      actesArray.removeAt(index);
    } else {
      // Pour les actes standards, on vide juste la valeur
      acteGroup.patchValue({
        valeur: '',
        unite: acteGroup.get('unite')?.value || this.getUniteStandard(acteGroup.get('nom')?.value),
        normesRef: acteGroup.get('normesRef')?.value || this.getNormesStandard(acteGroup.get('nom')?.value)
      });
    }
  }

  /**
   * Obtenir l'unité standard pour un acte
   */
  private getUniteStandard(nomActe: string): string {
    const acteStandard = this.actesBiologiquesStandards.find(acte => acte.nom === nomActe);
    return acteStandard?.unite || '';
  }

  /**
   * Obtenir les normes standard pour un acte
   */
  private getNormesStandard(nomActe: string): string {
    const acteStandard = this.actesBiologiquesStandards.find(acte => acte.nom === nomActe);
    return acteStandard?.normesRef || '';
  }

  /**
   * Vérifier si un acte a une valeur renseignée
   */
  acteHasValue(index: number): boolean {
    const acteGroup = this.getActeFormGroup(index);
    const valeur = acteGroup.get('valeur')?.value;
    return valeur && valeur.trim() !== '';
  }

  /**
   * Obtenir le nombre d'actes renseignés
   */
  getNombreActesRenseignes(): number {
    const actesArray = this.getActesFormArray();
    let count = 0;
    
    for (let i = 0; i < actesArray.length; i++) {
      if (this.acteHasValue(i)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Analyser une valeur biologique
   */
  analyserValeur(index: number): string {
    const acteGroup = this.getActeFormGroup(index);
    const nom = acteGroup.get('nom')?.value;
    const valeur = acteGroup.get('valeur')?.value;
    
    if (!valeur || valeur.trim() === '') {
      return '';
    }

    const valeurNumerique = parseFloat(valeur);
    
    switch (nom.toLowerCase()) {
      case 'hémoglobine':
        if (valeurNumerique < 8) return 'Critique - Anémie sévère';
        if (valeurNumerique < 11) return 'Anémie légère';
        if (valeurNumerique > 16) return 'Élevé';
        return 'Normal';
        
      case 'glycémie':
        if (valeurNumerique > 2.0) return 'Critique - Hyperglycémie sévère';
        if (valeurNumerique > 1.26) return 'Diabète';
        if (valeurNumerique < 0.7) return 'Hypoglycémie';
        return 'Normal';
        
      case 'créatinine':
        if (valeurNumerique > 20) return 'Critique - Insuffisance rénale sévère';
        if (valeurNumerique > 12) return 'Insuffisance rénale';
        return 'Normal';
        
      case 'plaquettes':
        if (valeurNumerique < 50) return 'Critique - Thrombopénie sévère';
        if (valeurNumerique < 150) return 'Thrombopénie';
        if (valeurNumerique > 450) return 'Thrombocytose';
        return 'Normal';
        
      case 'albuminurie':
        if (valeurNumerique > 300) return 'Critique - Protéinurie massive';
        if (valeurNumerique > 30) return 'Microalbuminurie';
        return 'Normal';
        
      case 'glucosurie':
        if (valeurNumerique > 0) return 'Présence de glucose';
        return 'Normal';
        
      default:
        // Pour les sérologies
        if (valeur.toLowerCase().includes('positif') || valeur.toLowerCase().includes('+')) {
          return 'Positif';
        }
        if (valeur.toLowerCase().includes('négatif') || valeur.toLowerCase().includes('-')) {
          return 'Négatif';
        }
        return '';
    }
  }

  /**
   * Obtenir la classe CSS pour l'analyse
   */
  getAnalyseClass(index: number): string {
    const analyse = this.analyserValeur(index);
    
    if (analyse.includes('Critique')) return 'analyse-critique';
    if (analyse.includes('Anémie') || analyse.includes('Diabète') || analyse.includes('Insuffisance') || 
        analyse.includes('Thrombopénie') || analyse.includes('Thrombocytose') || 
        analyse.includes('Microalbuminurie') || analyse.includes('Présence')) {
      return 'analyse-anomalie';
    }
    if (analyse === 'Normal' || analyse === 'Négatif') return 'analyse-normal';
    if (analyse === 'Positif') return 'analyse-positif';
    
    return '';
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.examenForm.valid) {
      const formValue = this.examenForm.value;
      
      // Filtrer seulement les actes avec des valeurs renseignées
      const actesAvecValeurs = formValue.actesBiologiques.filter((acte: any) => 
        acte.valeur && acte.valeur.trim() !== ''
      );

      if (actesAvecValeurs.length === 0) {
        this.notificationService.warning('Veuillez renseigner au moins un acte biologique.');
        return;
      }

      // Récupérer l'objet consultation complet depuis le store
      this.consultation$.pipe(
        take(1)
      ).subscribe(consultation => {
        
        
        const examenRequest: ExamenBiologiqueRequest = {
          observation: formValue.observation || '',
          consultation: {
            id: this.consultationId,
            date: new Date(),
            observation: '',
            grossesseId: ''
          }, // Utiliser l'objet consultation complet
          actesBiologiques: actesAvecValeurs.map((acte: any) => ({
            nom: acte.nom,
            valeur: acte.valeur,
            unite: acte.unite || '',
            normesRef: acte.normesRef || ''
          } as ActeBiologiqueRequest))
        };

        if (this.isEdit && this.data.examen) {
          this.store.dispatch(ExamensBiologiquesActions.updateExamenBiologique({
            id: this.data.examen.id,
            examenRequest: examenRequest
          }));
        } else {
          this.store.dispatch(ExamensBiologiquesActions.createExamenBiologique({
            examenRequest: examenRequest
          }));
        }

        // Rafraîchir la liste des examens pour cette consultation
        setTimeout(() => {
          this.store.dispatch(ExamensBiologiquesActions.loadExamensByConsultation({
            consultationId: this.consultationId
          }));
        }, 500);

        this.sidePanelService.close();
      });
    } else {
      this.notificationService.error('Veuillez corriger les erreurs dans le formulaire.');
      this.markFormGroupTouched();
    }
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.examenForm.controls).forEach(key => {
      const control = this.examenForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(groupControl => {
          if (groupControl instanceof FormGroup) {
            Object.keys(groupControl.controls).forEach(groupKey => {
              groupControl.get(groupKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  /**
   * Annuler et fermer le formulaire
   */
  onCancel(): void {
    this.sidePanelService.close();
  }

  /**
   * Fonction de tracking pour la performance
   */
  trackByIndex(index: number): number {
    return index;
  }
} 