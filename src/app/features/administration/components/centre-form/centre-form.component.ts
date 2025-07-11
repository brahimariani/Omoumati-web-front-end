import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';

import { CentreRequest } from '../../../../core/models/centre/centre.request.model';
import { CentreResponse } from '../../../../core/models/centre/centre.response.model';
import { TypeCentre } from '../../../../core/models/centre/typecentre.model';
import { CentresActions } from '../../../../store/centres/centres.actions';
import { selectSelectedCentre, selectCentresLoading, selectCentresError } from '../../../../store/centres/centres.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';

@Component({
  selector: 'app-centre-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './centre-form.component.html',
  styleUrls: ['./centre-form.component.css']
})
export class CentreFormComponent implements OnInit, OnDestroy {
  @Input() centre?: CentreResponse;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();
  
  isEditMode = false;
  centreId: string | null = null;
  
  // Formulaire principal
  centreForm!: FormGroup;
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  centre$: Observable<CentreResponse | null>;
  
  // Options pour les sélecteurs
  typesCentres = Object.values(TypeCentre);
  
  // Libellés des types de centres
  typeLabels: { [key in TypeCentre]: string } = {
    [TypeCentre.CS]: 'Centre de Santé',
    [TypeCentre.CSC]: 'Centre de Santé Communautaire',
    [TypeCentre.CSU]: 'Centre de Santé Urbain',
    [TypeCentre.CSCA]: 'Centre de Santé Communautaire Avancé',
    [TypeCentre.CSUA]: 'Centre de Santé Urbain Avancé'
  };
  
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
    this.loading$ = this.store.select(selectCentresLoading);
    this.error$ = this.store.select(selectCentresError);
    this.centre$ = this.store.select(selectSelectedCentre);
    
    this.initializeForm();
  }
  
  private initializeForm(): void {
    this.centreForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      type: ['', Validators.required],
      adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{8,20}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      siteWeb: ['', [Validators.pattern(/^https?:\/\/.+\..+/), Validators.maxLength(255)]]
    });
  }
  
  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(CentresActions.createCentreSuccess, CentresActions.updateCentreSuccess),
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
    if (this.centre && this.isEdit) {
      // Mode side panel avec centre fourni
      this.isEditMode = true;
      this.centreId = this.centre.id;
      this.populateForm(this.centre);
    } else if (!this.centre && this.isEdit) {
      // Mode side panel sans centre (cas d'erreur)
      console.error('Mode édition mais aucun centre fourni');
    } else if (!this.centre && !this.isEdit) {
      // Mode side panel nouveau centre
      this.isEditMode = false;
    } else {
      // Mode route classique
      this.handleRouteMode();
    }
  }
  
  /**
   * Gérer le mode route classique (non side panel)
   */
  private handleRouteMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'nouveau') {
      // Mode édition via route
      this.isEditMode = true;
      this.centreId = id;
      this.store.dispatch(CentresActions.loadCentre({ id }));
      
      // S'abonner au centre sélectionné
      this.centre$.pipe(takeUntil(this.destroy$)).subscribe(centre => {
        if (centre) {
          this.populateForm(centre);
        }
      });
    } else {
      // Mode création via route
      this.isEditMode = false;
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Peupler le formulaire avec les données du centre
   */
  populateForm(centre: CentreResponse): void {
    this.centreForm.patchValue({
      nom: centre.nom,
      type: centre.type,
      adresse: centre.adresse,
      telephone: centre.telephone,
      email: centre.email,
      siteWeb: centre.siteWeb
    });
  }
  
  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.centreForm.valid) {
      const centreData: CentreRequest = {
        nom: this.centreForm.value.nom,
        type: this.centreForm.value.type,
        adresse: this.centreForm.value.adresse,
        telephone: this.centreForm.value.telephone,
        email: this.centreForm.value.email,
        siteWeb: this.centreForm.value.siteWeb || ''
      };

      if (this.isEditMode && this.centreId) {
        // Mise à jour
        this.store.dispatch(CentresActions.updateCentre({ 
          id: this.centreId, 
          request: centreData 
        }));
      } else {
        // Création
        this.store.dispatch(CentresActions.createCentre({ 
          request: centreData 
        }));
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.centreForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  }
  
  /**
   * Vérifier si on est dans le side panel
   */
  private isInSidePanel(): boolean {
    return this.centre !== undefined || this.isEdit !== undefined;
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
  
  /**
   * Obtenir le titre du formulaire
   */
  get formTitle(): string {
    return this.isEditMode ? 'Modifier le centre' : 'Nouveau centre';
  }
  
  /**
   * Marquer tous les champs d'un FormGroup comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  /**
   * Retourner à la page précédente (mode route)
   */
  goBack(): void {
    this.router.navigate(['/administration/centres']);
  }
  
  /**
   * Fermer le side panel et émettre l'événement
   */
  closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }
  
  /**
   * Obtenir le libellé d'un type de centre
   */
  getTypeLabel(type: TypeCentre): string {
    return this.typeLabels[type] || type;
  }
  
  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldErrorMessage(fieldName: string): string {
    const control = this.centreForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `Le champ ${fieldName} est requis`;
      }
      if (control.errors['minlength']) {
        return `Le champ ${fieldName} doit contenir au moins ${control.errors['minlength'].requiredLength} caractères`;
      }
      if (control.errors['maxlength']) {
        return `Le champ ${fieldName} ne peut pas dépasser ${control.errors['maxlength'].requiredLength} caractères`;
      }
      if (control.errors['email']) {
        return 'Veuillez entrer une adresse email valide';
      }
      if (control.errors['pattern']) {
        if (fieldName === 'telephone') {
          return 'Veuillez entrer un numéro de téléphone valide';
        }
        if (fieldName === 'siteWeb') {
          return 'Veuillez entrer une URL valide (http:// ou https://)';
        }
      }
    }
    return '';
  }
  
  /**
   * Vérifier si un champ a une erreur
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.centreForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
} 