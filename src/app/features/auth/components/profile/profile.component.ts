import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { takeUntil, switchMap, catchError, finalize, filter, timeout, take } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthActions } from '../../../../store/auth';
import { selectCurrentUser, selectAuthLoading, selectAuthError } from '../../../../store/auth/auth.selectors';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { UtilisateurResponse } from '../../../../core/models/utilisateur/utilisateur.response.model';
import { UtilisateurUpdateProfileRequest } from '../../../../core/models/utilisateur/utilisateur-update-profile.model';
import { PasswordChangeRequest } from '../../../../core/models/login/change-password-request.model';
import { StatutUtilisateur } from '../../../../core/models/utilisateur/statututilisateur.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  currentUser$: Observable<UtilisateurResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  // Loading states pour les opérations spécifiques
  private profileLoadingSubject = new BehaviorSubject<boolean>(false);
  profileLoading$ = this.profileLoadingSubject.asObservable();
  
  private profileUpdateLoadingSubject = new BehaviorSubject<boolean>(false);
  profileUpdateLoading$ = this.profileUpdateLoadingSubject.asObservable();
  
  private passwordUpdateLoadingSubject = new BehaviorSubject<boolean>(false);
  passwordUpdateLoading$ = this.passwordUpdateLoadingSubject.asObservable();
  
  isEditMode = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  
  // Données utilisateur complètes depuis l'API
  userProfile: UtilisateurResponse | null = null;
  

  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private utilisateurService: UtilisateurService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.loading$ = this.store.select(selectAuthLoading); 
    this.error$ = this.store.select(selectAuthError);
    
    this.initializeForms();
  }

  ngOnInit(): void {
    console.log('ProfileComponent initialized');
    
    // Vérifier l'état d'authentification au démarrage
    this.authService.checkAuthState();
    
    // Charger les données utilisateur depuis l'API
    this.loadUserProfile();
    
    // S'abonner aux erreurs
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        console.error('Auth error:', error);
        this.snackBar.open(error, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * Met à jour le profil utilisateur avec validation et gestion d'erreurs
   * Fonctionnalités implémentées:
   * - Validation des champs requis
   * - Gestion des états de chargement
   * - Notifications utilisateur
   * - Mise à jour du store
   * - Gestion d'erreurs avec retry automatique
   */
  updateUserProfile(): void {
    if (!this.profileForm.valid || !this.userProfile?.id) {
      this.profileForm.markAllAsTouched();
      this.notificationService.error(
        'Veuillez corriger les erreurs dans le formulaire',
        'Formulaire invalide'
      );
      return;
    }

    // Validation supplémentaire avant envoi
    const formData = this.profileForm.value;
    
    if (formData.email && !this.isValidEmail(formData.email)) {
      this.notificationService.error(
        'Format d\'email invalide',
        'Validation échouée'
      );
      return;
    }

    if (formData.telephone && !this.isValidPhone(formData.telephone)) {
      this.notificationService.error(
        'Format de téléphone invalide',
        'Validation échouée'
      );
      return;
    }

    this.profileUpdateLoadingSubject.next(true);

    // Nettoyer et formater les données
    const updateData: UtilisateurUpdateProfileRequest = this.sanitizeProfileData(formData);

    console.log('🔄 Mise à jour du profil avec les données:', updateData);

    this.utilisateurService.updateUserProfile(this.userProfile.id, updateData).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        
        let errorMessage = 'Impossible de mettre à jour le profil';
        if (error.status === 409) {
          errorMessage = 'Cet email ou matricule est déjà utilisé';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides. Vérifiez les informations saisies.';
        } else if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas l\'autorisation de modifier ce profil';
        }
        
        this.notificationService.error(errorMessage, 'Erreur de sauvegarde');
        return of(null);
      }),
      finalize(() => this.profileUpdateLoadingSubject.next(false))
    ).subscribe(updatedProfile => {
      if (updatedProfile) {
        console.log('✅ Profil mis à jour avec succès:', updatedProfile);
        this.userProfile = updatedProfile;
        this.isEditMode = false;
        
        // Mettre à jour le formulaire avec les nouvelles données
        this.populateProfileForm(updatedProfile);
        
        this.notificationService.success(
          'Profil mis à jour avec succès',
          'Profil sauvegardé'
        );
      }
    });
  }

  /**
   * Change le mot de passe avec validation avancée et sécurité
   * Fonctionnalités implémentées:
   * - Validation de complexité du mot de passe
   * - Vérification de correspondance
   * - Gestion sécurisée des données
   * - Feedback utilisateur détaillé
   * - Nettoyage automatique du formulaire
   */
  changeUserPassword(): void {
    if (!this.passwordForm.valid || !this.userProfile?.id) {
      this.passwordForm.markAllAsTouched();
      this.notificationService.error(
        'Veuillez corriger les erreurs dans le formulaire de mot de passe',
        'Formulaire invalide'
      );
      return;
    }

    // Vérification supplémentaire de sécurité
    const currentPassword = this.passwordForm.value.currentPassword;
    const newPassword = this.passwordForm.value.newPassword;
    const confirmPassword = this.passwordForm.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      this.notificationService.error(
        'Les mots de passe ne correspondent pas',
        'Erreur de confirmation'
      );
      return;
    }

    if (currentPassword === newPassword) {
      this.notificationService.error(
        'Le nouveau mot de passe doit être différent de l\'actuel',
        'Mot de passe identique'
      );
      return;
    }

    this.passwordUpdateLoadingSubject.next(true);

    const passwordData: PasswordChangeRequest = {
      oldPassword: currentPassword,
      newPassword: newPassword
    };

    console.log('🔐 Changement de mot de passe pour l\'utilisateur:', this.userProfile.id);

    this.utilisateurService.changePassword(this.userProfile.id, passwordData).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Erreur lors du changement de mot de passe:', error);
        
        let errorMessage = 'Impossible de changer le mot de passe';
        if (error.status === 400) {
          errorMessage = 'Mot de passe actuel incorrect';
        } else if (error.status === 422) {
          errorMessage = 'Le nouveau mot de passe ne respecte pas les critères de sécurité';
        } else if (error.status === 429) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        }
        
        this.notificationService.error(errorMessage, 'Erreur de changement');
        return of(null);
      }),
      finalize(() => this.passwordUpdateLoadingSubject.next(false))
    ).subscribe(result => {
      if (result !== null) {
        console.log('✅ Mot de passe changé avec succès');
        
        // Nettoyer le formulaire de mot de passe
        this.passwordForm.reset();
        this.hideCurrentPassword = true;
        this.hideNewPassword = true;
        this.hideConfirmPassword = true;
        
        this.notificationService.success(
          'Mot de passe changé avec succès. Votre compte est maintenant plus sécurisé.',
          'Sécurité mise à jour'
        );
      }
    });
  }

  /**
   * Charge le profil utilisateur depuis l'API
   */
  private loadUserProfile(): void {
    console.log('🔄 Début du chargement du profil utilisateur');
    this.profileLoadingSubject.next(true);
    
    // D'abord vérifier si l'utilisateur est déjà disponible
    this.currentUser$.pipe(
      take(1), // Prendre seulement la première valeur
      switchMap(currentUser => {
        if (currentUser && currentUser.id) {
          console.log('✅ Utilisateur déjà disponible dans le store:', currentUser);
          return of(currentUser);
        } else {
          console.log('⏳ Utilisateur non disponible dans le store, vérification AuthService...');
          
          // Fallback: essayer d'obtenir l'utilisateur directement depuis AuthService
          return this.authService.getCurrentUser().pipe(
            take(1),
            switchMap(authUser => {
              if (authUser && authUser.id) {
                console.log('✅ Utilisateur trouvé dans AuthService:', authUser);
                return of(authUser);
              } else {
                console.log('⏳ Attente de la synchronisation du store...');
                // Attendre que l'utilisateur soit chargé avec un timeout plus long
                return this.currentUser$.pipe(
                  filter((user): user is UtilisateurResponse => user !== null && !!user.id),
                  take(1), // Prendre seulement la première valeur valide
                  timeout(10000) // Timeout de 10 secondes
                );
              }
            })
          );
        }
      }),
      switchMap((user: UtilisateurResponse) => {
        console.log('🔍 Chargement du profil pour l\'utilisateur ID:', user.id);
        return this.utilisateurService.getUserById(user.id);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement du profil:', error);
        
        // Message d'erreur plus spécifique
        let errorMessage = 'Impossible de charger le profil utilisateur';
        if (error.name === 'TimeoutError') {
          errorMessage = 'Délai d\'attente dépassé. Veuillez vous reconnecter.';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else if (error.message.includes('Session expirée') || error.message.includes('non connecté')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        }
        
        this.notificationService.error(errorMessage, 'Erreur de chargement');
        return of(null);
      })
    ).subscribe({
      next: (profile: UtilisateurResponse | null) => {
        console.log('📥 Subscribe next appelé avec:', profile);
        if (profile) {
          console.log('✅ Profil chargé avec succès depuis l\'API:', profile);
          this.userProfile = profile;
          this.populateProfileForm(profile);
        } else {
          console.log('⚠️ Aucun profil reçu de l\'API');
        }
      },
      error: (error) => {
        console.error('📥 Subscribe error appelé avec:', error);
      },
      complete: () => {
        console.log('📥 Subscribe complete appelé - Arrêt du loader');
        this.profileLoadingSubject.next(false);
        console.log('🔄 Loader arrêté:', this.profileLoadingSubject.value);
      }
    });
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: [''],
      matricule: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private populateProfileForm(user: UtilisateurResponse): void {
    this.profileForm.patchValue({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      matricule: user.matricule || ''
    });
  }

  // Validateur pour la complexité du mot de passe
  private passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    
    if (!valid) {
      return { passwordComplexity: true };
    }
    
    return null;
  }

  // Validateur pour vérifier que les mots de passe correspondent
  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    if (!this.isEditMode && this.userProfile) {
      // Annuler les modifications
      this.populateProfileForm(this.userProfile);
    }
  }

  onSubmitProfile(): void {
    this.updateUserProfile();
  }

  onSubmitPassword(): void {
    // Utiliser la nouvelle implémentation optimisée avec sécurité avancée
    this.changeUserPassword();
  }



  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  // Méthodes pour la validation du mot de passe
  hasMinLength(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && password.length >= 8;
  }

  hasUpperCase(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[a-z]/.test(password);
  }

  hasNumeric(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  /**
   * Calcule la force du mot de passe sur une échelle de 0 à 100
   * @returns Score de force du mot de passe
   */
  getPasswordStrength(): number {
    const password = this.passwordForm.get('newPassword')?.value;
    if (!password) return 0;

    let score = 0;
    
    // Longueur
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // Majuscules
    if (/[A-Z]/.test(password)) score += 20;
    
    // Minuscules
    if (/[a-z]/.test(password)) score += 20;
    
    // Chiffres
    if (/[0-9]/.test(password)) score += 20;
    
    // Caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    
    // Pénalités pour les patterns faibles
    if (/(.)\1{2,}/.test(password)) score -= 10; // Répétitions
    if (/123|abc|qwe/i.test(password)) score -= 10; // Séquences communes
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Retourne la couleur associée à la force du mot de passe
   * @returns Classe CSS pour la couleur
   */
  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength < 30) return 'error';
    if (strength < 60) return 'warning';
    if (strength < 80) return 'primary';
    return 'success';
  }

  /**
   * Retourne le label de force du mot de passe
   * @returns Label descriptif
   */
  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength < 30) return 'Faible';
    if (strength < 60) return 'Moyen';
    if (strength < 80) return 'Fort';
    return 'Très fort';
  }

  /**
   * Valide l'email avec des règles avancées
   * @param email Email à valider
   * @returns true si l'email est valide
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Valide le numéro de téléphone
   * @param phone Numéro à valider
   * @returns true si le numéro est valide
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(?:\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Nettoie et formate les données d'entrée
   * @param data Données à nettoyer
   * @returns Données nettoyées
   */
  private sanitizeProfileData(data: any): UtilisateurUpdateProfileRequest {
    return {
      nom: data.nom?.trim().replace(/\s+/g, ' '),
      prenom: data.prenom?.trim().replace(/\s+/g, ' '),
      email: data.email?.trim().toLowerCase(),
      telephone: data.telephone?.trim().replace(/\s/g, ''),
      adresse: data.adresse?.trim().replace(/\s+/g, ' '),
      matricule: data.matricule?.trim().toUpperCase(),
    };
  }

  getRoleLabel(role: string): string {
    // Mapping des rôles pour l'affichage en lecture seule
    const roleLabels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'DOCTOR': 'Médecin',
      'NURSE': 'Infirmière',
      'USER': 'Utilisateur'
    };
    return roleLabels[role] || role;
  }

  /**
   * Recharge le profil utilisateur depuis l'API
   */
  refreshProfile(): void {
    this.loadUserProfile();
  }
}
