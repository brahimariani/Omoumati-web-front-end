import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { TraitementService } from '../../core/services/traitement.service';
import { NotificationService } from '../../core/services/notification.service';
import * as TraitementsActions from './traitements.actions';

@Injectable()
export class TraitementsEffects {

  constructor(
    private actions$: Actions,
    private traitementService: TraitementService,
    private notificationService: NotificationService
  ) {}

  // Chargement de tous les traitements
  loadTraitements$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.loadTraitements),
    switchMap(({ page, size, sortBy, sortDir }) => {
      return this.traitementService.getAllTraitements(page, size, sortBy, sortDir).pipe(
        map(response => {
          // Créer une PageResponse factice à partir d'ApiResponse
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
          return TraitementsActions.loadTraitementsSuccess({ data: pageResponse });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des traitements: ${error}`);
          return of(TraitementsActions.loadTraitementsFailure({ error }));
        })
      );
    })
  ));

  // Chargement d'un traitement spécifique
  loadTraitement$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.loadTraitement),
    switchMap(({ id }) => {
      return this.traitementService.getTraitementById(id).pipe(
        map(data => TraitementsActions.loadTraitementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement du traitement: ${error}`);
          return of(TraitementsActions.loadTraitementFailure({ error }));
        })
      );
    })
  ));

  // Chargement des traitements par consultation
  loadTraitementsByConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.loadTraitementsByConsultation),
    switchMap(({ consultationId, page, size }) => {
      return this.traitementService.getTraitementsByConsultationSimple(consultationId).pipe(
        map(data => TraitementsActions.loadTraitementsByConsultationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des traitements de la consultation: ${error}`);
          return of(TraitementsActions.loadTraitementsByConsultationFailure({ error }));
        })
      );
    })
  ));

  // Chargement des traitements actifs
  loadTraitementsActifs$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.loadTraitementsActifs),
    switchMap(({ consultationId }) => {
      return this.traitementService.getTraitementsActifs(consultationId).pipe(
        map(data => TraitementsActions.loadTraitementsActifsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des traitements actifs: ${error}`);
          return of(TraitementsActions.loadTraitementsActifsFailure({ error }));
        })
      );
    })
  ));

  // Création d'un traitement
  createTraitement$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.createTraitement),
    switchMap(({ request }) => {
      return this.traitementService.createTraitement(request).pipe(
        map(data => TraitementsActions.createTraitementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création du traitement: ${error}`);
          return of(TraitementsActions.createTraitementFailure({ error }));
        })
      );
    })
  ));

  // Notification après création réussie
  createTraitementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.createTraitementSuccess),
    tap(({ data }) => {
      this.notificationService.success('Le traitement a été créé avec succès');
    })
  ), { dispatch: false });

  // Mise à jour d'un traitement
  updateTraitement$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.updateTraitement),
    switchMap(({ id, request }) => {
      return this.traitementService.updateTraitement(id, request).pipe(
        map(data => TraitementsActions.updateTraitementSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour du traitement: ${error}`);
          return of(TraitementsActions.updateTraitementFailure({ error }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateTraitementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.updateTraitementSuccess),
    tap(({ data }) => {
      this.notificationService.success('Le traitement a été mis à jour avec succès');
    })
  ), { dispatch: false });

  // Suppression d'un traitement
  deleteTraitement$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.deleteTraitement),
    switchMap(({ id }) => {
      return this.traitementService.deleteTraitement(id).pipe(
        map(() => TraitementsActions.deleteTraitementSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression du traitement: ${error}`);
          return of(TraitementsActions.deleteTraitementFailure({ error }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteTraitementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.deleteTraitementSuccess),
    tap(() => {
      this.notificationService.success('Le traitement a été supprimé avec succès');
    })
  ), { dispatch: false });

  // Filtrage par dates
  filterByDateRange$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.filterByDateRange),
    switchMap(({ startDate, endDate }) => {
      return this.traitementService.getTraitementsByPeriode(startDate, endDate).pipe(
        map(data => TraitementsActions.filterByDateRangeSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par date: ${error}`);
          return of(TraitementsActions.filterByDateRangeFailure({ error }));
        })
      );
    })
  ));

  // Filtrage par médicament
  filterByMedicament$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.filterByMedicament),
    switchMap(({ medicament }) => {
      return this.traitementService.getTraitementsByMedicament(medicament, 0, 100).pipe(
        map(response => TraitementsActions.filterByMedicamentSuccess({ data: response.data || [] })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par médicament: ${error}`);
          return of(TraitementsActions.filterByMedicamentFailure({ error }));
        })
      );
    })
  ));

  // Filtrage par statut
  filterByStatus$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.filterByStatus),
    switchMap(({ status }) => {
      if (status === 'actif') {
        return this.traitementService.getTraitementsActifs().pipe(
          map(data => TraitementsActions.filterByStatusSuccess({ data })),
          catchError(error => {
            this.notificationService.error(`Erreur lors du filtrage par statut: ${error}`);
            return of(TraitementsActions.filterByStatusFailure({ error }));
          })
        );
      } else {
        // Pour 'termine' et 'tous', on peut implémenter une logique spécifique
        return this.traitementService.getAllTraitements(0, 100).pipe(
          map(response => {
            let data = response.data || [];
            if (status === 'termine') {
              const today = new Date();
              data = data.filter(t => new Date(t.dateFin) <= today);
            }
            return TraitementsActions.filterByStatusSuccess({ data });
          }),
          catchError(error => {
            this.notificationService.error(`Erreur lors du filtrage par statut: ${error}`);
            return of(TraitementsActions.filterByStatusFailure({ error }));
          })
        );
      }
    })
  ));

  // Vérification des interactions médicamenteuses
  checkInteractions$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.checkInteractions),
    switchMap(({ medicaments }) => {
      // Note: Cette fonctionnalité nécessiterait un endpoint spécifique
      // Pour l'instant, on simule avec une réponse vide
      const mockData = {
        hasInteractions: false,
        interactions: []
      };
      return of(TraitementsActions.checkInteractionsSuccess({ data: mockData }));
    })
  ));

  // Suggestions de traitements
  getTreatmentSuggestions$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.getTreatmentSuggestions),
    switchMap(({ indication, patienteId }) => {
      // Note: Cette fonctionnalité nécessiterait un endpoint spécifique
      // Pour l'instant, on simule avec une réponse vide
      const mockData: Array<{
        medicament: string;
        posologie: string;
        duree: string;
        indication: string;
      }> = [];
      return of(TraitementsActions.getTreatmentSuggestionsSuccess({ data: mockData }));
    })
  ));

  // Validation de posologie
  validatePosologie$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.validatePosologie),
    switchMap(({ medicament, posologie, patienteId }) => {
      // Note: Cette fonctionnalité nécessiterait un endpoint spécifique
      // Pour l'instant, on simule avec une validation basique
      const mockData = {
        isValid: true,
        warnings: [],
        recommendations: []
      };
      return of(TraitementsActions.validatePosologieSuccess({ data: mockData }));
    })
  ));

  // Rafraîchir traitements pour une consultation
  refreshTraitementsForConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.refreshTraitementsForConsultation),
    switchMap(({ consultationId }) => {
      return this.traitementService.refreshCacheForConsultation(consultationId).pipe(
        map(data => TraitementsActions.refreshTraitementsForConsultationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du rafraîchissement: ${error}`);
          return of(TraitementsActions.refreshTraitementsForConsultationFailure({ error }));
        })
      );
    })
  ));

  // Vider le cache
  clearCache$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.clearCache),
    tap(() => {
      this.traitementService.clearCache();
    })
  ), { dispatch: false });

  // Export PDF (simulation)
  exportTraitementsPdf$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.exportTraitementsPdf),
    switchMap(({ consultationId, patienteId }) => {
      // Note: Cette fonctionnalité nécessiterait un endpoint spécifique
      // Pour l'instant, on simule avec un Blob vide
      const mockBlob = new Blob([''], { type: 'application/pdf' });
      return of(TraitementsActions.exportTraitementsPdfSuccess({ blob: mockBlob }));
    })
  ));

  // Export Excel (simulation)
  exportTraitementsExcel$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.exportTraitementsExcel),
    switchMap(({ consultationId, patienteId }) => {
      // Note: Cette fonctionnalité nécessiterait un endpoint spécifique
      // Pour l'instant, on simule avec un Blob vide
      const mockBlob = new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return of(TraitementsActions.exportTraitementsExcelSuccess({ blob: mockBlob }));
    })
  ));

  // Notification après export PDF réussi
  exportTraitementsPdfSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.exportTraitementsPdfSuccess),
    tap(() => {
      this.notificationService.success('Export PDF généré avec succès');
    })
  ), { dispatch: false });

  // Notification après export Excel réussi
  exportTraitementsExcelSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TraitementsActions.exportTraitementsExcelSuccess),
    tap(() => {
      this.notificationService.success('Export Excel généré avec succès');
    })
  ), { dispatch: false });
} 