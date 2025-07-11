import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GrossessesActions } from './grossesses.actions';
import { NotificationService } from '../../core/services/notification.service';
import { GrossesseService } from '../../core/services/grossesse.service';

@Injectable()
export class GrossessesEffects {
  
  // Chargement de toutes les grossesses
  loadGrossesses$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.loadGrossesses),
    switchMap(({ page, size }) => {
      // Debug: Afficher les paramètres reçus dans l'effect
      console.log('Effect loadGrossesses - Paramètres reçus:', {
        page,
        size
      });

      return this.grossesseService.getAllGrossesses(page, size).pipe(
        map(data => {
          console.log('Effect loadGrossesses - Données reçues:', data);
          return GrossessesActions.loadGrossessesSuccess({ data });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des grossesses: ${error.customMessage || error.message}`);
          return of(GrossessesActions.loadGrossessesFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement d'une grossesse spécifique
  loadGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.loadGrossesse),
    switchMap(({ id }) => {
      return this.grossesseService.getGrossesseById(id).pipe(
        map(data => GrossessesActions.loadGrossesseSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de la grossesse: ${error.customMessage || error.message}`);
          return of(GrossessesActions.loadGrossesseFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des grossesses par patiente
  loadGrossessesByPatient$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.loadGrossessesByPatient),
    switchMap(({ patientId }) => {
      return this.grossesseService.getGrossessesByPatientId(patientId).pipe(
        map(data => GrossessesActions.loadGrossessesByPatientSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des grossesses de la patiente: ${error.customMessage || error.message}`);
          return of(GrossessesActions.loadGrossessesByPatientFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Recherche de grossesses
  searchGrossesses$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.searchGrossesses),
    switchMap(({ searchTerm, page, size }) => {
      return this.grossesseService.searchGrossesses(searchTerm, page, size).pipe(
        map(data => GrossessesActions.searchGrossessesSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error.customMessage || error.message}`);
          return of(GrossessesActions.searchGrossessesFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Création d'une grossesse
  createGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.createGrossesse),
    switchMap(({ request }) => {
      return this.grossesseService.createGrossesse(request).pipe(
        map(data => GrossessesActions.createGrossesseSuccess({ data })),
        catchError(error => {
          let errorMessage = error.customMessage || error.message;
          
          // Gestion spécifique de l'erreur de conflit (grossesse active existante)
          if (error.status === 409 || error.code === 'CONFLICT' || error.code === 'ACTIVE_PREGNANCY_EXISTS') {
            errorMessage = 'Cette patiente a déjà une grossesse active en cours. Veuillez d\'abord terminer la grossesse actuelle avant d\'en créer une nouvelle.';
            this.notificationService.warning(errorMessage);
          } else {
            this.notificationService.error(`Erreur lors de la création de la grossesse: ${errorMessage}`);
          }
          
          return of(GrossessesActions.createGrossesseFailure({ error: errorMessage }));
        })
      );
    })
  ));

  // Notification et redirection après création réussie
  createGrossesseSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.createGrossesseSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La grossesse a été créée avec succès`);
      this.router.navigate(['/grossesses', data.id]);
    })
  ), { dispatch: false });

  // Mise à jour d'une grossesse
  updateGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.updateGrossesse),
    switchMap(({ id, request }) => {
      return this.grossesseService.updateGrossesse(id, request).pipe(
        map(data => GrossessesActions.updateGrossesseSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de la grossesse: ${error.customMessage || error.message}`);
          return of(GrossessesActions.updateGrossesseFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateGrossesseSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.updateGrossesseSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La grossesse a été mise à jour avec succès`);
      this.router.navigate(['/grossesses']);
    })
  ), { dispatch: false });

  // Suppression d'une grossesse
  deleteGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.deleteGrossesse),
    switchMap(({ id }) => {
      return this.grossesseService.deleteGrossesse(id).pipe(
        map(() => GrossessesActions.deleteGrossesseSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de la grossesse: ${error.customMessage || error.message}`);
          return of(GrossessesActions.deleteGrossesseFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteGrossesseSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.deleteGrossesseSuccess),
    tap(() => {
      this.notificationService.success('La grossesse a été supprimée avec succès');
      this.router.navigate(['/grossesses']);
    })
  ), { dispatch: false });

  // Filtrage par statut
  filterByStatus$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.filterByStatus),
    switchMap(({ estDesiree }) => {
      return this.grossesseService.getGrossessesByStatus(estDesiree).pipe(
        map(data => GrossessesActions.filterByStatusSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par statut: ${error.customMessage || error.message}`);
          return of(GrossessesActions.filterByStatusFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Filtrage par date d'accouchement prévue
  filterByDueDate$ = createEffect(() => this.actions$.pipe(
    ofType(GrossessesActions.filterByDueDate),
    switchMap(({ startDate, endDate }) => {
      return this.grossesseService.getGrossessesByDueDateRange(startDate, endDate).pipe(
        map(data => GrossessesActions.filterByDueDateSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par date: ${error.customMessage || error.message}`);
          return of(GrossessesActions.filterByDueDateFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private notificationService: NotificationService,
    private router: Router,
    private grossesseService: GrossesseService
  ) {}
} 