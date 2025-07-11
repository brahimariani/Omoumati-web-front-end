import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { ExamenEchographiqueService } from '../../core/services/examen-echographique.service';
import { NotificationService } from '../../core/services/notification.service';
import * as ExamensEchographiquesActions from './examens-echographiques.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class ExamensEchographiquesEffects {

  constructor(
    private actions$: Actions,
    private examenEchographiqueService: ExamenEchographiqueService,
    private notificationService: NotificationService,
    private store: Store
  ) {}

  // ===== EFFECTS CRUD DE BASE =====

  /**
   * Charger tous les examens échographiques
   */
  loadExamensEchographiques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.loadExamensEchographiques),
      switchMap(({ page = 0, size = 10, sortBy = 'id', sortDir = 'desc' }) =>
        this.examenEchographiqueService.getAllExamensEchographiques(page, size, sortBy, sortDir).pipe(
          map(response => ExamensEchographiquesActions.loadExamensEchographiquesSuccess({ response })),
          catchError(error => of(ExamensEchographiquesActions.loadExamensEchographiquesFailure({ 
            error: error.message || 'Erreur lors du chargement des examens échographiques' 
          })))
        )
      )
    )
  );

  /**
   * Charger un examen échographique par ID
   */
  loadExamenEchographique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.loadExamenEchographique),
      switchMap(({ id }) =>
        this.examenEchographiqueService.getExamenEchographiqueById(id).pipe(
          map(examen => ExamensEchographiquesActions.loadExamenEchographiqueSuccess({ examen })),
          catchError(error => of(ExamensEchographiquesActions.loadExamenEchographiqueFailure({ 
            error: error.message || 'Erreur lors du chargement de l\'examen échographique' 
          })))
        )
      )
    )
  );

  /**
   * Créer un examen échographique
   */
  createExamenEchographique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.createExamenEchographique),
      switchMap(({ examenRequest, images }) =>
        this.examenEchographiqueService.createExamenEchographique(examenRequest, images).pipe(
          map(examen => ExamensEchographiquesActions.createExamenEchographiqueSuccess({ examen })),
          catchError(error => of(ExamensEchographiquesActions.createExamenEchographiqueFailure({ 
            error: error.message || 'Erreur lors de la création de l\'examen échographique' 
          })))
        )
      )
    )
  );

  /**
   * Mettre à jour un examen échographique
   */
  updateExamenEchographique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.updateExamenEchographique),
      switchMap(({ id, examenRequest, images }) =>
        this.examenEchographiqueService.updateExamenEchographique(id, examenRequest, images).pipe(
          map(examen => ExamensEchographiquesActions.updateExamenEchographiqueSuccess({ examen })),
          catchError(error => of(ExamensEchographiquesActions.updateExamenEchographiqueFailure({ 
            error: error.message || 'Erreur lors de la mise à jour de l\'examen échographique' 
          })))
        )
      )
    )
  );

  /**
   * Supprimer un examen échographique
   */
  deleteExamenEchographique$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.deleteExamenEchographique),
      switchMap(({ id }) =>
        this.examenEchographiqueService.deleteExamenEchographique(id).pipe(
          map(() => ExamensEchographiquesActions.deleteExamenEchographiqueSuccess({ id })),
          catchError(error => of(ExamensEchographiquesActions.deleteExamenEchographiqueFailure({ 
            error: error.message || 'Erreur lors de la suppression de l\'examen échographique' 
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
      ofType(ExamensEchographiquesActions.loadExamensByConsultation),
      switchMap(({ consultationId, page = 0, size = 20 }) => {
        console.log('🔍 Chargement des examens échographiques pour consultationId:', consultationId);
        return this.examenEchographiqueService.getExamensByConsultation(consultationId, page, size).pipe(
          map(response => {
            console.log('✅ Réponse du service reçue:', response);
            // Extraire le tableau d'examens de la réponse ApiResponse
            const examens = response.data || [];
            console.log('✅ Examens échographiques extraits:', examens);
            return ExamensEchographiquesActions.loadExamensByConsultationSuccess({ 
              examens, 
              consultationId 
            });
          }),
          catchError(error => {
            // En cas d'erreur, retourner un tableau vide plutôt qu'une erreur
            console.warn('❌ Aucun examen échographique trouvé pour cette consultation:', error.message);
            return of(ExamensEchographiquesActions.loadExamensByConsultationSuccess({ 
              examens: [], 
              consultationId 
            }));
          })
        );
      })
    )
  );

  /**
   * Charger les examens récents
   */
  loadExamensRecents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.loadExamensRecents),
      switchMap(({ consultationId, limit = 5 }) =>
        this.examenEchographiqueService.getExamensRecents(consultationId, limit).pipe(
          map(examens => ExamensEchographiquesActions.loadExamensRecentsSuccess({ examens })),
          catchError(error => of(ExamensEchographiquesActions.loadExamensRecentsFailure({ 
            error: error.message || 'Erreur lors du chargement des examens récents' 
          })))
        )
      )
    )
  );

  /**
   * Charger les examens par trimestre
   */
  loadExamensByTrimestre$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.loadExamensByTrimestre),
      switchMap(({ trimestre, consultationId }) =>
        this.examenEchographiqueService.getExamensByTrimestre(trimestre, consultationId).pipe(
          map(examens => ExamensEchographiquesActions.loadExamensByTrimestreSuccess({ 
            examens, 
            trimestre 
          })),
          catchError(error => of(ExamensEchographiquesActions.loadExamensByTrimestreFailure({ 
            error: error.message || 'Erreur lors du chargement des examens par trimestre' 
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
      ofType(ExamensEchographiquesActions.loadExamensAvecAnomalies),
      switchMap(({ consultationId }) =>
        this.examenEchographiqueService.getExamensAvecAnomalies(consultationId).pipe(
          map(examens => ExamensEchographiquesActions.loadExamensAvecAnomaliesSuccess({ examens })),
          catchError(error => of(ExamensEchographiquesActions.loadExamensAvecAnomaliesFailure({ 
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
      ofType(ExamensEchographiquesActions.searchExamens),
      switchMap(({ searchTerm, consultationId, page = 0, size = 10 }) =>
        this.examenEchographiqueService.searchExamens(searchTerm, consultationId, page, size).pipe(
          map(response => ExamensEchographiquesActions.searchExamensSuccess({ 
            response, 
            searchTerm 
          })),
          catchError(error => of(ExamensEchographiquesActions.searchExamensFailure({ 
            error: error.message || 'Erreur lors de la recherche d\'examens' 
          })))
        )
      )
    )
  );

  // ===== EFFECTS SPÉCIALISÉS POUR LES MESURES ÉCHOGRAPHIQUES =====

  /**
   * Analyser les mesures échographiques
   */
  analyserMesuresEchographiques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.analyserMesuresEchographiques),
      switchMap(({ examen, ageGestationnel }) => {
        try {
          const analyses = this.examenEchographiqueService.analyserMesuresEchographiques(examen, ageGestationnel);
          return of(ExamensEchographiquesActions.analyserMesuresEchographiquesSuccess({ 
            examenId: examen.id,
            analyses 
          }));
        } catch (error: any) {
          return of(ExamensEchographiquesActions.analyserMesuresEchographiquesFailure({ 
            error: error.message || 'Erreur lors de l\'analyse des mesures échographiques' 
          }));
        }
      })
    )
  );

  // ===== EFFECTS POUR LA GESTION DES IMAGES =====

  /**
   * Charger les images d'un examen
   */
  loadImagesExamen$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.loadImagesExamen),
      switchMap(({ examenId }) =>
        this.examenEchographiqueService.getImagesExamen(examenId).pipe(
          map(images => ExamensEchographiquesActions.loadImagesExamenSuccess({ 
            examenId, 
            images 
          })),
          catchError(error => of(ExamensEchographiquesActions.loadImagesExamenFailure({ 
            error: error.message || 'Erreur lors du chargement des images' 
          })))
        )
      )
    )
  );

  /**
   * Ajouter une image
   */
  ajouterImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.ajouterImage),
      switchMap(({ examenId, imageRequest }) =>
        this.examenEchographiqueService.ajouterImage(examenId, imageRequest).pipe(
          map(image => ExamensEchographiquesActions.ajouterImageSuccess({ 
            examenId, 
            image 
          })),
          catchError(error => of(ExamensEchographiquesActions.ajouterImageFailure({ 
            error: error.message || 'Erreur lors de l\'ajout de l\'image' 
          })))
        )
      )
    )
  );

  /**
   * Supprimer une image
   */
  supprimerImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.supprimerImage),
      switchMap(({ examenId, imageId }) =>
        this.examenEchographiqueService.supprimerImage(examenId, imageId).pipe(
          map(() => ExamensEchographiquesActions.supprimerImageSuccess({ 
            examenId, 
            imageId 
          })),
          catchError(error => of(ExamensEchographiquesActions.supprimerImageFailure({ 
            error: error.message || 'Erreur lors de la suppression de l\'image' 
          })))
        )
      )
    )
  );

  /**
   * Upload d'une image
   */
  uploadImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.uploadImage),
      switchMap(({ examenId, file, titre }) =>
        this.examenEchographiqueService.uploadImage(examenId, file, titre).pipe(
          map(image => ExamensEchographiquesActions.uploadImageSuccess({ 
            examenId, 
            image 
          })),
          catchError(error => of(ExamensEchographiquesActions.uploadImageFailure({ 
            error: error.message || 'Erreur lors de l\'upload de l\'image' 
          })))
        )
      )
    )
  );

  // ===== EFFECTS DE STATISTIQUES =====

  /**
   * Charger les statistiques
   */
  loadStatistiques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.loadStatistiques),
      switchMap(({ consultationId, dateDebut, dateFin }) =>
        this.examenEchographiqueService.getStatistiquesExamens(consultationId, dateDebut, dateFin).pipe(
          map(statistiques => ExamensEchographiquesActions.loadStatistiquesSuccess({ statistiques })),
          catchError(error => of(ExamensEchographiquesActions.loadStatistiquesFailure({ 
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
      ofType(ExamensEchographiquesActions.refreshCacheForConsultation),
      switchMap(({ consultationId }) =>
        this.examenEchographiqueService.refreshCacheForConsultation(consultationId).pipe(
          map(examens => ExamensEchographiquesActions.refreshCacheForConsultationSuccess({ 
            examens, 
            consultationId 
          })),
          catchError(error => of(ExamensEchographiquesActions.refreshCacheForConsultationFailure({ 
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
  createExamenEchographiqueSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.createExamenEchographiqueSuccess),
      tap(() => {
        this.notificationService.success('Examen échographique créé avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour la mise à jour
   */
  updateExamenEchographiqueSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.updateExamenEchographiqueSuccess),
      tap(() => {
        this.notificationService.success('Examen échographique mis à jour avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour la suppression
   */
  deleteExamenEchographiqueSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.deleteExamenEchographiqueSuccess),
      tap(() => {
        this.notificationService.success('Examen échographique supprimé avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour l'ajout d'image
   */
  ajouterImageSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.ajouterImageSuccess),
      tap(() => {
        this.notificationService.success('Image ajoutée avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour l'upload d'image
   */
  uploadImageSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.uploadImageSuccess),
      tap(() => {
        this.notificationService.success('Image uploadée avec succès');
      })
    ),
    { dispatch: false }
  );

  /**
   * Notification de succès pour la suppression d'image
   */
  supprimerImageSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamensEchographiquesActions.supprimerImageSuccess),
      tap(() => {
        this.notificationService.success('Image supprimée avec succès');
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
        ExamensEchographiquesActions.loadExamensEchographiquesFailure,
        ExamensEchographiquesActions.loadExamenEchographiqueFailure,
        ExamensEchographiquesActions.createExamenEchographiqueFailure,
        ExamensEchographiquesActions.updateExamenEchographiqueFailure,
        ExamensEchographiquesActions.deleteExamenEchographiqueFailure,
        ExamensEchographiquesActions.loadExamensByConsultationFailure,
        ExamensEchographiquesActions.loadExamensRecentsFailure,
        ExamensEchographiquesActions.loadExamensByTrimestreFailure,
        ExamensEchographiquesActions.loadExamensAvecAnomaliesFailure,
        ExamensEchographiquesActions.searchExamensFailure,
        ExamensEchographiquesActions.analyserMesuresEchographiquesFailure,
        ExamensEchographiquesActions.loadImagesExamenFailure,
        ExamensEchographiquesActions.ajouterImageFailure,
        ExamensEchographiquesActions.supprimerImageFailure,
        ExamensEchographiquesActions.uploadImageFailure,
        ExamensEchographiquesActions.loadStatistiquesFailure,
        ExamensEchographiquesActions.refreshCacheForConsultationFailure,
        ExamensEchographiquesActions.exportExamensFailure
      ),
      tap(({ error }) => {
        this.notificationService.error(error);
      })
    ),
    { dispatch: false }
  );
} 