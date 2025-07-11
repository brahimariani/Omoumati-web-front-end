import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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

import { RoleRequest } from '../../../../core/models/role/role.request.model';
import { RoleResponse } from '../../../../core/models/role/role.response.model';
import { AppState } from '../../../../store';
import { 
  RolesActions,
  selectRoleById,
  selectRolesLoading,
  selectRolesError
} from '../../../../store/roles';
import { SidePanelService } from '../../../../core/services/side-panel.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnInit, OnDestroy {
  @Input() role?: RoleResponse;
  @Input() isEdit: boolean = false;
  
  @Output() onClose = new EventEmitter<boolean>();
  
  isEditMode = false;
  roleId: string | null = null;
  
  // Formulaire principal
  roleForm!: FormGroup;
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  role$: Observable<RoleResponse | null>;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(selectRolesLoading);
    this.error$ = this.store.select(selectRolesError);
    this.role$ = this.store.select(selectRoleById(''));
    
    this.initializeForm();
  }
  
  private initializeForm(): void {
    this.roleForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }
  
  ngOnInit(): void {
    // Attendre un tick pour que les données soient assignées par Object.assign
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
    
    // Écouter les succès de création/modification pour fermer le panel
    this.actions$.pipe(
      ofType(RolesActions.createRoleSuccess, RolesActions.updateRoleSuccess),
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
    if (this.role && this.isEdit) {
      // Mode side panel avec rôle fourni
      this.isEditMode = true;
      this.roleId = this.role.id;
      this.populateForm(this.role);
    } else if (!this.role && this.isEdit) {
      // Mode side panel sans rôle (cas d'erreur)
      console.error('Mode édition mais aucun rôle fourni');
    } else if (!this.role && !this.isEdit) {
      // Mode side panel nouveau rôle
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
      this.roleId = id;
      this.store.dispatch(RolesActions.loadRole({ id }));
      
      // S'abonner au rôle sélectionné
      this.role$ = this.store.select(selectRoleById(id));
      this.role$.pipe(takeUntil(this.destroy$)).subscribe(role => {
        if (role) {
          this.populateForm(role);
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
   * Peupler le formulaire avec les données du rôle
   */
  populateForm(role: RoleResponse): void {
    this.roleForm.patchValue({
      nom: role.nom,
      description: role.description
    });
  }
  
  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.roleForm.valid) {
      const roleData: RoleRequest = {
        nom: this.roleForm.value.nom,
        description: this.roleForm.value.description
      };

      if (this.isEditMode && this.roleId) {
        // Mise à jour
        this.store.dispatch(RolesActions.updateRole({ 
          id: this.roleId, 
          request: roleData 
        }));
      } else {
        // Création
        this.store.dispatch(RolesActions.createRole({ 
          request: roleData 
        }));
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.roleForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  /**
   * Vérifier si on est dans le side panel
   */
  private isInSidePanel(): boolean {
    return this.role !== undefined || this.isEdit !== undefined;
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
    return this.isEditMode ? 'Modifier le rôle' : 'Nouveau rôle';
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
    this.router.navigate(['/administration/roles']);
  }
  
  /**
   * Fermer le side panel et émettre l'événement
   */
  closePanel(success: boolean = false): void {
    this.onClose.emit(success);
    this.sidePanelService.close();
  }
  
  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldErrorMessage(fieldName: string): string {
    const control = this.roleForm.get(fieldName);
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
    }
    return '';
  }
  
  /**
   * Vérifier si un champ a une erreur
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.roleForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
} 