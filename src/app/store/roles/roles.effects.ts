import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RolesActions } from './roles.actions';
import { RoleService } from '../../core/services/role.service';

/**
 * Effects pour le module de gestion des rôles
 */
@Injectable()
export class RolesEffects {

  constructor(
    private actions$: Actions,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {}

  // ============================
  // CHARGEMENT DES RÔLES
  // ============================

  /**
   * Effect pour charger tous les rôles avec pagination
   */
  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRoles),
      switchMap(({ page, size, sort, direction }) =>
        this.roleService.getAllRoles(page, size, sort, direction).pipe(
          map(data => RolesActions.loadRolesSuccess({ data })),
          catchError(error => {
            console.error('Erreur lors du chargement des rôles:', error);
            return of(RolesActions.loadRolesFailure({ 
              error: error.message || 'Erreur lors du chargement des rôles' 
            }));
          })
        )
      )
    )
  );

  /**
   * Effect pour charger tous les rôles (simple)
   */
  loadAllRolesSimple$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadAllRolesSimple),
      switchMap(() =>
        this.roleService.getAllRolesSimple().pipe(
          map(data => RolesActions.loadAllRolesSimpleSuccess({ data })),
          catchError(error => {
            console.error('Erreur lors du chargement des rôles (simple):', error);
            return of(RolesActions.loadAllRolesSimpleFailure({ 
              error: error.message || 'Erreur lors du chargement des rôles' 
            }));
          })
        )
      )
    )
  );

  /**
   * Effect pour charger un rôle spécifique
   */
  loadRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRole),
      switchMap(({ id }) =>
        this.roleService.getRoleById(id).pipe(
          map(data => RolesActions.loadRoleSuccess({ data })),
          catchError(error => {
            console.error(`Erreur lors du chargement du rôle ${id}:`, error);
            return of(RolesActions.loadRoleFailure({ 
              error: error.message || 'Erreur lors du chargement du rôle' 
            }));
          })
        )
      )
    )
  );

  // ============================
  // RECHERCHE DE RÔLES
  // ============================

  /**
   * Effect pour rechercher des rôles
   */
  searchRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.searchRoles),
      switchMap(({ searchTerm, page, size }) =>
        this.roleService.searchRoles(searchTerm, page, size).pipe(
          map(data => RolesActions.searchRolesSuccess({ data })),
          catchError(error => {
            console.error('Erreur lors de la recherche de rôles:', error);
            return of(RolesActions.searchRolesFailure({ 
              error: error.message || 'Erreur lors de la recherche de rôles' 
            }));
          })
        )
      )
    )
  );

  // ============================
  // CRÉATION DE RÔLE
  // ============================

  /**
   * Effect pour créer un rôle
   */
  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.createRole),
      switchMap(({ request }) =>
        this.roleService.createRole(request).pipe(
          map(data => RolesActions.createRoleSuccess({ data })),
          catchError(error => {
            console.error('Erreur lors de la création du rôle:', error);
            return of(RolesActions.createRoleFailure({ 
              error: error.message || 'Erreur lors de la création du rôle' 
            }));
          })
        )
      )
    )
  );

  /**
   * Effect pour afficher une notification de succès après création
   */
  createRoleSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.createRoleSuccess),
      tap(({ data }) => {
        this.snackBar.open(
          `Rôle "${data.nom}" créé avec succès`,
          'Fermer',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      })
    ),
    { dispatch: false }
  );

  // ============================
  // MISE À JOUR DE RÔLE
  // ============================

  /**
   * Effect pour mettre à jour un rôle
   */
  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.updateRole),
      switchMap(({ id, request }) =>
        this.roleService.updateRole(id, request).pipe(
          map(data => RolesActions.updateRoleSuccess({ data })),
          catchError(error => {
            console.error(`Erreur lors de la mise à jour du rôle ${id}:`, error);
            return of(RolesActions.updateRoleFailure({ 
              error: error.message || 'Erreur lors de la mise à jour du rôle' 
            }));
          })
        )
      )
    )
  );

  /**
   * Effect pour afficher une notification de succès après mise à jour
   */
  updateRoleSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.updateRoleSuccess),
      tap(({ data }) => {
        this.snackBar.open(
          `Rôle "${data.nom}" mis à jour avec succès`,
          'Fermer',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      })
    ),
    { dispatch: false }
  );

  // ============================
  // SUPPRESSION DE RÔLE
  // ============================

  /**
   * Effect pour supprimer un rôle
   */
  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.deleteRole),
      switchMap(({ id }) =>
        this.roleService.deleteRole(id).pipe(
          map(() => RolesActions.deleteRoleSuccess({ id })),
          catchError(error => {
            console.error(`Erreur lors de la suppression du rôle ${id}:`, error);
            return of(RolesActions.deleteRoleFailure({ 
              error: error.message || 'Erreur lors de la suppression du rôle' 
            }));
          })
        )
      )
    )
  );

  /**
   * Effect pour afficher une notification de succès après suppression
   */
  deleteRoleSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.deleteRoleSuccess),
      tap(() => {
        this.snackBar.open(
          'Rôle supprimé avec succès',
          'Fermer',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      })
    ),
    { dispatch: false }
  );

  // ============================
  // VÉRIFICATIONS
  // ============================

  /**
   * Effect pour vérifier la disponibilité du nom de rôle
   */
  checkRoleNameAvailability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.checkRoleNameAvailability),
      switchMap(({ nom, excludeRoleId }) =>
        this.roleService.checkRoleNameAvailability(nom, excludeRoleId).pipe(
          map(({ available }) => RolesActions.checkRoleNameAvailabilitySuccess({ available })),
          catchError(error => {
            console.error('Erreur lors de la vérification du nom de rôle:', error);
            return of(RolesActions.checkRoleNameAvailabilityFailure({ 
              error: error.message || 'Erreur lors de la vérification du nom' 
            }));
          })
        )
      )
    )
  );

  /**
   * Effect pour vérifier si un rôle peut être supprimé
   */
  checkRoleCanDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.checkRoleCanDelete),
      switchMap(({ id }) =>
        this.roleService.canDeleteRole(id).pipe(
          map(({ canDelete, reason }) => RolesActions.checkRoleCanDeleteSuccess({ canDelete, reason })),
          catchError(error => {
            console.error(`Erreur lors de la vérification de suppression du rôle ${id}:`, error);
            return of(RolesActions.checkRoleCanDeleteFailure({ 
              error: error.message || 'Erreur lors de la vérification de suppression' 
            }));
          })
        )
      )
    )
  );

  // ============================
  // STATISTIQUES
  // ============================

  /**
   * Effect pour charger les statistiques des rôles
   */
  loadRolesStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRolesStatistics),
      switchMap(() =>
        this.roleService.getRolesStatistics().pipe(
          map(data => RolesActions.loadRolesStatisticsSuccess({ data })),
          catchError(error => {
            console.error('Erreur lors du chargement des statistiques des rôles:', error);
            return of(RolesActions.loadRolesStatisticsFailure({ 
              error: error.message || 'Erreur lors du chargement des statistiques' 
            }));
          })
        )
      )
    )
  );

  // ============================
  // UTILISATEURS PAR RÔLE
  // ============================

  /**
   * Effect pour charger les utilisateurs d'un rôle
   */
  loadUsersByRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadUsersByRole),
      switchMap(({ roleId, page, size }) =>
        this.roleService.getUsersByRole(roleId, page, size).pipe(
          map(data => RolesActions.loadUsersByRoleSuccess({ roleId, data })),
          catchError(error => {
            console.error(`Erreur lors du chargement des utilisateurs du rôle ${roleId}:`, error);
            return of(RolesActions.loadUsersByRoleFailure({ 
              error: error.message || 'Erreur lors du chargement des utilisateurs' 
            }));
          })
        )
      )
    )
  );

  // ============================
  // GESTION DES ERREURS
  // ============================

  /**
   * Effect pour afficher les erreurs de chargement
   */
  showLoadError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        RolesActions.loadRolesFailure,
        RolesActions.loadAllRolesSimpleFailure,
        RolesActions.loadRoleFailure,
        RolesActions.searchRolesFailure
      ),
      tap(({ error }) => {
        this.snackBar.open(
          error,
          'Fermer',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      })
    ),
    { dispatch: false }
  );

  /**
   * Effect pour afficher les erreurs de modification
   */
  showModificationError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        RolesActions.createRoleFailure,
        RolesActions.updateRoleFailure,
        RolesActions.deleteRoleFailure
      ),
      tap(({ error }) => {
        this.snackBar.open(
          error,
          'Fermer',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      })
    ),
    { dispatch: false }
  );
} 