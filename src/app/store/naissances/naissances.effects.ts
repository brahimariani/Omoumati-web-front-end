import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NaissancesActions } from './naissances.actions';
import { NotificationService } from '../../core/services/notification.service';
import { NaissanceService } from '../../core/services/naissance.service';

@Injectable()
export class NaissancesEffects {
  
  // Chargement de toutes les naissances
  loadNaissances$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.loadNaissances),
    switchMap(({ page, size, sort, direction }) => {
      return this.naissanceService.getAllNaissances(page, size, sort, direction).pipe(
        map(data => NaissancesActions.loadNaissancesSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des naissances: ${error.customMessage || error.message}`);
          return of(NaissancesActions.loadNaissancesFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement d'une naissance spécifique
  loadNaissance$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.loadNaissance),
    switchMap(({ id }) => {
      return this.naissanceService.getNaissanceById(id).pipe(
        map(data => NaissancesActions.loadNaissanceSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de la naissance: ${error.customMessage || error.message}`);
          return of(NaissancesActions.loadNaissanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des naissances par accouchement
  loadNaissancesByAccouchement$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.loadNaissancesByAccouchement),
    switchMap(({ accouchementId }) => {
      return this.naissanceService.getNaissancesByAccouchementId(accouchementId).pipe(
        map(data => NaissancesActions.loadNaissancesByAccouchementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des naissances de l'accouchement: ${error.customMessage || error.message}`);
          return of(NaissancesActions.loadNaissancesByAccouchementFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Recherche de naissances
  searchNaissances$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.searchNaissances),
    switchMap(({ searchTerm, page, size }) => {
      return this.naissanceService.searchNaissances(searchTerm, page, size).pipe(
        map(data => NaissancesActions.searchNaissancesSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error.customMessage || error.message}`);
          return of(NaissancesActions.searchNaissancesFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Création d'une naissance
  createNaissance$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.createNaissance),
    switchMap(({ request }) => {
      return this.naissanceService.createNaissance(request).pipe(
        map(data => NaissancesActions.createNaissanceSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création de la naissance: ${error.customMessage || error.message}`);
          return of(NaissancesActions.createNaissanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification et redirection après création réussie
  createNaissanceSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.createNaissanceSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La naissance a été créée avec succès`);
      this.router.navigate(['/naissances', data.id]);
    })
  ), { dispatch: false });

  // Mise à jour d'une naissance
  updateNaissance$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.updateNaissance),
    switchMap(({ id, request }) => {
      return this.naissanceService.updateNaissance(id, request).pipe(
        map(data => NaissancesActions.updateNaissanceSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de la naissance: ${error.customMessage || error.message}`);
          return of(NaissancesActions.updateNaissanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateNaissanceSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.updateNaissanceSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La naissance a été mise à jour avec succès`);
      this.router.navigate(['/naissances']);
    })
  ), { dispatch: false });

  // Suppression d'une naissance
  deleteNaissance$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.deleteNaissance),
    switchMap(({ id }) => {
      return this.naissanceService.deleteNaissance(id).pipe(
        map(() => NaissancesActions.deleteNaissanceSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de la naissance: ${error.customMessage || error.message}`);
          return of(NaissancesActions.deleteNaissanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteNaissanceSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.deleteNaissanceSuccess),
    tap(() => {
      this.notificationService.success('La naissance a été supprimée avec succès');
      this.router.navigate(['/naissances']);
    })
  ), { dispatch: false });

  // Filtrage par sexe
  filterBySexe$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.filterBySexe),
    switchMap(({ sexe }) => {
      return this.naissanceService.getNaissancesBySexe(sexe).pipe(
        map(data => NaissancesActions.filterBySexeSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par sexe: ${error.customMessage || error.message}`);
          return of(NaissancesActions.filterBySexeFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Filtrage par statut vivant
  filterByVivant$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.filterByVivant),
    switchMap(({ estVivant }) => {
      return this.naissanceService.getNaissancesByVivant(estVivant).pipe(
        map(data => NaissancesActions.filterByVivantSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par statut: ${error.customMessage || error.message}`);
          return of(NaissancesActions.filterByVivantFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Filtrage par poids
  filterByPoids$ = createEffect(() => this.actions$.pipe(
    ofType(NaissancesActions.filterByPoids),
    switchMap(({ poidsMin, poidsMax }) => {
      return this.naissanceService.getNaissancesByPoidsRange(poidsMin, poidsMax).pipe(
        map(data => NaissancesActions.filterByPoidsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par poids: ${error.customMessage || error.message}`);
          return of(NaissancesActions.filterByPoidsFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private notificationService: NotificationService,
    private router: Router,
    private naissanceService: NaissanceService
  ) {}
} 