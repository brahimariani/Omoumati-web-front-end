import { Component, OnInit, OnDestroy, Input, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';

import { UtilisateurResponse } from '../../../../core/models/utilisateur/utilisateur.response.model';
import { UtilisateurRequest } from '../../../../core/models/utilisateur/utlisateur.request.model';
import { StatutUtilisateur } from '../../../../core/models/utilisateur/statututilisateur.model';
import { UtilisateurUpdateRequest, UtilisateurUpdateHelper } from '../../../../core/models/utilisateur/utilisateur-update.model';
import { UtilisateursActions } from '../../../../store/utilisateurs/utilisateurs.actions';
import { selectUtilisateursLoading, selectUtilisateursError, selectSelectedUtilisateur } from '../../../../store/utilisateurs/utilisateurs.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { RoleService } from '../../../../core/services/role.service';
import { RoleResponse } from '../../../../core/models/role/role.response.model';
import { RolesActions } from '../../../../store/roles/roles.actions';
import { selectAllRolesSimple, selectRolesLoading } from '../../../../store/roles/roles.selectors';
import { CentresActions } from '../../../../store/centres/centres.actions';
import { selectAllCentres, selectCentresLoading } from '../../../../store/centres/centres.selectors';
import { CentreResponse } from '../../../../core/models/centre/centre.response.model';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './utilisateur-form.component.html',
  styleUrls: ['./utilisateur-form.component.css']
})
export class UtilisateurFormComponent implements OnInit, OnDestroy {
  @Input() utilisateur?: UtilisateurResponse;
  @Input() isEdit = false;
  
  utilisateurForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedUtilisateur$: Observable<UtilisateurResponse | null>;
  
  private destroy$ = new Subject<void>();
  private utilisateurId?: string;
  
  // Observables pour les données dynamiques
  roles$: Observable<RoleResponse[]>;
  rolesLoading$: Observable<boolean>;
  centres$: Observable<CentreResponse[]>;
  centresLoading$: Observable<boolean>;
  filteredCentres$: Observable<CentreResponse[]>;

  // Statuts disponibles
  statutOptions = [
    { value: StatutUtilisateur.ACTIF, label: 'Actif' },
    { value: StatutUtilisateur.INACTIF, label: 'Inactif' },
    { value: StatutUtilisateur.SUSPENDU, label: 'Suspendu' },
    { value: StatutUtilisateur.SUPPRIME, label: 'Supprimé' }
  ];

  // Rôles chargés depuis le service
  roles: RoleResponse[] = [];

  // Centres chargés depuis le service
  centres: CentreResponse[] = [];
  
  // Terme de recherche pour filtrer les centres
  centreSearchTerm = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    public router: Router, // Public pour le template
    private route: ActivatedRoute,
    private actions$: Actions,
    private roleService: RoleService,
    @Optional() private sidePanelService?: SidePanelService
  ) {
    // Détection robuste du mode édition dès le constructeur
    this.detectEditModeRobust();
    
    // Créer le formulaire avec les bonnes validations
    this.utilisateurForm = this.createForm();

    // Initialiser les observables
    this.loading$ = this.store.select(selectUtilisateursLoading);
    this.error$ = this.store.select(selectUtilisateursError);
    this.selectedUtilisateur$ = this.store.select(selectSelectedUtilisateur);

    // Observables pour les rôles
    this.roles$ = this.store.select(selectAllRolesSimple);
    this.rolesLoading$ = this.store.select(selectRolesLoading);

    // Observables pour les centres
    this.centres$ = this.store.select(selectAllCentres);
    this.centresLoading$ = this.store.select(selectCentresLoading);
    this.filteredCentres$ = this.centres$;
  }

  ngOnInit(): void {
    // Charger les données de référence
    this.store.dispatch(RolesActions.loadAllRolesSimple());
    this.store.dispatch(CentresActions.loadCentres({ page: 0, size: 1000 }));

    // Écouter les changements de l'utilisateur sélectionné
    this.selectedUtilisateur$
      .pipe(
        filter((utilisateur): utilisateur is UtilisateurResponse => !!utilisateur),
        takeUntil(this.destroy$)
      )
      .subscribe(utilisateur => {
        this.utilisateur = utilisateur;
        this.patchFormWithUser(utilisateur);
      });

    // Écouter les rôles pour la liste locale
    this.roles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roles => {
        this.roles = roles;
      });

    // Écouter les centres pour la liste locale
    this.centres$
      .pipe(takeUntil(this.destroy$))
      .subscribe(centres => {
        this.centres = centres;
      });

    // Écouter les actions de succès
    this.actions$
      .pipe(
        ofType(
          UtilisateursActions.createUtilisateurSuccess,
          UtilisateursActions.updateUtilisateurSuccess
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.snackBar.open(
          this.isEdit ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        // Fermer le side panel ou naviguer selon le contexte
        if (this.sidePanelService) {
          this.sidePanelService.close();
        } else {
          this.router.navigate(['/administration/utilisateurs']);
        }
      });

    // Écouter les erreurs
    this.actions$
      .pipe(
        ofType(
          UtilisateursActions.createUtilisateurFailure,
          UtilisateursActions.updateUtilisateurFailure
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(action => {
        console.error('Erreur lors de la sauvegarde:', action.error);
        
        let errorMessage = 'Une erreur est survenue';
        if (action.error?.includes('email already exist')) {
          errorMessage = 'Cette adresse email est déjà utilisée';
        } else if (action.error?.includes('matricule already exist')) {
          errorMessage = 'Ce matricule est déjà utilisé';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      adresse: ['', [Validators.required]],
      roleId: ['', [Validators.required]],
      centreId: ['', [Validators.required]],
      statut: [StatutUtilisateur.ACTIF, [Validators.required]],
      motDePasse: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      confirmationMotDePasse: ['', this.isEdit ? [] : [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    return form;
  }

  /**
   * Validateur personnalisé pour vérifier que les mots de passe correspondent
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('motDePasse');
    const confirmPassword = control.get('confirmationMotDePasse');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Pré-remplir le formulaire avec les données d'un utilisateur existant
   */
  private patchFormWithUser(utilisateur: UtilisateurResponse): void {
    this.utilisateurForm.patchValue({
      matricule: utilisateur.matricule,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      adresse: utilisateur.adresse,
      roleId: utilisateur.role?.id || '',
      centreId: utilisateur.centre?.id || '', // Utiliser l'ID du centre de l'utilisateur
      statut: utilisateur.statut
    });
    
    // En mode édition, les mots de passe ne sont pas requis
    this.utilisateurForm.get('motDePasse')?.clearValidators();
    this.utilisateurForm.get('confirmationMotDePasse')?.clearValidators();
    this.utilisateurForm.get('motDePasse')?.updateValueAndValidity();
    this.utilisateurForm.get('confirmationMotDePasse')?.updateValueAndValidity();
  }

  onSubmit(): void {
    console.log('=== DÉBUT onSubmit ===');
    console.log('État actuel du composant:', {
      isEdit: this.isEdit,
      utilisateurId: this.utilisateurId,
      utilisateur: this.utilisateur,
      currentUrl: this.router.url,
      routeParams: this.route.snapshot.params
    });

    if (this.utilisateurForm.valid) {
      const formData = this.utilisateurForm.value;
      
      // Construire l'objet de requête
      const utilisateurRequest: UtilisateurRequest = {
        matricule: formData.matricule,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        password: formData.motDePasse || '',
        statut: formData.statut,
        role: {
          id: formData.roleId,
          nom: this.roles.find(r => r.id === formData.roleId)?.nom || '',
          description: '',
          utilisateurs: []
        },
        centre: {
          id: formData.centreId,
          nom: this.centres.find(c => c.id === formData.centreId)?.nom || '',
          adresse: this.centres.find(c => c.id === formData.centreId)?.adresse || '',
          telephone: this.centres.find(c => c.id === formData.centreId)?.telephone || '',
          email: this.centres.find(c => c.id === formData.centreId)?.email || '',
          siteWeb: this.centres.find(c => c.id === formData.centreId)?.siteWeb || '',
          type: this.centres.find(c => c.id === formData.centreId)?.type || 'HOPITAL' as any
        }
      };

      if (this.isEdit && this.utilisateurId) {
        // Mode édition - utiliser une approche plus intelligente
        console.log('Mode édition:', {
          userId: this.utilisateurId,
          currentEmail: this.utilisateur?.email,
          newEmail: formData.email,
          hasPassword: !!formData.motDePasse,
          originalUser: this.utilisateur
        });
        
        // Créer une requête de mise à jour intelligente
        const updateRequest = UtilisateurUpdateHelper.createUpdateRequest(
          formData,
          this.utilisateur,
          !!formData.motDePasse && formData.motDePasse.trim() !== ''
        );
        
        // Toujours inclure les champs obligatoires même s'ils n'ont pas changé
        // pour éviter des erreurs côté serveur
        const completeUpdateRequest: UtilisateurRequest = {
          matricule: formData.matricule,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          password: (formData.motDePasse && formData.motDePasse.trim() !== '') ? formData.motDePasse : '',
          statut: formData.statut,
          role: {
            id: formData.roleId,
            nom: this.roles.find(r => r.id === formData.roleId)?.nom || '',
            description: '',
            utilisateurs: []
          },
          centre: {
            id: formData.centreId,
            nom: this.centres.find(c => c.id === formData.centreId)?.nom || '',
            adresse: this.centres.find(c => c.id === formData.centreId)?.adresse || '',
            telephone: this.centres.find(c => c.id === formData.centreId)?.telephone || '',
            email: this.centres.find(c => c.id === formData.centreId)?.email || '',
            siteWeb: this.centres.find(c => c.id === formData.centreId)?.siteWeb || '',
            type: this.centres.find(c => c.id === formData.centreId)?.type || 'HOPITAL' as any
          }
        };
        
        this.store.dispatch(UtilisateursActions.updateUtilisateur({ 
          id: this.utilisateurId, 
          request: completeUpdateRequest 
        }));
      } else {
        // Mode création
        console.log('Mode création:', {
          email: formData.email,
          hasPassword: !!formData.motDePasse
        });
        
        this.store.dispatch(UtilisateursActions.createUtilisateur({ 
          request: utilisateurRequest 
        }));
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onCancel(): void {
    if (this.sidePanelService) {
      this.sidePanelService.close();
    } else {
      this.router.navigate(['/administration/utilisateurs']);
    }
  }

  onReset(): void {
    this.utilisateurForm.reset();
    this.utilisateurForm.patchValue({
      statut: StatutUtilisateur.ACTIF
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.utilisateurForm.controls).forEach(key => {
      const control = this.utilisateurForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour faciliter l'accès aux erreurs dans le template
  get matricule() { return this.utilisateurForm.get('matricule'); }
  get nom() { return this.utilisateurForm.get('nom'); }
  get prenom() { return this.utilisateurForm.get('prenom'); }
  get email() { return this.utilisateurForm.get('email'); }
  get telephone() { return this.utilisateurForm.get('telephone'); }
  get adresse() { return this.utilisateurForm.get('adresse'); }
  get roleId() { return this.utilisateurForm.get('roleId'); }
  get centreId() { return this.utilisateurForm.get('centreId'); }
  get statut() { return this.utilisateurForm.get('statut'); }
  get motDePasse() { return this.utilisateurForm.get('motDePasse'); }
  get confirmationMotDePasse() { return this.utilisateurForm.get('confirmationMotDePasse'); }

  /**
   * Vérifier si le formulaire a des erreurs de correspondance de mot de passe
   */
  get hasPasswordMismatch(): boolean {
    return !!(this.utilisateurForm.hasError('passwordMismatch') && 
           (this.motDePasse?.touched || this.confirmationMotDePasse?.touched));
  }

  /**
   * Obtenir le titre du formulaire
   */
  get formTitle(): string {
    return this.isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur';
  }

  /**
   * Obtenir le texte du bouton de soumission
   */
  get submitButtonText(): string {
    return this.isEdit ? 'Mettre à jour' : 'Créer';
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.utilisateurForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    
    if (field?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'telephone') {
        return 'Format de téléphone invalide';
      }
    }
    
    return '';
  }

  /**
   * Filtre les centres selon le terme de recherche
   */
  filterCentres(searchTerm: string): void {
    this.centreSearchTerm = searchTerm;
    if (!searchTerm.trim()) {
      this.filteredCentres$ = this.centres$;
    } else {
      this.filteredCentres$ = this.centres$.pipe(
        map((centres: CentreResponse[]) => centres.filter((centre: CentreResponse) =>
          centre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          centre.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          centre.telephone?.includes(searchTerm) ||
          centre.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
  }

  /**
   * Obtient le centre sélectionné
   */
  getSelectedCentre(): CentreResponse | null {
    const centreId = this.utilisateurForm.get('centreId')?.value;
    if (!centreId) return null;
    
    return this.centres.find(centre => centre.id === centreId) || null;
  }

  /**
   * Méthode robuste pour détecter le mode édition et extraire l'ID
   */
  detectEditModeRobust(): void {
    const currentUrl = this.router.url;
    const routeParams = this.route.snapshot.params;
    
    // Méthode 1: Via les paramètres de route
    let userId = routeParams['id'];
    
    // Méthode 2: Extraction directe de l'URL
    if (!userId) {
      userId = this.extractUserIdFromUrl(currentUrl);
    }
    
    // Méthode 3: Vérifier d'autres clés possibles
    if (!userId) {
      const allParams = Object.entries(routeParams);
      
      // Chercher une valeur qui ressemble à un UUID
      for (const [key, value] of allParams) {
        if (typeof value === 'string' && value.match(/^[a-f0-9\-]{36}$/i)) {
          userId = value;
          break;
        }
      }
    }
    
    // Appliquer les résultats
    if (userId && userId !== 'nouveau') {
      this.isEdit = true;
      this.utilisateurId = userId;
      
      // Recréer le formulaire avec les bonnes validations
      this.utilisateurForm = this.createForm();
      
      // Charger l'utilisateur
      this.store.dispatch(UtilisateursActions.loadUtilisateur({ id: userId }));
    } else {
      this.isEdit = false;
      this.utilisateurId = undefined;
    }
  }

  /**
   * Extraire l'ID utilisateur directement de l'URL comme solution de secours
   */
  private extractUserIdFromUrl(url: string): string | null {
    // Pattern pour extraire l'ID d'une URL comme /administration/utilisateurs/45aa9bd7-463a-4747-bc28-2083147db869
    const match = url.match(/\/utilisateurs\/([a-f0-9\-]{36})/i);
    return match ? match[1] : null;
  }
} 