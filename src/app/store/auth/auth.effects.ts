import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthActions } from './auth.actions';
import { StorageService } from '../../core/services/storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthEffects {
  
  private jwtHelper = new JwtHelperService();
  
  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(({ request }) => 
      this.authService.login(request).pipe(
        map((response) => AuthActions.loginSuccess({ response })),
        catchError((error) => {
          this.notificationService.error(
            'Erreur de connexion: ' + (error.message || 'Identifiants invalides'),
            'Échec de connexion'
          );
          return of(AuthActions.loginFailure({ error: error.message }));
        })
      )
    )
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ response }) => {
      // Extraire les informations utilisateur du token JWT
      const decodedToken = this.jwtHelper.decodeToken(response.token);
      const nom = decodedToken?.nom || '';
      const prenom = decodedToken?.prenom || '';
      
      this.notificationService.success(
        `Bienvenue, ${nom} ${prenom}`,
        'Connexion réussie'
      );
      
      // Récupérer l'URL de retour depuis les paramètres de query
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl') || '/patientes';
      
      this.router.navigate([returnUrl]);
    })
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => {
      // Suppression des tokens du localStorage
      this.storageService.remove('auth_token');
      this.storageService.remove('refresh_token');
      this.storageService.remove('token_expiry');
      
      // Notification
      this.notificationService.info('Vous avez été déconnecté avec succès');
      
      // Redirection
      this.router.navigate(['/auth/login']);
    }),
    map(() => AuthActions.logoutComplete())
  ));

  refreshToken$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.refreshToken),
    exhaustMap(() => 
      this.authService.refreshToken().pipe(
        map((response) => AuthActions.refreshTokenSuccess({ response })),
        catchError((error) => {
          // Échec silencieux du refresh token
          console.error('Échec du rafraîchissement du token:', error);
          return of(AuthActions.refreshTokenFailure({ error: error.message }));
        })
      )
    )
  ));

  refreshTokenFailure$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.refreshTokenFailure),
    map(() => AuthActions.logout())
  ));

  // Vérification initiale de l'authentification au démarrage de l'application
  initAuth$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.initAuth),
    switchMap(() => {
      const token = this.storageService.get<string>('auth_token');
      if (!token) {
        return of(AuthActions.initAuthComplete());
      }
      
      return this.authService.refreshToken().pipe(
        map((response) => AuthActions.refreshTokenSuccess({ response })),
        catchError(() => of(AuthActions.initAuthComplete()))
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private storageService: StorageService
  ) {}
} 