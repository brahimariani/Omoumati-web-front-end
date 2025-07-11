import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ExamenBiologiqueService } from '../../core/services/examen-biologique.service';
import { NotificationService } from '../../core/services/notification.service';
import * as ExamensBiologiquesActions from './examens-biologiques.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class ExamensBiologiquesEffects {

  constructor(
    private actions$: Actions,
    private examenBiologiqueService: ExamenBiologiqueService,
    private notificationService: NotificationService,
    private store: Store
  ) {}

  // ===== EFFECTS CRUD DE BASE =====

  /**
   * Charger tous les examens biologiques
   */
  loadExamensBiologiques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadExamensBiologiques),
      switchMap(({ page = 0, size = 10, sortBy = 'id', sortDir = 'desc' }) =>
        this.examenBiologiqueService.getAllExamensBiologiques(page, size, sortBy, sortDir).pipe(
          map(response => ExamensBiologiquesActions.loadExamensBiologiquesSuccess({ response })),
          catchError(error => of(ExamensBiologiquesActions.loadExamensBiologiquesFailure({ 
            error: error.message || 'Erreur lors du chargement des examens biologiques' 
          })))
        )
      )
    )
  );

  /**
   * Charger un examen biologique par ID
   */
  loadExamenBiologique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadExamenBiologique),
      switchMap(({ id }) =>
        this.examenBiologiqueService.getExamenBiologiqueById(id).pipe(
          map(examen => ExamensBiologiquesActions.loadExamenBiologiqueSuccess({ examen })),
          catchError(error => of(ExamensBiologiquesActions.loadExamenBiologiqueFailure({ 
            error: error.message || 'Erreur lors du chargement de l\'examen biologique' 
          })))
        )
      )
    )
  );

  /**
   * Créer un examen biologique
   */
  createExamenBiologique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.createExamenBiologique),
      switchMap(({ examenRequest }) =>
        this.examenBiologiqueService.createExamenBiologique(examenRequest).pipe(
          map(examen => ExamensBiologiquesActions.createExamenBiologiqueSuccess({ examen })),
          catchError(error => of(ExamensBiologiquesActions.createExamenBiologiqueFailure({ 
            error: error.message || 'Erreur lors de la création de l\'examen biologique' 
          })))
        )
      )
    )
  );

  /**
   * Mettre à jour un examen biologique
   */
  updateExamenBiologique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.updateExamenBiologique),
      switchMap(({ id, examenRequest }) =>
        this.examenBiologiqueService.updateExamenBiologique(id, examenRequest).pipe(
          map(examen => ExamensBiologiquesActions.updateExamenBiologiqueSuccess({ examen })),
          catchError(error => of(ExamensBiologiquesActions.updateExamenBiologiqueFailure({ 
            error: error.message || 'Erreur lors de la mise à jour de l\'examen biologique' 
          })))
        )
      )
    )
  );

  /**
   * Supprimer un examen biologique
   */
  deleteExamenBiologique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.deleteExamenBiologique),
      switchMap(({ id }) =>
        this.examenBiologiqueService.deleteExamenBiologique(id).pipe(
          map(() => ExamensBiologiquesActions.deleteExamenBiologiqueSuccess({ id })),
          catchError(error => of(ExamensBiologiquesActions.deleteExamenBiologiqueFailure({ 
            error: error.message || 'Erreur lors de la suppression de l\'examen biologique' 
          })))
        )
      )
    )
  );

  // ===== EFFECTS DE RECHERCHE SPÉCIALISÉES =====

  /**
   * Charger les examens par consultation
   */
  loadExamensByConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadExamensByConsultation),
      switchMap(({ consultationId, page = 0, size = 20 }) =>
        this.examenBiologiqueService.getExamensByConsultationSimple(consultationId).pipe(
          map(examens => ExamensBiologiquesActions.loadExamensByConsultationSuccess({ 
            examens, 
            consultationId 
          })),
          catchError(error => {
            // En cas d'erreur, retourner un tableau vide plutôt qu'une erreur
            // pour éviter les états de chargement infinis
            console.warn('Aucun examen biologique trouvé pour cette consultation:', error.message);
            return of(ExamensBiologiquesActions.loadExamensByConsultationSuccess({ 
              examens: [], 
              consultationId 
            }));
          })
        )
      )
    )
  );

  /**
   * Charger les examens récents
   */
  loadExamensRecents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadExamensRecents),
      switchMap(({ consultationId, limit = 5 }) =>
        this.examenBiologiqueService.getExamensRecents(consultationId, limit).pipe(
          map(examens => ExamensBiologiquesActions.loadExamensRecentsSuccess({ examens })),
          catchError(error => of(ExamensBiologiquesActions.loadExamensRecentsFailure({ 
            error: error.message || 'Erreur lors du chargement des examens récents' 
          })))
        )
      )
    )
  );

  /**
   * Charger les examens par type d'acte
   */
  loadExamensByActeType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadExamensByActeType),
      switchMap(({ nomActe, consultationId }) =>
        this.examenBiologiqueService.getExamensByActeType(nomActe, consultationId).pipe(
          map(examens => ExamensBiologiquesActions.loadExamensByActeTypeSuccess({ 
            examens, 
            nomActe 
          })),
          catchError(error => of(ExamensBiologiquesActions.loadExamensByActeTypeFailure({ 
            error: error.message || 'Erreur lors du chargement des examens par type d\'acte' 
          })))
        )
      )
    )
  );

  /**
   * Charger les examens avec anomalies
   */
  loadExamensAvecAnomalies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadExamensAvecAnomalies),
      switchMap(({ consultationId }) =>
        this.examenBiologiqueService.getExamensAvecAnomalies(consultationId).pipe(
          map(examens => ExamensBiologiquesActions.loadExamensAvecAnomaliesSuccess({ examens })),
          catchError(error => of(ExamensBiologiquesActions.loadExamensAvecAnomaliesFailure({ 
            error: error.message || 'Erreur lors du chargement des examens avec anomalies' 
          })))
        )
      )
    )
  );

  /**
   * Rechercher des examens
   */
  searchExamens$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.searchExamens),
      switchMap(({ searchTerm, consultationId, page = 0, size = 10 }) =>
        this.examenBiologiqueService.searchExamens(searchTerm, consultationId, page, size).pipe(
          map(response => ExamensBiologiquesActions.searchExamensSuccess({ 
            response, 
            searchTerm 
          })),
          catchError(error => of(ExamensBiologiquesActions.searchExamensFailure({ 
            error: error.message || 'Erreur lors de la recherche d\'examens' 
          })))
        )
      )
    )
  );

  // ===== EFFECTS SPÉCIALISÉS POUR LES ACTES BIOLOGIQUES =====

  /**
   * Charger les actes biologiques standards
   */
  loadActesBiologiquesStandards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadActesBiologiquesStandards),
      switchMap(() => {
        const actes = this.examenBiologiqueService.getActesBiologiquesStandards();
        return of(ExamensBiologiquesActions.loadActesBiologiquesStandardsSuccess({ actes }));
      })
    )
  );

  /**
   * Analyser les valeurs biologiques
   */
  analyserValeursBiologiques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.analyserValeursBiologiques),
      switchMap(({ examen }) => {
        try {
          const analyses = this.examenBiologiqueService.analyserValeursBiologiques(examen);
          return of(ExamensBiologiquesActions.analyserValeursBiologiquesSuccess({ 
            examenId: examen.id,
            analyses 
          }));
        } catch (error: any) {
          return of(ExamensBiologiquesActions.analyserValeursBiologiquesFailure({ 
            error: error.message || 'Erreur lors de l\'analyse des valeurs biologiques' 
          }));
        }
      })
    )
  );

  // ===== EFFECTS DE STATISTIQUES =====

  /**
   * Charger les statistiques
   */
  loadStatistiques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.loadStatistiques),
      switchMap(({ consultationId, dateDebut, dateFin }) =>
        this.examenBiologiqueService.getStatistiquesExamens(consultationId, dateDebut, dateFin).pipe(
          map(statistiques => ExamensBiologiquesActions.loadStatistiquesSuccess({ statistiques })),
          catchError(error => of(ExamensBiologiquesActions.loadStatistiquesFailure({ 
            error: error.message || 'Erreur lors du chargement des statistiques' 
          })))
        )
      )
    )
  );

  // ===== EFFECTS UTILITAIRES =====

  /**
   * Actualiser le cache pour une consultation
   */
  refreshCacheForConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.refreshCacheForConsultation),
      switchMap(({ consultationId }) =>
        this.examenBiologiqueService.refreshCacheForConsultation(consultationId).pipe(
          map(examens => ExamensBiologiquesActions.refreshCacheForConsultationSuccess({ 
            examens, 
            consultationId 
          })),
          catchError(error => of(ExamensBiologiquesActions.refreshCacheForConsultationFailure({ 
            error: error.message || 'Erreur lors de l\'actualisation du cache' 
          })))
        )
      )
    )
  );

  // ===== EFFECTS DE NOTIFICATION =====

  /**
   * Notification de succès pour la création
   */
  createExamenBiologiqueSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.createExamenBiologiqueSuccess),
      tap(() => {
        this.notificationService.success('Examen biologique créé avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour la mise à jour
   */
  updateExamenBiologiqueSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.updateExamenBiologiqueSuccess),
      tap(() => {
        this.notificationService.success('Examen biologique mis à jour avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour la suppression
   */
  deleteExamenBiologiqueSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.deleteExamenBiologiqueSuccess),
      tap(() => {
        this.notificationService.success('Examen biologique supprimé avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification d'erreur générale
   */
  handleError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ExamensBiologiquesActions.loadExamensBiologiquesFailure,
        ExamensBiologiquesActions.loadExamenBiologiqueFailure,
        ExamensBiologiquesActions.createExamenBiologiqueFailure,
        ExamensBiologiquesActions.updateExamenBiologiqueFailure,
        ExamensBiologiquesActions.deleteExamenBiologiqueFailure,
        ExamensBiologiquesActions.loadExamensByConsultationFailure,
        ExamensBiologiquesActions.loadExamensRecentsFailure,
        ExamensBiologiquesActions.loadExamensByActeTypeFailure,
        ExamensBiologiquesActions.loadExamensAvecAnomaliesFailure,
        ExamensBiologiquesActions.searchExamensFailure,
        ExamensBiologiquesActions.analyserValeursBiologiquesFailure,
        ExamensBiologiquesActions.loadStatistiquesFailure,
        ExamensBiologiquesActions.refreshCacheForConsultationFailure,
        ExamensBiologiquesActions.exportExamensFailure
      ),
      tap(({ error }) => {
        this.notificationService.error(error);
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour l'analyse des valeurs
   */
  analyserValeursBiologiquesSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensBiologiquesActions.analyserValeursBiologiquesSuccess),
      tap(({ analyses }) => {
        const anomalies = analyses.filter(a => a.statut !== 'normal');
        if (anomalies.length > 0) {
          const critiques = anomalies.filter(a => a.statut === 'critique');
          if (critiques.length > 0) {
            this.notificationService.warning(
              `${critiques.length} valeur(s) critique(s) détectée(s) - Intervention urgente recommandée`
            );
          } else {
            this.notificationService.info(
              `${anomalies.length} anomalie(s) détectée(s) dans les valeurs biologiques`
            );
          }
        } else {
          this.notificationService.success('Toutes les valeurs biologiques sont normales');
        }
      })
    ),
    { dispatch: false }
  );
} 