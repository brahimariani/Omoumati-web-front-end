import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { VaccinsActions } from './vaccins.actions';
import { NotificationService } from '../../core/services/notification.service';
import { VaccinService } from '../../core/services/vaccin.service';

@Injectable()
export class VaccinsEffects {
  
  // Chargement de tous les vaccins
  loadVaccins$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.loadVaccins),
    switchMap(({ page, size, sort, direction }) => {
      return this.vaccinService.getAllVaccins().pipe(
        map(data => VaccinsActions.loadVaccinsSuccess({ data: { content: data } as any })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des vaccins: ${error.customMessage || error.message}`);
          return of(VaccinsActions.loadVaccinsFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement d'un vaccin spécifique
  loadVaccin$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.loadVaccin),
    switchMap(({ id }) => {
      return this.vaccinService.getVaccinById(id).pipe(
        map(data => VaccinsActions.loadVaccinSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement du vaccin: ${error.customMessage || error.message}`);
          return of(VaccinsActions.loadVaccinFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des vaccins par patiente
  loadVaccinsByPatient$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.loadVaccinsByPatient),
    switchMap(({ patientId }) => {
      return this.vaccinService.getVaccinsByPatiente(patientId).pipe(
        map(data => VaccinsActions.loadVaccinsByPatientSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des vaccins de la patiente: ${error.customMessage || error.message}`);
          return of(VaccinsActions.loadVaccinsByPatientFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des vaccins par naissance
  loadVaccinsByNaissance$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.loadVaccinsByNaissance),
    switchMap(({ naissanceId }) => {
      return this.vaccinService.getVaccinsByNaissance(naissanceId).pipe(
        map(data => VaccinsActions.loadVaccinsByNaissanceSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des vaccins de la naissance: ${error.customMessage || error.message}`);
          return of(VaccinsActions.loadVaccinsByNaissanceFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Recherche de vaccins
  searchVaccins$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.searchVaccins),
    switchMap(({ searchTerm, page, size }) => {
      return this.vaccinService.getAllVaccins().pipe(
        map(data => {
          // Filtrage côté client pour la recherche
          const filteredData = data.filter(vaccin => 
            vaccin.nom.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return VaccinsActions.searchVaccinsSuccess({ 
            data: { content: filteredData, totalElements: filteredData.length } as any 
          });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error.customMessage || error.message}`);
          return of(VaccinsActions.searchVaccinsFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Création d'un vaccin
  createVaccin$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.createVaccin),
    switchMap(({ request }) => {
      return this.vaccinService.createVaccin(request).pipe(
        map(data => VaccinsActions.createVaccinSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création du vaccin: ${error.customMessage || error.message}`);
          return of(VaccinsActions.createVaccinFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification et redirection après création réussie
  createVaccinSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.createVaccinSuccess),
    tap(({ data }) => {
      this.notificationService.success(`Le vaccin a été créé avec succès`);
      // Ne pas rediriger automatiquement - laisser le composant gérer la navigation
    })
  ), { dispatch: false });

  // Mise à jour d'un vaccin
  updateVaccin$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.updateVaccin),
    switchMap(({ id, request }) => {
      return this.vaccinService.updateVaccin(id, request).pipe(
        map(data => VaccinsActions.updateVaccinSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour du vaccin: ${error.customMessage || error.message}`);
          return of(VaccinsActions.updateVaccinFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateVaccinSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.updateVaccinSuccess),
    tap(({ data }) => {
      this.notificationService.success(`Le vaccin a été mis à jour avec succès`);
    })
  ), { dispatch: false });

  // Suppression d'un vaccin
  deleteVaccin$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.deleteVaccin),
    switchMap(({ id }) => {
      return this.vaccinService.deleteVaccin(id).pipe(
        map(() => VaccinsActions.deleteVaccinSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression du vaccin: ${error.customMessage || error.message}`);
          return of(VaccinsActions.deleteVaccinFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteVaccinSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.deleteVaccinSuccess),
    tap(() => {
      this.notificationService.success('Le vaccin a été supprimé avec succès');
    })
  ), { dispatch: false });

  // Filtrage par nom de vaccin
  filterByNom$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.filterByNom),
    switchMap(({ nom }) => {
      return this.vaccinService.getAllVaccins().pipe(
        map(data => {
          const filteredData = data.filter(vaccin => 
            vaccin.nom.toLowerCase().includes(nom.toLowerCase())
          );
          return VaccinsActions.filterByNomSuccess({ data: filteredData });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par nom: ${error.customMessage || error.message}`);
          return of(VaccinsActions.filterByNomFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Filtrage par date de vaccination
  filterByDate$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.filterByDate),
    switchMap(({ startDate, endDate }) => {
      return this.vaccinService.getAllVaccins().pipe(
        map(data => {
          const filteredData = data.filter(vaccin => {
            const vaccinDate = new Date(vaccin.date);
            return vaccinDate >= startDate && vaccinDate <= endDate;
          });
          return VaccinsActions.filterByDateSuccess({ data: filteredData });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par date: ${error.customMessage || error.message}`);
          return of(VaccinsActions.filterByDateFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Chargement des vaccins manquants
  loadVaccinsManquants$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.loadVaccinsManquants),
    switchMap(({ naissanceId }) => {
      return this.vaccinService.getVaccinsManquants(naissanceId).pipe(
        map(data => VaccinsActions.loadVaccinsManquantsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des vaccins manquants: ${error.customMessage || error.message}`);
          return of(VaccinsActions.loadVaccinsManquantsFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Marquer comme administré
  marquerCommeAdministre$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.marquerCommeAdministre),
    switchMap(({ id }) => {
      return this.vaccinService.marquerCommeAdministre(id).pipe(
        map(data => VaccinsActions.marquerCommeAdministreSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du marquage du vaccin: ${error.customMessage || error.message}`);
          return of(VaccinsActions.marquerCommeAdministreFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après marquage réussi
  marquerCommeAdministreSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.marquerCommeAdministreSuccess),
    tap(({ data }) => {
      this.notificationService.success('Le vaccin a été marqué comme administré');
    })
  ), { dispatch: false });

  // Générer calendrier vaccinal
  genererCalendrier$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.genererCalendrier),
    switchMap(({ naissanceId }) => {
      return this.vaccinService.genererCalendrierVaccinal(naissanceId).pipe(
        map(data => VaccinsActions.genererCalendrierSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la génération du calendrier: ${error.customMessage || error.message}`);
          return of(VaccinsActions.genererCalendrierFailure({ error: error.customMessage || error.message }));
        })
      );
    })
  ));

  // Notification après génération du calendrier
  genererCalendrierSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(VaccinsActions.genererCalendrierSuccess),
    tap(({ data }) => {
      this.notificationService.success(`Calendrier vaccinal généré avec succès (${data.length} vaccins programmés)`);
    })
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private notificationService: NotificationService,
    private router: Router,
    private vaccinService: VaccinService
  ) {}
} 