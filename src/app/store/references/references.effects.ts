import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { ReferenceService } from '../../core/services/reference.service';
import { NotificationService } from '../../core/services/notification.service';
import * as ReferencesActions from './references.actions';

@Injectable()
export class ReferencesEffects {

  constructor(
    private actions$: Actions,
    private referenceService: ReferenceService,
    private notificationService: NotificationService
  ) {}

  // Effect pour charger les références
  loadReferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferences),
      mergeMap((action) =>
        this.referenceService.getAllReferences(
          action.page,
          action.size,
          action.sort,
          action.direction
        ).pipe(
          map((references) => ReferencesActions.loadReferencesSuccess({ references })),
          catchError((error) => of(ReferencesActions.loadReferencesFailure({ error })))
        )
      )
    )
  );

  // Effect pour rechercher les références
  searchReferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.searchReferences),
      mergeMap((action) =>
        this.referenceService.searchReferences(
          action.searchTerm,
          action.page,
          action.size,
          action.statut,
          action.centreOrigine,
          action.centreDestination
        ).pipe(
          map((references) => ReferencesActions.searchReferencesSuccess({ references })),
          catchError((error) => of(ReferencesActions.searchReferencesFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger une référence
  loadReference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReference),
      mergeMap((action) =>
        this.referenceService.getReferenceById(action.id).pipe(
          map((reference) => ReferencesActions.loadReferenceSuccess({ reference })),
          catchError((error) => of(ReferencesActions.loadReferenceFailure({ error })))
        )
      )
    )
  );

  // Effect pour créer une référence
  createReference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.createReference),
      mergeMap((action) =>
        this.referenceService.createReference(action.reference).pipe(
          map((reference) => ReferencesActions.createReferenceSuccess({ reference })),
          catchError((error) => of(ReferencesActions.createReferenceFailure({ error })))
        )
      )
    )
  );

  // Effect pour mettre à jour une référence
  updateReference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.updateReference),
      mergeMap((action) =>
        this.referenceService.updateReference(action.id, action.reference).pipe(
          map((reference) => ReferencesActions.updateReferenceSuccess({ reference })),
          catchError((error) => of(ReferencesActions.updateReferenceFailure({ error })))
        )
      )
    )
  );

  // Effect pour supprimer une référence
  deleteReference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.deleteReference),
      mergeMap((action) =>
        this.referenceService.deleteReference(action.id).pipe(
          map(() => ReferencesActions.deleteReferenceSuccess({ id: action.id })),
          catchError((error) => of(ReferencesActions.deleteReferenceFailure({ error })))
        )
      )
    )
  );

  // Effect pour changer le statut d'une référence
  changeStatutReference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.changeStatutReference),
      mergeMap((action) =>
        this.referenceService.changeStatutReference(action.id, action.statut).pipe(
          map((reference) => ReferencesActions.changeStatutReferenceSuccess({ reference })),
          catchError((error) => of(ReferencesActions.changeStatutReferenceFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les références par statut
  loadReferencesByStatut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferencesByStatut),
      mergeMap((action) =>
        this.referenceService.getReferencesByStatut(
          action.statut,
          action.page,
          action.size
        ).pipe(
          map((references) => ReferencesActions.loadReferencesByStatutSuccess({ references })),
          catchError((error) => of(ReferencesActions.loadReferencesByStatutFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les références par patiente
  loadReferencesByPatiente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferencesByPatiente),
      mergeMap((action) =>
        this.referenceService.getReferencesByPatiente(
          action.patienteId,
          action.page,
          action.size
        ).pipe(
          map((references) => ReferencesActions.loadReferencesByPatienteSuccess({ references })),
          catchError((error) => of(ReferencesActions.loadReferencesByPatienteFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les références par centre
  loadReferencesByCentre$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferencesByCentre),
      mergeMap((action) =>
        this.referenceService.getReferencesByCentre(
          action.centreId,
          action.centreType,
          action.page,
          action.size
        ).pipe(
          map((references) => ReferencesActions.loadReferencesByCentreSuccess({ references })),
          catchError((error) => of(ReferencesActions.loadReferencesByCentreFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les statistiques
  loadReferencesStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadReferencesStatistics),
      mergeMap(() =>
        this.referenceService.getReferencesStatistics().pipe(
          map((statistics) => ReferencesActions.loadReferencesStatisticsSuccess({ statistics })),
          catchError((error) => of(ReferencesActions.loadReferencesStatisticsFailure({ error })))
        )
      )
    )
  );

  // Effect pour charger les références récentes
  loadRecentReferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.loadRecentReferences),
      mergeMap((action) =>
        this.referenceService.getRecentReferences(action.limit).pipe(
          map((references) => ReferencesActions.loadRecentReferencesSuccess({ references })),
          catchError((error) => of(ReferencesActions.loadRecentReferencesFailure({ error })))
        )
      )
    )
  );

  // Effects pour les notifications de succès
  createReferenceSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.createReferenceSuccess),
      tap(() => {
        this.notificationService.success('Référence créée avec succès');
      })
    ),
    { dispatch: false }
  );

  updateReferenceSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.updateReferenceSuccess),
      tap(() => {
        this.notificationService.success('Référence mise à jour avec succès');
      })
    ),
    { dispatch: false }
  );

  deleteReferenceSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.deleteReferenceSuccess),
      tap(() => {
        this.notificationService.success('Référence supprimée avec succès');
      })
    ),
    { dispatch: false }
  );

  changeStatutReferenceSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.changeStatutReferenceSuccess),
      tap(() => {
        this.notificationService.success('Statut de la référence modifié avec succès');
      })
    ),
    { dispatch: false }
  );

  // Effects pour les notifications d'erreur
  createReferenceFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.createReferenceFailure),
      tap(({ error }) => {
        this.notificationService.error(
          error?.message || 'Erreur lors de la création de la référence'
        );
      })
    ),
    { dispatch: false }
  );

  updateReferenceFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.updateReferenceFailure),
      tap(({ error }) => {
        this.notificationService.error(
          error?.message || 'Erreur lors de la mise à jour de la référence'
        );
      })
    ),
    { dispatch: false }
  );

  deleteReferenceFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.deleteReferenceFailure),
      tap(({ error }) => {
        this.notificationService.error(
          error?.message || 'Erreur lors de la suppression de la référence'
        );
      })
    ),
    { dispatch: false }
  );

  changeStatutReferenceFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferencesActions.changeStatutReferenceFailure),
      tap(({ error }) => {
        this.notificationService.error(
          error?.message || 'Erreur lors du changement de statut de la référence'
        );
      })
    ),
    { dispatch: false }
  );

  loadReferencesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ReferencesActions.loadReferencesFailure,
        ReferencesActions.searchReferencesFailure,
        ReferencesActions.loadReferenceFailure,
        ReferencesActions.loadReferencesByStatutFailure,
        ReferencesActions.loadReferencesByPatienteFailure,
        ReferencesActions.loadReferencesByCentreFailure,
        ReferencesActions.loadReferencesStatisticsFailure,
        ReferencesActions.loadRecentReferencesFailure
      ),
      tap(({ error }) => {
        this.notificationService.error(
          error?.message || 'Erreur lors du chargement des données'
        );
      })
    ),
    { dispatch: false }
  );
} 