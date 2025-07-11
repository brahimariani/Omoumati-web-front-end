import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PatientsActions } from './patients.actions';
import { PatienteService } from '../../core/services/patiente.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class PatientsEffects {
  // Chargement de toutes les patientes
  loadPatients$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.loadPatients),
    switchMap(({ page, size, sort, direction }) => 
      this.patienteService.getAllPatientes(page, size, sort, direction).pipe(
        tap(data => {
          console.log('Données reçues de l\'API:', data);
        }),
        // Ne prendre que la première réponse pour éviter les boucles
        take(1),
        map(data => PatientsActions.loadPatientsSuccess({ data })),
        catchError(error => {
          console.error('Erreur API:', error);
          this.notificationService.error(`Erreur lors du chargement des patientes: ${error.customMessage || error.message}`);
          return of(PatientsActions.loadPatientsFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  // Chargement d'une patiente spécifique
  loadPatient$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.loadPatient),
    switchMap(({ id }) => 
      this.patienteService.getPatienteById(id).pipe(
        take(1),
        map(data => PatientsActions.loadPatientSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de la patiente: ${error.customMessage || error.message}`);
          return of(PatientsActions.loadPatientFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  // Recherche de patientes
  searchPatients$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.searchPatients),
    switchMap(({ searchTerm, page, size }) => 
      this.patienteService.searchPatientes(searchTerm, page, size).pipe(
        take(1),
        map(data => PatientsActions.searchPatientsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error.customMessage || error.message}`);
          return of(PatientsActions.searchPatientsFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  // Création d'une patiente
  createPatient$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.createPatient),
    switchMap(({ request }) => 
      this.patienteService.createPatiente(request).pipe(
        take(1),
        map(data => PatientsActions.createPatientSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création de la patiente: ${error.customMessage || error.message}`);
          return of(PatientsActions.createPatientFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  // Notification et redirection après création réussie
  createPatientSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.createPatientSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La patiente ${data.nom} ${data.prenom} a été créée avec succès`);
      this.router.navigate(['/patientes', data.id]);
    })
  ), { dispatch: false });

  // Mise à jour d'une patiente
  updatePatient$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.updatePatient),
    switchMap(({ id, request }) => 
      this.patienteService.updatePatiente(id, request).pipe(
        take(1),
        map(data => PatientsActions.updatePatientSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de la patiente: ${error.customMessage || error.message}`);
          return of(PatientsActions.updatePatientFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  // Notification après mise à jour réussie
  updatePatientSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.updatePatientSuccess),
    tap(({ data }) => {
      this.notificationService.success(`La patiente ${data.nom} ${data.prenom} a été mise à jour avec succès`);
      this.router.navigate(['/patientes']);
    })
  ), { dispatch: false });

  // Suppression d'une patiente
  deletePatient$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.deletePatient),
    switchMap(({ id }) => 
      this.patienteService.deletePatiente(id).pipe(
        take(1),
        map(() => PatientsActions.deletePatientSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de la patiente: ${error.customMessage || error.message}`);
          return of(PatientsActions.deletePatientFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  // Notification après suppression réussie
  deletePatientSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.deletePatientSuccess),
    tap(() => {
      this.notificationService.success('La patiente a été supprimée avec succès');
      this.router.navigate(['/patientes']);
    })
  ), { dispatch: false });

  // Filtrage par groupe sanguin
  filterByBloodType$ = createEffect(() => this.actions$.pipe(
    ofType(PatientsActions.filterByBloodType),
    switchMap(({ groupage }) => 
      this.patienteService.getPatientesByGroupeSanguin(groupage).pipe(
        take(1),
        map(data => PatientsActions.filterByBloodTypeSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par groupe sanguin: ${error.customMessage || error.message}`);
          return of(PatientsActions.filterByBloodTypeFailure({ error: error.customMessage || error.message }));
        })
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private patienteService: PatienteService,
    private notificationService: NotificationService,
    private router: Router
  ) {}
} 