import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as ExamensCliniquesActions from './examens-cliniques.actions';
import { ExamenCliniqueService } from '../../core/services/examen-clinique.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class ExamensCliniquesEffects {

  constructor(
    private actions$: Actions,
    private examenCliniqueService: ExamenCliniqueService,
    private notificationService: NotificationService
  ) {}

  // Chargement de tous les examens
  loadExamens$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.loadExamens),
    switchMap(({ page, size, sortBy, sortDir }) => {
      return this.examenCliniqueService.getAllExamensCliniques(page, size, sortBy, sortDir).pipe(
        map(response => {
          const pageResponse = {
            content: response.data || [],
            totalElements: response.data?.length || 0,
            totalPages: 1,
            number: page,
            size: size,
            pageable: {
              sort: { sorted: false, unsorted: true, empty: true },
              offset: page * size,
              pageNumber: page,
              pageSize: size,
              paged: true,
              unpaged: false
            },
            sort: { sorted: false, unsorted: true, empty: true },
            first: page === 0,
            last: true,
            numberOfElements: response.data?.length || 0,
            empty: !response.data?.length
          };
          return ExamensCliniquesActions.loadExamensSuccess({ data: pageResponse });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des examens cliniques: ${error}`);
          return of(ExamensCliniquesActions.loadExamensFailure({ error }));
        })
      );
    })
  ));

  // Chargement d'un examen spécifique
  loadExamen$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.loadExamen),
    switchMap(({ id }) => {
      return this.examenCliniqueService.getExamenCliniqueById(id).pipe(
        map(data => ExamensCliniquesActions.loadExamenSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de l'examen clinique: ${error}`);
          return of(ExamensCliniquesActions.loadExamenFailure({ error }));
        })
      );
    })
  ));

  // Chargement des examens par consultation
  loadExamensByConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.loadExamensByConsultation),
    switchMap(({ consultationId }) => {
      return this.examenCliniqueService.getExamensByConsultationSimple(consultationId).pipe(
        map(data => ExamensCliniquesActions.loadExamensByConsultationSuccess({ data: data || [] })),
        catchError(error => {
          console.warn('API non disponible, retour de données vides:', error);
          // Retourner des données vides au lieu d'une erreur pour éviter le chargement infini
          return of(ExamensCliniquesActions.loadExamensByConsultationSuccess({ data: [] }));
        })
      );
    })
  ));

  // Chargement des examens récents
  loadExamensRecents$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.loadExamensRecents),
    switchMap(({ consultationId, limit }) => {
      return this.examenCliniqueService.getExamensRecents(consultationId, limit).pipe(
        map(data => ExamensCliniquesActions.loadExamensRecentsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des examens récents: ${error}`);
          return of(ExamensCliniquesActions.loadExamensRecentsFailure({ error }));
        })
      );
    })
  ));

  // Création d'un examen
  createExamen$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.createExamen),
    switchMap(({ request }) => {
      return this.examenCliniqueService.createExamenClinique(request).pipe(
        map(data => ExamensCliniquesActions.createExamenSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création de l'examen clinique: ${error}`);
          return of(ExamensCliniquesActions.createExamenFailure({ error }));
        })
      );
    })
  ));

  // Notification après création réussie
  createExamenSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.createExamenSuccess),
    tap(() => {
      this.notificationService.success('L\'examen clinique a été créé avec succès');
    })
  ), { dispatch: false });

  // Mise à jour d'un examen
  updateExamen$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.updateExamen),
    switchMap(({ id, request }) => {
      return this.examenCliniqueService.updateExamenClinique(id, request).pipe(
        map(data => ExamensCliniquesActions.updateExamenSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de l'examen clinique: ${error}`);
          return of(ExamensCliniquesActions.updateExamenFailure({ error }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateExamenSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.updateExamenSuccess),
    tap(() => {
      this.notificationService.success('L\'examen clinique a été mis à jour avec succès');
    })
  ), { dispatch: false });

  // Suppression d'un examen
  deleteExamen$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.deleteExamen),
    switchMap(({ id }) => {
      return this.examenCliniqueService.deleteExamenClinique(id).pipe(
        map(() => ExamensCliniquesActions.deleteExamenSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de l'examen clinique: ${error}`);
          return of(ExamensCliniquesActions.deleteExamenFailure({ error }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteExamenSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.deleteExamenSuccess),
    tap(() => {
      this.notificationService.success('L\'examen clinique a été supprimé avec succès');
    })
  ), { dispatch: false });

  // Évaluation des signes vitaux
  evaluateSignesVitaux$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.evaluateSignesVitaux),
    switchMap(({ examen }) => {
      try {
        const evaluation = this.examenCliniqueService.evaluerSignesVitaux(examen);
        return of(ExamensCliniquesActions.evaluateSignesVitauxSuccess({ data: evaluation }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.notificationService.error(`Erreur lors de l'évaluation des signes vitaux: ${errorMessage}`);
        return of(ExamensCliniquesActions.evaluateSignesVitauxFailure({ error: errorMessage }));
      }
    })
  ));

  // Calcul IMC
  calculateIMC$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.calculateIMC),
    switchMap(({ poids, taille }) => {
      try {
        const imc = this.examenCliniqueService.calculerIMC(poids, taille);
        let categorie: 'maigreur' | 'normal' | 'surpoids' | 'obesite' = 'normal';
        
        if (imc < 18.5) {
          categorie = 'maigreur';
        } else if (imc >= 25 && imc < 30) {
          categorie = 'surpoids';
        } else if (imc >= 30) {
          categorie = 'obesite';
        }
        
        return of(ExamensCliniquesActions.calculateIMCSuccess({ imc, categorie }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.notificationService.error(`Erreur lors du calcul de l'IMC: ${errorMessage}`);
        return of(ExamensCliniquesActions.calculateIMCFailure({ error: errorMessage }));
      }
    })
  ));

  // Clear cache
  clearCache$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.clearCache),
    tap(() => {
      this.examenCliniqueService.clearCache();
    })
  ), { dispatch: false });

  // Rafraîchir examens pour consultation
  refreshExamensForConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(ExamensCliniquesActions.refreshExamensForConsultation),
    switchMap(({ consultationId }) => {
      return this.examenCliniqueService.refreshCacheForConsultation(consultationId).pipe(
        map(data => ExamensCliniquesActions.refreshExamensForConsultationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du rafraîchissement: ${error}`);
          return of(ExamensCliniquesActions.refreshExamensForConsultationFailure({ error }));
        })
      );
    })
  ));
} 