import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CentresActions } from './centres.actions';
import { CentreService } from '../../core/services/centre.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class CentresEffects {
  
  // Chargement de tous les centres
  loadCentres$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.loadCentres),
    switchMap(({ page, size, sort, direction }) => 
      this.centreService.getAllCentres(page, size, sort, direction).pipe(
        tap(data => {
          console.log('Données centres reçues de l\'API:', data);
        }),
        take(1),
        map(data => CentresActions.loadCentresSuccess({ data })),
        catchError(error => {
          console.error('Erreur API centres:', error);
          this.notificationService.error(`Erreur lors du chargement des centres: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.loadCentresFailure({ error: error.message || 'Erreur lors du chargement' }));
        })
      )
    )
  ));

  // Chargement d'un centre spécifique
  loadCentre$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.loadCentre),
    switchMap(({ id }) => 
      this.centreService.getCentreById(id).pipe(
        take(1),
        map(data => CentresActions.loadCentreSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement du centre: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.loadCentreFailure({ error: error.message || 'Erreur lors du chargement' }));
        })
      )
    )
  ));

  // Recherche de centres
  searchCentres$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.searchCentres),
    switchMap(({ searchTerm, page, size, typeCentre }) => 
      this.centreService.searchCentres(searchTerm, page, size, typeCentre).pipe(
        take(1),
        map(data => CentresActions.searchCentresSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.searchCentresFailure({ error: error.message || 'Erreur lors de la recherche' }));
        })
      )
    )
  ));

  // Création d'un centre
  createCentre$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.createCentre),
    switchMap(({ request }) => 
      this.centreService.createCentre(request).pipe(
        take(1),
        map(data => CentresActions.createCentreSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création du centre: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.createCentreFailure({ error: error.message || 'Erreur lors de la création' }));
        })
      )
    )
  ));

  // Notification et redirection après création réussie
  createCentreSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.createCentreSuccess),
    tap(({ data }) => {
      this.notificationService.success(`Le centre ${data.nom} a été créé avec succès`);
      // Redirection vers la page d'administration des centres
      this.router.navigate(['/administration/centres']);
    })
  ), { dispatch: false });

  // Mise à jour d'un centre
  updateCentre$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.updateCentre),
    switchMap(({ id, request }) => 
      this.centreService.updateCentre(id, request).pipe(
        take(1),
        map(data => CentresActions.updateCentreSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour du centre: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.updateCentreFailure({ error: error.message || 'Erreur lors de la mise à jour' }));
        })
      )
    )
  ));

  // Notification après mise à jour réussie
  updateCentreSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.updateCentreSuccess),
    tap(({ data }) => {
      this.notificationService.success(`Le centre ${data.nom} a été mis à jour avec succès`);
    })
  ), { dispatch: false });

  // Suppression d'un centre
  deleteCentre$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.deleteCentre),
    switchMap(({ id }) => 
      this.centreService.deleteCentre(id).pipe(
        take(1),
        map(() => CentresActions.deleteCentreSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression du centre: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.deleteCentreFailure({ error: error.message || 'Erreur lors de la suppression' }));
        })
      )
    )
  ));

  // Notification après suppression réussie
  deleteCentreSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.deleteCentreSuccess),
    tap(() => {
      this.notificationService.success('Le centre a été supprimé avec succès');
    })
  ), { dispatch: false });

  // Filtrage par type de centre
  filterByType$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.filterByType),
    switchMap(({ centreType, page, size }) => 
      this.centreService.getCentresByType(centreType, page, size).pipe(
        take(1),
        map(data => CentresActions.filterByTypeSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par type: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.filterByTypeFailure({ error: error.message || 'Erreur lors du filtrage' }));
        })
      )
    )
  ));

  // Chargement des centres de l'utilisateur
  loadMyCentres$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.loadMyCentres),
    switchMap(() => 
      this.centreService.getMyCentres().pipe(
        take(1),
        map(data => CentresActions.loadMyCentresSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de vos centres: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.loadMyCentresFailure({ error: error.message || 'Erreur lors du chargement' }));
        })
      )
    )
  ));

  // Chargement des statistiques
  loadStatistics$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.loadStatistics),
    switchMap(() => 
      this.centreService.getCentresStatistics().pipe(
        take(1),
        map(data => CentresActions.loadStatisticsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des statistiques: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.loadStatisticsFailure({ error: error.message || 'Erreur lors du chargement' }));
        })
      )
    )
  ));

  // Changement de statut d'un centre
  toggleCentreStatus$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.toggleCentreStatus),
    switchMap(({ id, actif }) => 
      this.centreService.toggleCentreStatus(id, actif).pipe(
        take(1),
        map(data => CentresActions.toggleCentreStatusSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du changement de statut: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.toggleCentreStatusFailure({ error: error.message || 'Erreur lors du changement de statut' }));
        })
      )
    )
  ));

  // Notification après changement de statut réussi
  toggleCentreStatusSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.toggleCentreStatusSuccess),
    tap(({ data }) => {
      const statusText = data.nom ? 'activé' : 'désactivé'; // Assumer qu'il y a un champ actif
      this.notificationService.success(`Le centre ${data.nom} a été ${statusText} avec succès`);
    })
  ), { dispatch: false });

  // Chargement des types de centres
  loadTypes$ = createEffect(() => this.actions$.pipe(
    ofType(CentresActions.loadTypes),
    switchMap(() => 
      this.centreService.getTypesDecentres().pipe(
        take(1),
        map(data => CentresActions.loadTypesSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des types: ${error.message || 'Erreur inconnue'}`);
          return of(CentresActions.loadTypesFailure({ error: error.message || 'Erreur lors du chargement' }));
        })
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private centreService: CentreService,
    private notificationService: NotificationService,
    private router: Router
  ) {}
} 