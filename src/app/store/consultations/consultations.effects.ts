import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ConsultationsActions } from './consultations.actions';
import { ConsultationService } from '../../core/services/consultation.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class ConsultationsEffects {

  constructor(
    private actions$: Actions,
    private consultationService: ConsultationService,
    private notificationService: NotificationService
  ) {}

  // Chargement de toutes les consultations
  loadConsultations$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.loadConsultations),
    switchMap(({ page, size, sortBy, sortDir }) => {
      return this.consultationService.getAllConsultations(page, size, sortBy, sortDir).pipe(
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
          return ConsultationsActions.loadConsultationsSuccess({ data: pageResponse });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des consultations: ${error}`);
          return of(ConsultationsActions.loadConsultationsFailure({ error }));
        })
      );
    })
  ));

  // Chargement d'une consultation spécifique
  loadConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.loadConsultation),
    switchMap(({ id }) => {
      return this.consultationService.getConsultationById(id).pipe(
        map(data => ConsultationsActions.loadConsultationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement de la consultation: ${error}`);
          return of(ConsultationsActions.loadConsultationFailure({ error }));
        })
      );
    })
  ));

  // Chargement des consultations par grossesse
  loadConsultationsByGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.loadConsultationsByGrossesse),
    switchMap(({ grossesseId, page, size }) => {
      return this.consultationService.getConsultationsByGrossesseSimple(grossesseId).pipe(
        map(data => ConsultationsActions.loadConsultationsByGrossesseSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des consultations de la grossesse: ${error}`);
          return of(ConsultationsActions.loadConsultationsByGrossesseFailure({ error }));
        })
      );
    })
  ));

  // Recherche de consultations
  searchConsultations$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.searchConsultations),
    switchMap(({ grossesseId, dateDebut, dateFin, observation, page, size }) => {
      const searchParams = {
        grossesseId,
        dateDebut,
        dateFin,
        observation,
        page: page || 0,
        size: size || 10
      };
      
      return this.consultationService.searchConsultations(searchParams).pipe(
        map(response => {
          // Créer une PageResponse factice à partir d'ApiResponse
          const pageResponse = {
            content: response.data || [],
            totalElements: response.data?.length || 0,
            totalPages: 1,
            number: page || 0,
            size: size || 10,
            pageable: {
              sort: { sorted: false, unsorted: true, empty: true },
              offset: (page || 0) * (size || 10),
              pageNumber: page || 0,
              pageSize: size || 10,
              paged: true,
              unpaged: false
            },
            sort: { sorted: false, unsorted: true, empty: true },
            first: (page || 0) === 0,
            last: true,
            numberOfElements: response.data?.length || 0,
            empty: !response.data?.length
          };
          return ConsultationsActions.searchConsultationsSuccess({ data: pageResponse });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la recherche: ${error}`);
          return of(ConsultationsActions.searchConsultationsFailure({ error }));
        })
      );
    })
  ));

  // Création d'une consultation
  createConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.createConsultation),
    switchMap(({ request }) => {
      return this.consultationService.createConsultation(request).pipe(
        map(data => ConsultationsActions.createConsultationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création de la consultation: ${error}`);
          return of(ConsultationsActions.createConsultationFailure({ error }));
        })
      );
    })
  ));

  // Notification après création réussie
  createConsultationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.createConsultationSuccess),
    tap(({ data }) => {
      this.notificationService.success('La consultation a été créée avec succès');
    })
  ), { dispatch: false });

  // Mise à jour d'une consultation
  updateConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.updateConsultation),
    switchMap(({ id, request }) => {
      return this.consultationService.updateConsultation(id, request).pipe(
        map(data => ConsultationsActions.updateConsultationSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la mise à jour de la consultation: ${error}`);
          return of(ConsultationsActions.updateConsultationFailure({ error }));
        })
      );
    })
  ));

  // Notification après mise à jour réussie
  updateConsultationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.updateConsultationSuccess),
    tap(({ data }) => {
      this.notificationService.success('La consultation a été mise à jour avec succès');
    })
  ), { dispatch: false });

  // Suppression d'une consultation
  deleteConsultation$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.deleteConsultation),
    switchMap(({ id }) => {
      return this.consultationService.deleteConsultation(id).pipe(
        map(() => ConsultationsActions.deleteConsultationSuccess({ id })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la suppression de la consultation: ${error}`);
          return of(ConsultationsActions.deleteConsultationFailure({ error }));
        })
      );
    })
  ));

  // Notification après suppression réussie
  deleteConsultationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.deleteConsultationSuccess),
    tap(() => {
      this.notificationService.success('La consultation a été supprimée avec succès');
    })
  ), { dispatch: false });

  // Chargement des statistiques
  loadConsultationStats$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.loadConsultationStats),
    switchMap(({ grossesseId }) => {
      return this.consultationService.getConsultationStats(grossesseId).pipe(
        map(data => ConsultationsActions.loadConsultationStatsSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des statistiques: ${error}`);
          return of(ConsultationsActions.loadConsultationStatsFailure({ error }));
        })
      );
    })
  ));

  // Vérification des consultations dues
  checkConsultationDue$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.checkConsultationDue),
    switchMap(({ grossesseId }) => {
      return this.consultationService.checkConsultationDue(grossesseId).pipe(
        map(data => ConsultationsActions.checkConsultationDueSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la vérification des consultations dues: ${error}`);
          return of(ConsultationsActions.checkConsultationDueFailure({ error }));
        })
      );
    })
  ));

  // Chargement des modèles de consultation
  loadConsultationTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.loadConsultationTemplates),
    switchMap(() => {
      return this.consultationService.getConsultationTemplates().pipe(
        map(data => ConsultationsActions.loadConsultationTemplatesSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du chargement des modèles: ${error}`);
          return of(ConsultationsActions.loadConsultationTemplatesFailure({ error }));
        })
      );
    })
  ));

  // Création d'une consultation depuis un modèle
  createConsultationFromTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.createConsultationFromTemplate),
    switchMap(({ templateId, grossesseId, date }) => {
      return this.consultationService.createConsultationFromTemplate(templateId, grossesseId, date).pipe(
        map(data => ConsultationsActions.createConsultationFromTemplateSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors de la création depuis le modèle: ${error}`);
          return of(ConsultationsActions.createConsultationFromTemplateFailure({ error }));
        })
      );
    })
  ));

  // Notification après création depuis modèle réussie
  createConsultationFromTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.createConsultationFromTemplateSuccess),
    tap(({ data }) => {
      this.notificationService.success('La consultation a été créée depuis le modèle avec succès');
    })
  ), { dispatch: false });

  // Export PDF
  exportConsultationsPdf$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.exportConsultationsPdf),
    switchMap(({ grossesseId }) => {
      return this.consultationService.exportConsultationsPdf(grossesseId).pipe(
        map(blob => {
          // Créer un lien de téléchargement automatique
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `consultations-${grossesseId}-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          return ConsultationsActions.exportConsultationsPdfSuccess({ blob });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors de l'export PDF: ${error}`);
          return of(ConsultationsActions.exportConsultationsPdfFailure({ error }));
        })
      );
    })
  ));

  // Notification après export PDF réussi
  exportConsultationsPdfSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.exportConsultationsPdfSuccess),
    tap(() => {
      this.notificationService.success('Export PDF téléchargé avec succès');
    })
  ), { dispatch: false });

  // Export Excel
  exportConsultationsExcel$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.exportConsultationsExcel),
    switchMap(({ grossesseId }) => {
      return this.consultationService.exportConsultationsExcel(grossesseId).pipe(
        map(blob => {
          // Créer un lien de téléchargement automatique
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `consultations-${grossesseId}-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          return ConsultationsActions.exportConsultationsExcelSuccess({ blob });
        }),
        catchError(error => {
          this.notificationService.error(`Erreur lors de l'export Excel: ${error}`);
          return of(ConsultationsActions.exportConsultationsExcelFailure({ error }));
        })
      );
    })
  ));

  // Notification après export Excel réussi
  exportConsultationsExcelSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.exportConsultationsExcelSuccess),
    tap(() => {
      this.notificationService.success('Export Excel téléchargé avec succès');
    })
  ), { dispatch: false });

  // Filtrage par date
  filterByDateRange$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.filterByDateRange),
    switchMap(({ startDate, endDate }) => {
      const searchParams = {
        dateDebut: startDate,
        dateFin: endDate,
        page: 0,
        size: 100 // Récupérer plus d'éléments pour le filtrage
      };
      
      return this.consultationService.searchConsultations(searchParams).pipe(
        map(response => ConsultationsActions.filterByDateRangeSuccess({ data: response.data || [] })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par date: ${error}`);
          return of(ConsultationsActions.filterByDateRangeFailure({ error }));
        })
      );
    })
  ));

  // Filtrage par observation
  filterByObservation$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.filterByObservation),
    switchMap(({ observation }) => {
      const searchParams = {
        observation,
        page: 0,
        size: 100
      };
      
      return this.consultationService.searchConsultations(searchParams).pipe(
        map(response => ConsultationsActions.filterByObservationSuccess({ data: response.data || [] })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du filtrage par observation: ${error}`);
          return of(ConsultationsActions.filterByObservationFailure({ error }));
        })
      );
    })
  ));

  // Rafraîchir consultations pour une grossesse
  refreshConsultationsForGrossesse$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.refreshConsultationsForGrossesse),
    switchMap(({ grossesseId }) => {
      return this.consultationService.refreshConsultationsForGrossesse(grossesseId).pipe(
        map(data => ConsultationsActions.refreshConsultationsForGrossesseSuccess({ data })),
        catchError(error => {
          this.notificationService.error(`Erreur lors du rafraîchissement: ${error}`);
          return of(ConsultationsActions.refreshConsultationsForGrossesseFailure({ error }));
        })
      );
    })
  ));

  // Effet pour vider le cache du service quand l'action clearCache est dispatchée
  clearCache$ = createEffect(() => this.actions$.pipe(
    ofType(ConsultationsActions.clearCache),
    tap(() => {
      this.consultationService.clearCache();
    })
  ), { dispatch: false });
} 