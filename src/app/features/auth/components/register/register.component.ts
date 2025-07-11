import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthActions } from '../../../../store/auth';
import { selectAuthError, selectAuthLoading } from '../../../../store/auth/auth.selectors';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  hidePassword = true;
  hideConfirmPassword = true;
  
  // Options pour les sélecteurs
  roles = [
    { value: 'DOCTOR', label: 'Médecin' },
    { value: 'NURSE', label: 'Infirmière' },
    { value: 'USER', label: 'Utilisateur' }
  ];
  
  specialties = [
    'Gynécologie-Obstétrique',
    'Pédiatrie',
    'Médecine générale',
    'Sage-femme',
    'Échographie',
    'Anesthésie-Réanimation'
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    
    this.initializeForm();
  }

  ngOnInit(): void {
    // S'abonner aux erreurs pour les afficher via snackBar
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
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

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      role: ['', Validators.required],
      specialty: [''],
      etablissement: [''],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
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
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const registerData = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        email: this.registerForm.value.email,
        telephone: this.registerForm.value.telephone,
        role: this.registerForm.value.role,
        specialty: this.registerForm.value.specialty,
        etablissement: this.registerForm.value.etablissement,
        password: this.registerForm.value.password
      };
      
      // TODO: Implémenter l'action register dans le store
      // this.store.dispatch(AuthActions.register({ request: registerData }));
      
      // Simulation temporaire
      this.simulateRegistration(registerData);
      
    } else {
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  private simulateRegistration(data: any): void {
    console.log('Données d\'inscription:', data);
    
    setTimeout(() => {
      this.notificationService.success(
        'Inscription réussie ! Vous pouvez maintenant vous connecter.',
        'Compte créé'
      );
      this.navigateToLogin();
    }, 2000);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Méthodes pour la validation du mot de passe
  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && password.length >= 8;
  }

  hasUpperCase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[a-z]/.test(password);
  }

  hasNumeric(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }
} 