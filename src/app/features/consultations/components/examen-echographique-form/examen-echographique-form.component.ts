import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExamenEchographiqueRequest } from '../../../../core/models/examen_echographique/examen-echographique-request.model';
import { ExamenEchographiqueResponse } from '../../../../core/models/examen_echographique/examen-echographique-response.model';
import { ImageEchographiqueResponse } from '../../../../core/models/examen_echographique/image_echographique/image-echographique-response.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { ImageViewerService } from '../../../../shared/services/image-viewer.service';

import * as ExamensEchographiquesActions from '../../../../store/examens-echographiques/examens-echographiques.actions';
import * as ExamensEchographiquesSelectors from '../../../../store/examens-echographiques/examens-echographiques.selectors';
import * as ConsultationsSelectors from '../../../../store/consultations/consultations.selectors';
import { ConsultationResponse } from '../../../../core/models/consultation/consultation-response.model';

export interface ExamenEchographiqueFormData {
  examen?: ExamenEchographiqueResponse;
  consultation: ConsultationResponse;
  patienteName?: string;
  isEdit: boolean;
}

@Component({
  selector: 'app-examen-echographique-form',
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
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './examen-echographique-form.component.html',
  styleUrl: './examen-echographique-form.component.css'
})
export class ExamenEchographiqueFormComponent implements OnInit, OnDestroy {
  
  examenForm!: FormGroup;
  isEdit: boolean = false;
  consultation!: ConsultationResponse;
  patienteName?: string;
  data: ExamenEchographiqueFormData;
  selectedImages: File[] = [];
  
  // Options pour les listes déroulantes
  placentaOptions = [
    'Antérieur',
    'Postérieur',
    'Latéral droit',
    'Latéral gauche',
    'Fundique',
    'Bas inséré',
    'Praevia'
  ];

  liquideAmniotiqueOptions = [
    'Normal',
    'Oligoamnios',
    'Polyhydramnios',
    'Anamnios'
  ];
  
  // Observables du store
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  consultation$: Observable<any>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private notificationService: NotificationService,
    private sidePanelService: SidePanelService,
    private imageViewerService: ImageViewerService
  ) {
    // Récupérer les données du SidePanel
    const panelConfig = this.sidePanelService.currentConfig;
    this.data = panelConfig?.data || {
      consultation: {
        id: ''
      },
      isEdit: false
    };
    
    this.isEdit = this.data.isEdit;
    this.consultation = this.data.consultation;
    this.patienteName = this.data.patienteName;
    
    // Initialisation des observables
    this.loading$ = this.store.select(ExamensEchographiquesSelectors.selectExamensEchographiquesLoading);
    this.error$ = this.store.select(ExamensEchographiquesSelectors.selectExamensEchographiquesError);
    this.consultation$ = this.store.select(ConsultationsSelectors.selectConsultationById(this.consultation.id));
    
    this.initializeForm();
  }

  ngOnInit(): void {
    // Si mode édition, pré-remplir le formulaire
    if (this.isEdit && this.data.examen) {
      this.populateForm(this.data.examen);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le formulaire
   */
  private initializeForm(): void {
    this.examenForm = this.fb.group({
      nbEmbryons: [1, [Validators.required, Validators.min(0), Validators.max(10)]],
      lcc: [''],
      cn: [''],
      bip: [''],
      dat: [''],
      longueurFemoral: [0, [Validators.min(0)]],
      placenta: [''],
      liquideAmniotique: [''],
      observation: ['']
    });
  }

  /**
   * Pré-remplir le formulaire en mode édition
   */
  private populateForm(examen: ExamenEchographiqueResponse): void {
    this.examenForm.patchValue({
      nbEmbryons: examen.nbEmbryons || 1,
      lcc: examen.lcc || '',
      cn: examen.cn || '',
      bip: examen.bip || '',
      dat: examen.dat || '',
      longueurFemoral: examen.longueurFemoral || 0,
      placenta: examen.placenta || '',
      liquideAmniotique: examen.liquideAmniotique || '',
      observation: examen.observation || ''
    });
  }

  /**
   * Gestion de la sélection d'images
   */
  onImageSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedImages = Array.from(files);
      console.log('Images sélectionnées:', this.selectedImages);
      console.log('Nombre d\'images:', this.selectedImages.length);
    }
  }

  /**
   * Supprimer une image sélectionnée
   */
  removeSelectedImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  /**
   * Voir les images existantes (mode édition)
   */
  viewExistingImages(): void {
    if (this.data.examen?.images && this.data.examen.images.length > 0) {
      // Ouvrir le viewer d'images
      this.imageViewerService.openImageViewer({
        images: this.data.examen.images,
        selectedIndex: 0,
        title: 'Images de l\'examen échographique',
        allowDownload: true,
        allowFullscreen: true
      });
    }
  }

  /**
   * Analyser les mesures échographiques
   */
  analyserMesures(): void {
    if (this.examenForm.valid && this.data.examen) {
      this.store.dispatch(ExamensEchographiquesActions.analyserMesuresEchographiques({
        examen: this.data.examen
      }));
    }
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    if (this.examenForm.valid) {
      const formData = this.examenForm.value;
      
      const examenRequest: ExamenEchographiqueRequest = {
        ...formData,
        consultation: this.consultation
      };

      if (this.isEdit && this.data.examen) {
        // Mode édition
        this.store.dispatch(ExamensEchographiquesActions.updateExamenEchographique({
          id: this.data.examen.id,
          examenRequest,
          images: this.selectedImages
        }));
      } else {
        // Mode création
        console.log('Création d\'examen avec images:', {
          examenRequest,
          images: this.selectedImages,
          nombreImages: this.selectedImages.length
        });
        this.store.dispatch(ExamensEchographiquesActions.createExamenEchographique({
          examenRequest,
          images: this.selectedImages
        }));
      }

      // Fermer le panel après soumission
      this.sidePanelService.close();
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
      const control = this.examenForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Annuler et fermer le formulaire
   */
  onCancel(): void {
    this.sidePanelService.close();
  }

  /**
   * Obtenir le nombre de mesures renseignées
   */
  getNombreMesuresRenseignees(): number {
    const formValue = this.examenForm.value;
    let count = 0;
    
    if (formValue.lcc && formValue.lcc.trim()) count++;
    if (formValue.cn && formValue.cn.trim()) count++;
    if (formValue.bip && formValue.bip.trim()) count++;
    if (formValue.dat && formValue.dat.trim()) count++;
    if (formValue.longueurFemoral > 0) count++;
    if (formValue.placenta && formValue.placenta.trim()) count++;
    if (formValue.liquideAmniotique && formValue.liquideAmniotique.trim()) count++;
    
    return count;
  }

  /**
   * Vérifier si le formulaire a des données valides
   */
  hasValidData(): boolean {
    return this.getNombreMesuresRenseignees() > 0 || 
           (this.examenForm.get('observation')?.value && this.examenForm.get('observation')?.value.trim());
  }
}
