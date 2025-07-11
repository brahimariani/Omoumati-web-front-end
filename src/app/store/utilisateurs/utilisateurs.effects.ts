import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UtilisateursActions } from './utilisateurs.actions';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class UtilisateursEffects {

  constructor(
    private actions$: Actions,
    private utilisateurService: UtilisateurService,
    private notificationService: NotificationService
  ) {}

  // ============================
  // CHARGEMENT DES UTILISATEURS
  // ============================

  loadUtilisateurs$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.loadUtilisateurs),
    switchMap(({ page, size, sort, direction }) => {
      return this.utilisateurService.getAllUsers(page, size).pipe(
        map(data => UtilisateursActions.loadUtilisateursSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          return of(UtilisateursActions.loadUtilisateursFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du chargement des utilisateurs'
          }));
        })
      );
    })
  ));

  // Chargement d'un utilisateur spécifique
  loadUtilisateur$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.loadUtilisateur),
    switchMap(({ id }) => {
      return this.utilisateurService.getUserById(id).pipe(
        map(data => UtilisateursActions.loadUtilisateurSuccess({ data })),
        catchError(error => {
          console.error(`Erreur lors du chargement de l'utilisateur ${id}:`, error);
          return of(UtilisateursActions.loadUtilisateurFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du chargement de l\'utilisateur'
          }));
        })
      );
    })
  ));

  // ============================
  // RECHERCHE D'UTILISATEURS
  // ============================

  searchUtilisateurs$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.searchUtilisateurs),
    switchMap(({ searchTerm, page, size }) => {
      return this.utilisateurService.searchUsers(searchTerm, page, size).pipe(
        map(data => UtilisateursActions.searchUtilisateursSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de la recherche d\'utilisateurs:', error);
          return of(UtilisateursActions.searchUtilisateursFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la recherche'
          }));
        })
      );
    })
  ));

  // ============================
  // CRÉATION D'UTILISATEUR
  // ============================

  createUtilisateur$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.createUtilisateur),
    switchMap(({ request }) => {
      return this.utilisateurService.createUser(request).pipe(
        map(data => UtilisateursActions.createUtilisateurSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de la création de l\'utilisateur:', error);
          return of(UtilisateursActions.createUtilisateurFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la création de l\'utilisateur'
          }));
        })
      );
    })
  ));

  // Notification de succès pour la création
  createUtilisateurSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.createUtilisateurSuccess),
    tap(({ data }) => {
      this.notificationService.success(
        `L'utilisateur ${data.prenom} ${data.nom} a été créé avec succès`,
        'Création réussie'
      );
    })
  ), { dispatch: false });

  // ============================
  // MISE À JOUR D'UTILISATEUR
  // ============================

  updateUtilisateur$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.updateUtilisateur),
    switchMap(({ id, request }) => {
      return this.utilisateurService.updateUser(id, request).pipe(
        map(data => UtilisateursActions.updateUtilisateurSuccess({ data })),
        catchError(error => {
          console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
          
          // Gestion spécifique des erreurs de mise à jour
          let errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';
          
          if (error.status === 400) {
            if (error.error?.message?.includes('email') || error.error?.message?.includes('Email')) {
              errorMessage = 'Une erreur est survenue. Veuillez vérifier que l\'email n\'est pas déjà utilisé par un autre utilisateur.';
            } else if (error.error?.message?.includes('matricule')) {
              errorMessage = 'Le matricule spécifié est déjà utilisé par un autre utilisateur.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
          } else if (error.status === 404) {
            errorMessage = 'Utilisateur non trouvé.';
          } else if (error.status === 403) {
            errorMessage = 'Vous n\'avez pas les droits nécessaires pour modifier cet utilisateur.';
          }
          
          return of(UtilisateursActions.updateUtilisateurFailure({ 
            error: error.customMessage || errorMessage
          }));
        })
      );
    })
  ));

  // Notification de succès pour la mise à jour
  updateUtilisateurSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.updateUtilisateurSuccess),
    tap(({ data }) => {
      this.notificationService.success(
        `L'utilisateur ${data.prenom} ${data.nom} a été mis à jour avec succès`,
        'Mise à jour réussie'
      );
    })
  ), { dispatch: false });

  // ============================
  // SUPPRESSION D'UTILISATEUR
  // ============================

  deleteUtilisateur$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.deleteUtilisateur),
    switchMap(({ id }) => {
      return this.utilisateurService.deleteUser(id).pipe(
        map(() => UtilisateursActions.deleteUtilisateurSuccess({ id })),
        catchError(error => {
          console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
          return of(UtilisateursActions.deleteUtilisateurFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la suppression de l\'utilisateur'
          }));
        })
      );
    })
  ));

  // Notification de succès pour la suppression
  deleteUtilisateurSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.deleteUtilisateurSuccess),
    tap(() => {
      this.notificationService.success(
        'L\'utilisateur a été supprimé avec succès',
        'Suppression réussie'
      );
    })
  ), { dispatch: false });

  // ============================
  // FILTRAGE PAR RÔLE
  // ============================

  filterByRole$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.filterByRole),
    switchMap(({ roleId, page, size }) => {
      return this.utilisateurService.getUsersByRole(roleId, page, size).pipe(
        map(data => UtilisateursActions.filterByRoleSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du filtrage par rôle:', error);
          return of(UtilisateursActions.filterByRoleFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du filtrage par rôle'
          }));
        })
      );
    })
  ));

  // ============================
  // FILTRAGE PAR STATUT
  // ============================

  filterByStatus$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.filterByStatus),
    switchMap(({ statut, page, size }) => {
      return this.utilisateurService.getUsersByStatus(statut, page, size).pipe(
        map(data => UtilisateursActions.filterByStatusSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du filtrage par statut:', error);
          return of(UtilisateursActions.filterByStatusFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du filtrage par statut'
          }));
        })
      );
    })
  ));


  // ============================
  // FILTRAGE AVANCÉ
  // ============================

  filterUtilisateurs$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.filterUtilisateurs),
    switchMap(({ filters, page, size }) => {
      return this.utilisateurService.filterUsers(filters, page, size).pipe(
        map(data => UtilisateursActions.filterUtilisateursSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du filtrage avancé:', error);
          return of(UtilisateursActions.filterUtilisateursFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du filtrage'
          }));
        })
      );
    })
  ));

  // ============================
  // GESTION DES STATUTS
  // ============================

  toggleUserStatus$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.toggleUserStatus),
    switchMap(({ userId, newStatus }) => {
      return this.utilisateurService.toggleUserStatus(userId, newStatus).pipe(
        map(data => UtilisateursActions.toggleUserStatusSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du changement de statut:', error);
          return of(UtilisateursActions.toggleUserStatusFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du changement de statut'
          }));
        })
      );
    })
  ));

  // Actions spécialisées de statut
  activateUser$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.activateUser),
    switchMap(({ userId }) => {
      return this.utilisateurService.activateUser(userId).pipe(
        map(data => UtilisateursActions.activateUserSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de l\'activation:', error);
          return of(UtilisateursActions.activateUserFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de l\'activation'
          }));
        })
      );
    })
  ));

  suspendUser$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.suspendUser),
    switchMap(({ userId }) => {
      return this.utilisateurService.suspendUser(userId).pipe(
        map(data => UtilisateursActions.suspendUserSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de la suspension:', error);
          return of(UtilisateursActions.suspendUserFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la suspension'
          }));
        })
      );
    })
  ));

  deactivateUser$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.deactivateUser),
    switchMap(({ userId }) => {
      return this.utilisateurService.deactivateUser(userId).pipe(
        map(data => UtilisateursActions.deactivateUserSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de la désactivation:', error);
          return of(UtilisateursActions.deactivateUserFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la désactivation'
          }));
        })
      );
    })
  ));

  // Notifications de succès pour les changements de statut
  statusChangeSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(
      UtilisateursActions.toggleUserStatusSuccess,
      UtilisateursActions.activateUserSuccess,
      UtilisateursActions.suspendUserSuccess,
      UtilisateursActions.deactivateUserSuccess
    ),
    tap(({ data }) => {
      const statusMessages = {
        'ACTIF': 'activé',
        'INACTIF': 'désactivé',
        'SUSPENDU': 'suspendu'
      };
      const status = statusMessages[data.statut as keyof typeof statusMessages] || 'modifié';
      this.notificationService.success(
        `L'utilisateur ${data.prenom} ${data.nom} a été ${status} avec succès`,
        'Statut modifié'
      );
    })
  ), { dispatch: false });

  // ============================
  // GESTION DES MOTS DE PASSE
  // ============================

  resetUserPassword$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.resetUserPassword),
    switchMap(({ userId, newPassword }) => {
      return this.utilisateurService.resetUserPassword(userId, newPassword).pipe(
        map(({ temporaryPassword }) => UtilisateursActions.resetUserPasswordSuccess({ 
          userId, 
          temporaryPassword 
        })),
        catchError(error => {
          console.error('Erreur lors de la réinitialisation du mot de passe:', error);
          return of(UtilisateursActions.resetUserPasswordFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la réinitialisation du mot de passe'
          }));
        })
      );
    })
  ));

  // Notification de succès pour la réinitialisation
  resetPasswordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.resetUserPasswordSuccess),
    tap(({ temporaryPassword }) => {
      this.notificationService.success(
        `Mot de passe réinitialisé. Mot de passe temporaire: ${temporaryPassword}`,
        'Réinitialisation réussie'
      );
    })
  ), { dispatch: false });

  changePassword$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.changePassword),
    switchMap(({ userId, passwordData }) => {
      return this.utilisateurService.changePassword(userId, passwordData).pipe(
        map(() => UtilisateursActions.changePasswordSuccess()),
        catchError(error => {
          console.error('Erreur lors du changement de mot de passe:', error);
          return of(UtilisateursActions.changePasswordFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du changement de mot de passe'
          }));
        })
      );
    })
  ));

  // Notification de succès pour le changement de mot de passe
  changePasswordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.changePasswordSuccess),
    tap(() => {
      this.notificationService.success(
        'Le mot de passe a été modifié avec succès',
        'Changement réussi'
      );
    })
  ), { dispatch: false });

  // ============================
  // GESTION DU PROFIL
  // ============================

  loadCurrentUserProfile$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.loadCurrentUserProfile),
    switchMap(() => {
      return this.utilisateurService.getCurrentUserProfile().pipe(
        map(data => UtilisateursActions.loadCurrentUserProfileSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du chargement du profil:', error);
          return of(UtilisateursActions.loadCurrentUserProfileFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du chargement du profil'
          }));
        })
      );
    })
  ));

  updateCurrentUserProfile$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.updateCurrentUserProfile),
    switchMap(({ userData }) => {
      return this.utilisateurService.updateCurrentUserProfile(userData).pipe(
        map(data => UtilisateursActions.updateCurrentUserProfileSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          return of(UtilisateursActions.updateCurrentUserProfileFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la mise à jour du profil'
          }));
        })
      );
    })
  ));

  updateUserProfile$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.updateUserProfile),
    switchMap(({ userId, userData }) => {
      return this.utilisateurService.updateUserProfile(userId, userData).pipe(
        map(data => UtilisateursActions.updateUserProfileSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
          return of(UtilisateursActions.updateUserProfileFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la mise à jour du profil'
          }));
        })
      );
    })
  ));

  // Notifications de succès pour les profils
  profileUpdateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(
      UtilisateursActions.updateCurrentUserProfileSuccess,
      UtilisateursActions.updateUserProfileSuccess
    ),
    tap(() => {
      this.notificationService.success(
        'Le profil a été mis à jour avec succès',
        'Profil modifié'
      );
    })
  ), { dispatch: false });

  // ============================
  // STATISTIQUES
  // ============================

  loadUsersStatistics$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.loadUsersStatistics),
    switchMap(() => {
      return this.utilisateurService.getUsersStatistics().pipe(
        map(data => UtilisateursActions.loadUsersStatisticsSuccess({ data })),
        catchError(error => {
          console.error('Erreur lors du chargement des statistiques:', error);
          return of(UtilisateursActions.loadUsersStatisticsFailure({ 
            error: error.customMessage || error.message || 'Erreur lors du chargement des statistiques'
          }));
        })
      );
    })
  ));

  // ============================
  // VALIDATION
  // ============================

  checkEmailAvailability$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.checkEmailAvailability),
    switchMap(({ email, excludeUserId }) => {
      return this.utilisateurService.checkEmailAvailability(email, excludeUserId).pipe(
        map(({ available }) => UtilisateursActions.checkEmailAvailabilitySuccess({ available })),
        catchError(error => {
          console.error('Erreur lors de la vérification de l\'email:', error);
          return of(UtilisateursActions.checkEmailAvailabilityFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la vérification de l\'email'
          }));
        })
      );
    })
  ));

  validateUserData$ = createEffect(() => this.actions$.pipe(
    ofType(UtilisateursActions.validateUserData),
    switchMap(({ userData, isUpdate }) => {
      return this.utilisateurService.validateUserData(userData, isUpdate).pipe(
        map(({ valid, errors }) => UtilisateursActions.validateUserDataSuccess({ valid, errors })),
        catchError(error => {
          console.error('Erreur lors de la validation:', error);
          return of(UtilisateursActions.validateUserDataFailure({ 
            error: error.customMessage || error.message || 'Erreur lors de la validation'
          }));
        })
      );
    })
  ));

  // ============================
  // GESTION DES ERREURS
  // ============================

  // Notification d'erreur générale
  handleErrors$ = createEffect(() => this.actions$.pipe(
    ofType(
      UtilisateursActions.loadUtilisateursFailure,
      UtilisateursActions.loadUtilisateurFailure,
      UtilisateursActions.searchUtilisateursFailure,
      UtilisateursActions.createUtilisateurFailure,
      UtilisateursActions.updateUtilisateurFailure,
      UtilisateursActions.deleteUtilisateurFailure,
      UtilisateursActions.filterByRoleFailure,
      UtilisateursActions.filterByStatusFailure,
      UtilisateursActions.filterByCentreFailure,
      UtilisateursActions.filterUtilisateursFailure,
      UtilisateursActions.toggleUserStatusFailure,
      UtilisateursActions.activateUserFailure,
      UtilisateursActions.suspendUserFailure,
      UtilisateursActions.deactivateUserFailure,
      UtilisateursActions.resetUserPasswordFailure,
      UtilisateursActions.changePasswordFailure,
      UtilisateursActions.loadCurrentUserProfileFailure,
      UtilisateursActions.updateCurrentUserProfileFailure,
      UtilisateursActions.updateUserProfileFailure,
      UtilisateursActions.loadUsersStatisticsFailure,
      UtilisateursActions.checkEmailAvailabilityFailure,
      UtilisateursActions.validateUserDataFailure
    ),
    tap(({ error }) => {
      this.notificationService.error(error, 'Erreur');
    })
  ), { dispatch: false });
} 