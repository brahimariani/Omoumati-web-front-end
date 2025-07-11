import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthActions } from '../../../../store/auth';
import { selectAuthError, selectAuthLoading } from '../../../../store/auth/auth.selectors';
import { NotificationService } from '../../../../core/services/notification.service';

interface ForgotPasswordStep {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-forgot-password',
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
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  emailForm!: FormGroup;
  codeForm!: FormGroup;
  passwordForm!: FormGroup;
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  currentStep = 0;
  emailSent = false;
  codeVerified = false;
  passwordReset = false;
  hidePassword = true;
  hideConfirmPassword = true;
  
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
    
    this.initializeForms();
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

  private initializeForms(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
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
      return { 
        passwordComplexity: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecial
        }
      };
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

  onSubmitEmail(): void {
    if (this.emailForm.valid) {
      const email = this.emailForm.value.email;
      
      // TODO: Implémenter l'action forgotPassword dans le store
      // this.store.dispatch(AuthActions.forgotPassword({ email }));
      
      // Simulation temporaire
      this.simulateEmailSend(email);
    } else {
      this.emailForm.markAllAsTouched();
    }
  }

  onSubmitCode(): void {
    if (this.codeForm.valid) {
      const code = this.codeForm.value.code;
      const email = this.emailForm.value.email;
      
      // TODO: Implémenter la vérification du code
      // this.store.dispatch(AuthActions.verifyResetCode({ email, code }));
      
      // Simulation temporaire
      this.simulateCodeVerification(code);
    } else {
      this.codeForm.markAllAsTouched();
    }
  }

  onSubmitPassword(): void {
    if (this.passwordForm.valid) {
      const email = this.emailForm.value.email;
      const code = this.codeForm.value.code;
      const newPassword = this.passwordForm.value.newPassword;
      
      // TODO: Implémenter la réinitialisation du mot de passe
      // this.store.dispatch(AuthActions.resetPassword({ email, code, newPassword }));
      
      // Simulation temporaire
      this.simulatePasswordReset();
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  private simulateEmailSend(email: string): void {
    console.log(`Email de réinitialisation envoyé à: ${email}`);
    
    setTimeout(() => {
      this.emailSent = true;
      this.currentStep = 1;
      this.notificationService.success(
        `Un code de vérification a été envoyé à ${email}`,
        'Email envoyé'
      );
    }, 1500);
  }

  private simulateCodeVerification(code: string): void {
    // Simuler la vérification du code (accepter 123456 pour les tests)
    if (code === '123456') {
      setTimeout(() => {
        this.codeVerified = true;
        this.currentStep = 2;
        this.notificationService.success(
          'Code vérifié avec succès',
          'Vérification réussie'
        );
      }, 1000);
    } else {
      this.snackBar.open('Code de vérification incorrect', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private simulatePasswordReset(): void {
    setTimeout(() => {
      this.passwordReset = true;
      this.currentStep = 3;
      this.notificationService.success(
        'Votre mot de passe a été réinitialisé avec succès',
        'Mot de passe modifié'
      );
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        this.navigateToLogin();
      }, 3000);
    }, 1500);
  }

  resendCode(): void {
    const email = this.emailForm.value.email;
    this.simulateEmailSend(email);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToPreviousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Méthodes pour valider les critères du mot de passe dans le template
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
}
