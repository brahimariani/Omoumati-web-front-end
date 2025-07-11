import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AccouchementsActions } from './accouchements.actions';
import { NotificationService } from '../../core/services/notification.service';
import { AccouchementService } from '../../core/services/accouchement.service';

@Injectable()
export class AccouchementsEffects {
  
  // Chargement de tous les accouchements
  loadAccouchements$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.loadAccouchements),
    switchMap(({ page, size, sort, direction }) => {
      return this.accouchementService.getAllAccouchements(page, size, sort, direction).pipe(
        map(data => AccouchementsActions.loadAccouchementsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des accouchements: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.loadAccouchementsFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement d'un accouchement spécifique
  loadAccouchement$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.loadAccouchement),
    switchMap(({ id }) => {
      return this.accouchementService.getAccouchementById(id).pipe(
        map(data => AccouchementsActions.loadAccouchementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de l'accouchement: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.loadAccouchementFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des accouchements par patiente
  loadAccouchementsByPatient$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.loadAccouchementsByPatient),
    switchMap(({ patientId }) => {
      return this.accouchementService.getAccouchementsByPatientId(patientId).pipe(
        map(data => AccouchementsActions.loadAccouchementsByPatientSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des accouchements de la patiente: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.loadAccouchementsByPatientFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des accouchements par grossesse
  loadAccouchementsByGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.loadAccouchementsByGrossesse),
    switchMap(({ grossesseId }) => {
      return this.accouchementService.getAccouchementsByGrossesseId(grossesseId).pipe(
        map(data => AccouchementsActions.loadAccouchementsByGrossesseSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des accouchements de la grossesse: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.loadAccouchementsByGrossesseFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Recherche d'accouchements
  searchAccouchements$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.searchAccouchements),
    switchMap(({ searchTerm, page, size }) => {
      return this.accouchementService.searchAccouchements(searchTerm, page, size).pipe(
        map(data => AccouchementsActions.searchAccouchementsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.searchAccouchementsFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Création d'un accouchement
  createAccouchement$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.createAccouchement),
    switchMap(({ request }) => {
      return this.accouchementService.createAccouchement(request).pipe(
        map(data => AccouchementsActions.createAccouchementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création de l'accouchement: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.createAccouchementFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification et redirection après création réussie
  createAccouchementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.createAccouchementSuccess),
    tap(({ data }) => {
      this.notificationService.success(`L'accouchement a été créé avec succès`);
      this.router.navigate(['/accouchements', data.id]);
    })
  ), { dispatch: false });

  // Mise à jour d'un accouchement
  updateAccouchement$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.updateAccouchement),
    switchMap(({ id, request }) => {
      return this.accouchementService.updateAccouchement(id, request).pipe(
        map(data => AccouchementsActions.updateAccouchementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de l'accouchement: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.updateAccouchementFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateAccouchementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.updateAccouchementSuccess),
    tap(({ data }) => {
      this.notificationService.success(`L'accouchement a été mis à jour avec succès`);
      this.router.navigate(['/accouchements']);
    })
  ), { dispatch: false });

  // Suppression d'un accouchement
  deleteAccouchement$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.deleteAccouchement),
    switchMap(({ id }) => {
      return this.accouchementService.deleteAccouchement(id).pipe(
        map(() => AccouchementsActions.deleteAccouchementSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de l'accouchement: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.deleteAccouchementFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteAccouchementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.deleteAccouchementSuccess),
    tap(() => {
      this.notificationService.success('L\'accouchement a été supprimé avec succès');
      // Ne pas rediriger automatiquement - laisser le composant gérer la navigation
    })
  ), { dispatch: false });

  // Filtrage par modalité d'extraction
  filterByModalite$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.filterByModalite),
    switchMap(({ modaliteExtraction }) => {
      return this.accouchementService.getAccouchementsByModalite(modaliteExtraction).pipe(
        map(data => AccouchementsActions.filterByModaliteSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par modalité: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.filterByModaliteFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Filtrage par assistance qualifiée
  filterByAssistance$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.filterByAssistance),
    switchMap(({ assisstanceQualifiee }) => {
      return this.accouchementService.getAccouchementsByAssistance(assisstanceQualifiee).pipe(
        map(data => AccouchementsActions.filterByAssistanceSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par assistance: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.filterByAssistanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Filtrage par date d'accouchement
  filterByDate$ = createEffect(() => this.actions$.pipe(
    ofType(AccouchementsActions.filterByDate),
    switchMap(({ startDate, endDate }) => {
      return this.accouchementService.getAccouchementsByDateRange(startDate, endDate).pipe(
        map(data => AccouchementsActions.filterByDateSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par date: ${error.customMessage || error.message}`);
          return of(AccouchementsActions.filterByDateFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private notificationService: NotificationService,
    private router: Router,
    private accouchementService: AccouchementService
  ) {}
} 