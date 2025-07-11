import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ComplicationsActions } from './complications.actions';
import { NotificationService } from '../../core/services/notification.service';
import { ComplicationService } from '../../core/services/complication.service';

@Injectable()
export class ComplicationsEffects {
  
  // Chargement d'une complication spécifique
  loadComplication$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.loadComplication),
    switchMap(({ id }) => {
      return this.complicationService.getComplicationById(id).pipe(
        map(data => ComplicationsActions.loadComplicationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de la complication: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.loadComplicationFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des complications par grossesse
  loadComplicationsByGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.loadComplicationsByGrossesse),
    switchMap(({ grossesseId }) => {
      return this.complicationService.getComplicationsByGrossesseId(grossesseId).pipe(
        map(data => ComplicationsActions.loadComplicationsByGrossesseSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des complications de la grossesse: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.loadComplicationsByGrossesseFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des complications par accouchement
  loadComplicationsByAccouchement$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.loadComplicationsByAccouchement),
    switchMap(({ accouchementId }) => {
      return this.complicationService.getComplicationsByAccouchementId(accouchementId).pipe(
        map(data => ComplicationsActions.loadComplicationsByAccouchementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des complications de l'accouchement: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.loadComplicationsByAccouchementFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des complications par naissance
  loadComplicationsByNaissance$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.loadComplicationsByNaissance),
    switchMap(({ naissanceId }) => {
      return this.complicationService.getComplicationsByNaissanceId(naissanceId).pipe(
        map(data => ComplicationsActions.loadComplicationsByNaissanceSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des complications de la naissance: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.loadComplicationsByNaissanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Création d'une complication
  createComplication$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.createComplication),
    switchMap(({ request }) => {
      return this.complicationService.createComplication(request).pipe(
        map(data => ComplicationsActions.createComplicationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création de la complication: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.createComplicationFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification et redirection après création réussie
  createComplicationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.createComplicationSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La complication a été créée avec succès`);
      //this.router.navigate(['/complications', data.id]);
    })
  ), { dispatch: false });

  // Mise à jour d'une complication
  updateComplication$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.updateComplication),
    switchMap(({ id, request }) => {
      return this.complicationService.updateComplication(id, request).pipe(
        map(data => ComplicationsActions.updateComplicationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de la complication: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.updateComplicationFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateComplicationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.updateComplicationSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La complication a été mise à jour avec succès`);
      //this.router.navigate(['/complications']);
    })
  ), { dispatch: false });

  // Suppression d'une complication
  deleteComplication$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.deleteComplication),
    switchMap(({ id }) => {
      return this.complicationService.deleteComplication(id).pipe(
        map(() => ComplicationsActions.deleteComplicationSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de la complication: ${error.customMessage || error.message}`);
          return of(ComplicationsActions.deleteComplicationFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteComplicationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ComplicationsActions.deleteComplicationSuccess),
    tap(() => {
      this.notificationService.success('La complication a été supprimée avec succès');
      //this.router.navigate(['/complications']);
    })
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private notificationService: NotificationService,
    private router: Router,
    private complicationService: ComplicationService
  ) {}
} 