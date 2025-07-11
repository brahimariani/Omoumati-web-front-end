import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, combineLatest, map, switchMap } from 'rxjs';

import { ComplicationListComponent } from '../complication-list/complication-list.component';
import { ComplicationContextData } from '../complication-form/complication-form.component';
import { ComplicationResponse } from '../../../../core/models/complication/complication-response.model';
import { GrossesseResponse } from '../../../../core/models/grossesse/grossesse-response.model';
import { AccouchementResponse } from '../../../../core/models/accouchement/accouchement-response.model';
import { NaissanceResponse } from '../../../../core/models/naissance/naissance-response.model';

import { ComplicationsActions, selectComplicationsByGrossesse, selectComplicationsByAccouchement, selectComplicationsByNaissance } from '../../../../store/complications';
import { GrossessesActions, selectSelectedGrossesse } from '../../../../store/grossesses';
import { AccouchementsActions, selectSelectedAccouchement } from '../../../../store/accouchements';
import { NaissancesActions, selectSelectedNaissance } from '../../../../store/naissances';

@Component({
  selector: 'app-complications-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    ComplicationListComponent
  ],
  template: `
    <app-complication-list
      [complications]="(complications$ | async) ?? []"
      [contextData]="(contextData$ | async) ?? undefined"
      [title]="(title$ | async) ?? 'Complications'"
      (complicationAdded)="onComplicationAdded($event)"
      (complicationUpdated)="onComplicationUpdated($event)"
      (complicationDeleted)="onComplicationDeleted($event)">
    </app-complication-list>
  `
})
export class ComplicationsWrapperComponent implements OnInit, OnDestroy {
  complications$!: Observable<ComplicationResponse[]>;
  contextData$!: Observable<ComplicationContextData | null>;
  title$!: Observable<string>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {
    // Écouter les paramètres de route pour déterminer le contexte
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['grossesseId']) {
        this.setupGrossesseContext(params['grossesseId']);
      } else if (params['accouchementId']) {
        this.setupAccouchementContext(params['accouchementId']);
      } else if (params['naissanceId']) {
        this.setupNaissanceContext(params['naissanceId']);
      } else {
        this.setupGeneralContext();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configure le contexte pour les complications de grossesse
   */
  private setupGrossesseContext(grossesseId: string): void {
    // Charger la grossesse et ses complications
    this.store.dispatch(GrossessesActions.loadGrossesse({ id: grossesseId }));
    this.store.dispatch(ComplicationsActions.loadComplicationsByGrossesse({ grossesseId }));

    this.complications$ = this.store.select(selectComplicationsByGrossesse);
    
    this.contextData$ = this.store.select(selectSelectedGrossesse).pipe(
      map((grossesse: GrossesseResponse | null) => grossesse ? {
        type: 'grossesse' as const,
        grossesse
      } : null)
    );

    this.title$ = this.store.select(selectSelectedGrossesse).pipe(
      map((grossesse: GrossesseResponse | null) => 
        grossesse ? `Complications - Grossesse ${grossesse.patiente?.nom || ''}` : 'Complications de Grossesse'
      )
    );
  }

  /**
   * Configure le contexte pour les complications d'accouchement
   */
  private setupAccouchementContext(accouchementId: string): void {
    // Charger l'accouchement et ses complications
    this.store.dispatch(AccouchementsActions.loadAccouchement({ id: accouchementId }));
    this.store.dispatch(ComplicationsActions.loadComplicationsByAccouchement({ accouchementId }));

    this.complications$ = this.store.select(selectComplicationsByAccouchement);
    
    this.contextData$ = this.store.select(selectSelectedAccouchement).pipe(
      map((accouchement: AccouchementResponse | null) => accouchement ? {
        type: 'accouchement' as const,
        accouchement
      } : null)
    );

    this.title$ = this.store.select(selectSelectedAccouchement).pipe(
      map((accouchement: AccouchementResponse | null) => 
        accouchement ? `Complications - Accouchement ${accouchement.id}` : 'Complications d\'Accouchement'
      )
    );
  }

  /**
   * Configure le contexte pour les complications de naissance
   */
  private setupNaissanceContext(naissanceId: string): void {
    // Charger la naissance et ses complications
    this.store.dispatch(NaissancesActions.loadNaissance({ id: naissanceId }));
    this.store.dispatch(ComplicationsActions.loadComplicationsByNaissance({ naissanceId }));

    this.complications$ = this.store.select(selectComplicationsByNaissance);
    
    this.contextData$ = this.store.select(selectSelectedNaissance).pipe(
      map((naissance: NaissanceResponse | null) => naissance ? {
        type: 'naissance' as const,
        naissance
      } : null)
    );

    this.title$ = this.store.select(selectSelectedNaissance).pipe(
      map((naissance: NaissanceResponse | null) => 
        naissance ? `Complications - Naissance ${naissance.id}` : 'Complications de Naissance'
      )
    );
  }

  /**
   * Configure le contexte général (toutes les complications)
   */
  private setupGeneralContext(): void {
    // Pour le contexte général, on pourrait charger toutes les complications
    // Mais comme le service n'a plus cette méthode, on garde une liste vide
    this.complications$ = new Observable(observer => observer.next([]));
    this.contextData$ = new Observable(observer => observer.next(null));
    this.title$ = new Observable(observer => observer.next('Gestion des Complications'));
  }

  /**
   * Callback quand une complication est ajoutée
   */
  onComplicationAdded(complication: ComplicationResponse): void {
    // La complication sera automatiquement ajoutée au store via les effects
    console.log('Complication ajoutée:', complication);
  }

  /**
   * Callback quand une complication est mise à jour
   */
  onComplicationUpdated(complication: ComplicationResponse): void {
    // La complication sera automatiquement mise à jour dans le store via les effects
    console.log('Complication mise à jour:', complication);
  }

  /**
   * Callback quand une complication est supprimée
   */
  onComplicationDeleted(complicationId: string): void {
    // La complication sera automatiquement supprimée du store via les effects
    console.log('Complication supprimée:', complicationId);
  }
} 