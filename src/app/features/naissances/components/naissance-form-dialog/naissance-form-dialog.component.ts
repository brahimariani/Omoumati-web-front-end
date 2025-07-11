import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';

import { NaissanceRequest } from '../../../../core/models/naissance/naissance-request.model';
import { NaissanceResponse } from '../../../../core/models/naissance/naissance-response.model';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';
import { NaissancesActions } from '../../../../store/naissances';

export interface NaissanceDialogData {
  accouchement: AccouchementResponse;
  naissance?: NaissanceResponse;
  isEdit: boolean;
}

// Interface pour les alertes médicales
interface MedicalAlert {
  type: 'info' | 'warning' | 'error';
  icon: string;
  message: string;
}

@Component({
  selector: 'app-naissance-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './naissance-form-dialog.component.html',
  styleUrls: ['./naissance-form-dialog.component.css']
})
export class NaissanceFormDialogComponent implements OnInit {
  naissanceForm: FormGroup;
  loading = false;
  medicalAlerts: MedicalAlert[] = [];

  // Options pour les sélecteurs
  sexeOptions = [
    { value: 'Masculin', label: 'Masculin', icon: 'male' },
    { value: 'Feminin', label: 'Feminin', icon: 'female' }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NaissanceFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NaissanceDialogData
  ) {
    this.naissanceForm = this.createForm();
    this.setupFormWatchers();
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.naissance) {
      this.loadNaissanceData();
    }
    this.evaluateMedicalStatus();
  }

  /**
   * Créer le formulaire réactif avec validation
   */
  private createForm(): FormGroup {
    return this.fb.group({
      estVivant: [true, [Validators.required]],
      sexe: ['', [Validators.required]],
      poids: ['', [Validators.required, Validators.min(500), Validators.max(8000)]],
      perimetreCranien: ['', [Validators.required, Validators.min(25), Validators.max(45)]],
      accouchement: [this.data.accouchement, [Validators.required]]
    });
  }

  /**
   * Configurer les watchers pour les alertes médicales
   */
  private setupFormWatchers(): void {
    // Surveiller les changements pour évaluer le statut médical
    this.naissanceForm.valueChanges.subscribe(() => {
      this.evaluateMedicalStatus();
    });
  }

  /**
   * Charger les données de la naissance à modifier
   */
  private loadNaissanceData(): void {
    if (!this.data.naissance) return;

    const naissance = this.data.naissance;
    this.naissanceForm.patchValue({
      estVivant: naissance.estVivant,
      sexe: naissance.sexe,
      poids: naissance.poids,
      perimetreCranien: naissance.perimetreCranien,
    });
  }

  /**
   * Évaluer le statut médical et générer des alertes
   */
  private evaluateMedicalStatus(): void {
    this.medicalAlerts = [];
    const formValue = this.naissanceForm.value;

    // Alerte si décès
    if (formValue.estVivant === false) {
      this.medicalAlerts.push({
        type: 'error',
        icon: 'dangerous',
        message: 'Décès néonatal - Documentation supplémentaire requise'
      });
    }

    // Évaluation du poids
    if (formValue.poids) {
      if (formValue.poids < 2500) {
        this.medicalAlerts.push({
          type: 'warning',
          icon: 'warning',
          message: `Faible poids de naissance (${formValue.poids}g < 2500g) - Surveillance renforcée recommandée`
        });
      } else if (formValue.poids > 4000) {
        this.medicalAlerts.push({
          type: 'warning',
          icon: 'warning',
          message: `Macrosomie fœtale (${formValue.poids}g > 4000g) - Risque d'hypoglycémie`
        });
      }
    }

    // Évaluation du périmètre crânien
    if (formValue.perimetreCranien) {
      if (formValue.perimetreCranien < 32) {
        this.medicalAlerts.push({
          type: 'warning',
          icon: 'warning',
          message: `Microcéphalie possible (${formValue.perimetreCranien}cm < 32cm) - Examen neurologique requis`
        });
      } else if (formValue.perimetreCranien > 37) {
        this.medicalAlerts.push({
          type: 'warning',
          icon: 'warning',
          message: `Macrocéphalie possible (${formValue.perimetreCranien}cm > 37cm) - Surveillance neurologique`
        });
      }
    }
  }

  /**
   * Obtenir le statut d'évaluation du poids
   */
  getPoidsEvaluation(): { status: string; color: string } {
    const poids = this.naissanceForm.get('poids')?.value;
    if (!poids) return { status: '', color: '' };

    if (poids < 2500) {
      return { status: 'Faible poids', color: 'warn' };
    } else if (poids > 4000) {
      return { status: 'Macrosomie', color: 'accent' };
    } else {
      return { status: 'Normal', color: 'primary' };
    }
  }

  /**
   * Obtenir le statut d'évaluation du périmètre crânien
   */
  getPerimetreEvaluation(): { status: string; color: string } {
    const perimetre = this.naissanceForm.get('perimetreCranien')?.value;
    if (!perimetre) return { status: '', color: '' };

    if (perimetre < 32) {
      return { status: 'Microcéphalie', color: 'warn' };
    } else if (perimetre > 37) {
      return { status: 'Macrocéphalie', color: 'accent' };
    } else {
      return { status: 'Normal', color: 'primary' };
    }
  }

  /**
   * Vérifier si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.naissanceForm.valid;
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.naissanceForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    
    if (errors['required']) {
      const labels: { [key: string]: string } = {
        'estVivant': 'Le statut vital est requis',
        'sexe': 'Le sexe est requis',
        'poids': 'Le poids est requis',
        'perimetreCranien': 'Le périmètre crânien est requis',
        'accouchement': 'L\'accouchement est requis'
      };
      return labels[fieldName] || 'Ce champ est requis';
    }
    
    if (errors['min']) {
      const mins: { [key: string]: string } = {
        'poids': 'Le poids doit être au moins 500g',
        'perimetreCranien': 'Le périmètre doit être au moins 25cm'
      };
      return mins[fieldName] || `Valeur minimale: ${errors['min'].min}`;
    }
    
    if (errors['max']) {
      const maxs: { [key: string]: string } = {
        'poids': 'Le poids ne peut pas dépasser 8000g',
        'perimetreCranien': 'Le périmètre ne peut pas dépasser 45cm'
      };
      return maxs[fieldName] || `Valeur maximale: ${errors['max'].max}`;
    }
    
    return '';
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.markFormGroupTouched();
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.loading = true;
    const naissanceData: NaissanceRequest = this.naissanceForm.value;

    if (this.data.isEdit && this.data.naissance) {
      // Mise à jour
      this.store.dispatch(NaissancesActions.updateNaissance({ 
        id: this.data.naissance.id, 
        request: naissanceData 
      }));
    } else {
      // Création
      this.store.dispatch(NaissancesActions.createNaissance({ 
        request: naissanceData 
      }));
    }

    // Fermer le dialog après un court délai
    setTimeout(() => {
      this.loading = false;
      this.dialogRef.close(true);
    }, 500);
  }

  /**
   * Marquer tous les champs comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.naissanceForm.controls).forEach(key => {
      const control = this.naissanceForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Annuler et fermer le dialog
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Obtenir le titre du dialog
   */
  getDialogTitle(): string {
    const action = this.data.isEdit ? 'Modifier' : 'Enregistrer';
    return `${action} une naissance`;
  }

  /**
   * Obtenir le texte du bouton de validation
   */
  getSubmitButtonText(): string {
    return this.data.isEdit ? 'Mettre à jour' : 'Enregistrer';
  }

  /**
   * Afficher un message d'erreur
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
} 