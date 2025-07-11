import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { RendezVousService } from '../../core/services/rendez-vous.service';
import { NotificationService } from '../../core/services/notification.service';
import * as RendezVousActions from './rendez-vous.actions';

@Injectable()
export class RendezVousEffects {

  constructor(
    private actions$: Actions,
    private rendezVousService: RendezVousService,
    private notificationService: NotificationService
  ) {}

  // Effect pour charger les rendez-vous
  loadRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVous),
      mergeMap((action) =>
        this.rendezVousService.getAllRendezVous(
          action.page,
          action.size,
          action.sort,
          action.direction
        ).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour rechercher les rendez-vous
  searchRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.searchRendezVous),
      mergeMap((action) =>
        this.rendezVousService.searchRendezVous(
          action.searchTerm,
          action.page,
          action.size,
          action.statut,
          action.patienteId,
          action.dateDebut,
          action.dateFin
        ).pipe(
          map((rendezVous) => RendezVousActions.searchRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.searchRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger un rendez-vous
  loadRendezVousById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousById),
      mergeMap((action) =>
        this.rendezVousService.getRendezVousById(action.id).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousByIdSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousByIdFailure({ error })))
        )
      )
    )
  );

  // Effect pour créer un rendez-vous
  createRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.createRendezVous),
      mergeMap((action) =>
        this.rendezVousService.createRendezVous(action.rendezVous).pipe(
          map((rendezVous) => RendezVousActions.createRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.createRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour mettre à jour un rendez-vous
  updateRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.updateRendezVous),
      mergeMap((action) =>
        this.rendezVousService.updateRendezVous(action.id, action.rendezVous).pipe(
          map((rendezVous) => RendezVousActions.updateRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.updateRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour supprimer un rendez-vous
  deleteRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.deleteRendezVous),
      mergeMap((action) =>
        this.rendezVousService.deleteRendezVous(action.id).pipe(
          map(() => RendezVousActions.deleteRendezVousSuccess({ id: action.id })),
          catchError((error) => of(RendezVousActions.deleteRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour changer le statut d'un rendez-vous
  changeStatutRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.changeStatutRendezVous),
      mergeMap((action) =>
        this.rendezVousService.changeStatutRendezVous(action.id, action.statut).pipe(
          map((rendezVous) => RendezVousActions.changeStatutRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.changeStatutRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour confirmer un rendez-vous
  confirmerRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.confirmerRendezVous),
      mergeMap((action) =>
        this.rendezVousService.confirmerRendezVous(action.id).pipe(
          map((rendezVous) => RendezVousActions.changeStatutRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.changeStatutRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour annuler un rendez-vous
  annulerRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.annulerRendezVous),
      mergeMap((action) =>
        this.rendezVousService.annulerRendezVous(action.id).pipe(
          map((rendezVous) => RendezVousActions.changeStatutRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.changeStatutRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour reporter un rendez-vous
  reporterRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.reporterRendezVous),
      mergeMap((action) =>
        this.rendezVousService.reporterRendezVous(action.id).pipe(
          map((rendezVous) => RendezVousActions.changeStatutRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.changeStatutRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous par statut
  loadRendezVousByStatut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousByStatut),
      mergeMap((action) =>
        this.rendezVousService.getRendezVousByStatut(
          action.statut,
          action.page,
          action.size
        ).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousByStatutSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousByStatutFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous par patiente
  loadRendezVousByPatiente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousByPatiente),
      mergeMap((action) =>
        this.rendezVousService.getRendezVousByPatiente(
          action.patienteId,
          action.page,
          action.size
        ).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousByPatienteSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousByPatienteFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous par centre
  loadRendezVousByCentre$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousByCentre),
      mergeMap((action) =>
        this.rendezVousService.getRendezVousByCentre(
          action.centreId,
          action.page,
          action.size
        ).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousByCentreSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousByCentreFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous par date
  loadRendezVousByDate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousByDate),
      mergeMap((action) =>
        this.rendezVousService.getRendezVousByDate(
          action.date,
          action.page,
          action.size
        ).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousByDateSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousByDateFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous par plage de dates
  loadRendezVousByDateRange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousByDateRange),
      mergeMap((action) =>
        this.rendezVousService.getRendezVousByDateRange(
          action.dateDebut,
          action.dateFin,
          action.page,
          action.size
        ).pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousByDateRangeSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousByDateRangeFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les statistiques
  loadRendezVousStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousStatistics),
      mergeMap(() =>
        this.rendezVousService.getRendezVousStatistics().pipe(
          map((statistics) => RendezVousActions.loadRendezVousStatisticsSuccess({ statistics })),
          catchError((error) => of(RendezVousActions.loadRendezVousStatisticsFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous récents
  loadRecentRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRecentRendezVous),
      mergeMap((action) =>
        this.rendezVousService.getRecentRendezVous(action.limit).pipe(
          map((rendezVous) => RendezVousActions.loadRecentRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRecentRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les prochains rendez-vous
  loadProchainRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadProchainRendezVous),
      mergeMap((action) =>
        this.rendezVousService.getProchainRendezVous(action.limit).pipe(
          map((rendezVous) => RendezVousActions.loadProchainRendezVousSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadProchainRendezVousFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les rendez-vous du jour
  loadRendezVousDuJour$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousDuJour),
      mergeMap(() =>
        this.rendezVousService.getRendezVousDuJour().pipe(
          map((rendezVous) => RendezVousActions.loadRendezVousDuJourSuccess({ rendezVous })),
          catchError((error) => of(RendezVousActions.loadRendezVousDuJourFailure({ error })))
        )
      )
    )
  );

  // Effect pour vérifier les conflits d'horaires
  checkConflitsHoraires$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.checkConflitsHoraires),
      mergeMap((action) =>
        this.rendezVousService.checkConflitsHoraires(
          action.date,
          action.patienteId,
          action.rendezVousId
        ).pipe(
          map((conflits) => RendezVousActions.checkConflitsHorairesSuccess({ conflits })),
          catchError((error) => of(RendezVousActions.checkConflitsHorairesFailure({ error })))
        )
      )
    )
  );

  // Effect pour rafraîchir les rendez-vous
  refreshRendezVous$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.refreshRendezVous),
      map(() => RendezVousActions.loadRendezVous({}))
    )
  );

  // Effects pour les notifications de succès
  createRendezVousSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.createRendezVousSuccess),
      tap(() => {
        this.notificationService.success('Rendez-vous créé avec succès');
      })
    ),
    { dispatch: false }
  );

  updateRendezVousSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.updateRendezVousSuccess),
      tap(() => {
        this.notificationService.success('Rendez-vous mis à jour avec succès');
      })
    ),
    { dispatch: false }
  );

  deleteRendezVousSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.deleteRendezVousSuccess),
      tap(() => {
        this.notificationService.success('Rendez-vous supprimé avec succès');
      })
    ),
    { dispatch: false }
  );

  changeStatutRendezVousSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.changeStatutRendezVousSuccess),
      tap(() => {
        this.notificationService.success('Statut du rendez-vous modifié avec succès');
      })
    ),
    { dispatch: false }
  );

  // Effects pour les notifications d'erreur
  createRendezVousFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.createRendezVousFailure),
      tap(({ error }) => {
        this.notificationService.error('Erreur lors de la création du rendez-vous: ' + (error?.message || 'Erreur inconnue'));
      })
    ),
    { dispatch: false }
  );

  updateRendezVousFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.updateRendezVousFailure),
      tap(({ error }) => {
        this.notificationService.error('Erreur lors de la mise à jour du rendez-vous: ' + (error?.message || 'Erreur inconnue'));
      })
    ),
    { dispatch: false }
  );

  deleteRendezVousFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.deleteRendezVousFailure),
      tap(({ error }) => {
        this.notificationService.error('Erreur lors de la suppression du rendez-vous: ' + (error?.message || 'Erreur inconnue'));
      })
    ),
    { dispatch: false }
  );

  changeStatutRendezVousFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.changeStatutRendezVousFailure),
      tap(({ error }) => {
        this.notificationService.error('Erreur lors du changement de statut: ' + (error?.message || 'Erreur inconnue'));
      })
    ),
    { dispatch: false }
  );

  loadRendezVousFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.loadRendezVousFailure),
      tap(({ error }) => {
        this.notificationService.error('Erreur lors du chargement des rendez-vous: ' + (error?.message || 'Erreur inconnue'));
      })
    ),
    { dispatch: false }
  );

  // Effect pour vérifier les conflits lors de la création/modification
  checkConflitsOnCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.createRendezVousSuccess),
      tap(({ rendezVous }) => {
        // Vérifier s'il y a des conflits potentiels et notifier
        if (rendezVous.date) {
          this.notificationService.info('Vérifiez qu\'il n\'y a pas de conflits d\'horaires pour cette date');
        }
      })
    ),
    { dispatch: false }
  );

  conflitsDetectes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RendezVousActions.checkConflitsHorairesSuccess),
      tap(({ conflits }) => {
        if (conflits.length > 0) {
          this.notificationService.warning(`${conflits.length} conflit(s) d'horaires détecté(s)`);
        }
      })
    ),
    { dispatch: false }
  );
}