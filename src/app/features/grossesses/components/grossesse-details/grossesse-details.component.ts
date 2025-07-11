import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, take, filter } from 'rxjs/operators';

import { GrossessesActions } from '../../../../store/grossesses';
import * as GrossessesSelectors from '../../../../store/grossesses/grossesses.selectors';
import { ComplicationsActions, selectComplicationsByGrossesse } from '../../../../store/complications';
import { ConsultationsActions } from '../../../../store/consultations/consultations.actions';
import { GrossesseResponse } from '../../../../core/models/grossesse/grossesse-response.model';
import { ComplicationResponse } from '../../../../core/models/complication/complication-response.model';
import { ConsultationResponse } from '../../../../core/models/consultation/consultation-response.model';
import { ComplicationListComponent } from '../../../complications/components/complication-list/complication-list.component';
import { ComplicationContextData } from '../../../complications/components/complication-form/complication-form.component';
import { ConsultationListComponent } from '../../../consultations/consultation-list/consultation-list.component';

// Interfaces pour les données
interface Consultation {
  id: string;
  dateConsultation: Date | string;
  poids: number;
  tensionArterielle: string;
  hauteurUterine: number;
}

interface Alert {
  severity: 'info' | 'warning' | 'error';
  icon: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-grossesse-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ComplicationListComponent,
    ConsultationListComponent
  ],
  templateUrl: './grossesse-details.component.html',
  styleUrl: './grossesse-details.component.css'
})
export class GrossesseDetailsComponent implements OnInit, OnDestroy {
  grossesse$: Observable<GrossesseResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  consultations$: Observable<Consultation[]>;
  complications$: Observable<ComplicationResponse[]>;
  complicationContextData$: Observable<ComplicationContextData | null>;

  private destroy$ = new Subject<void>();
  private grossesseId: string | null = null;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.grossesse$ = this.store.select(GrossessesSelectors.selectSelectedGrossesse);
    this.loading$ = this.store.select(GrossessesSelectors.selectGrossessesLoading);
    this.error$ = this.store.select(GrossessesSelectors.selectGrossessesError);
    
    // Sélecteurs pour les complications
    this.complications$ = this.store.select(selectComplicationsByGrossesse);
    
    // Contexte pour les complications
    this.complicationContextData$ = this.grossesse$.pipe(
      map((grossesse: GrossesseResponse | null) => grossesse ? {
        type: 'grossesse' as const,
        grossesse
      } : null)
    );
    
    // TODO: Remplacer par les vrais sélecteurs quand ils seront disponibles
    this.consultations$ = new Observable<Consultation[]>(observer => observer.next([]));
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.grossesseId = params['id'];
      if (this.grossesseId) {
        this.store.dispatch(GrossessesActions.loadGrossesse({ id: this.grossesseId }));
        this.loadConsultations();
        this.loadComplications();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthodes de navigation
  onBack(): void {
    this.router.navigate(['/grossesses']);
  }

  onEditGrossesse(): void {
    if (this.grossesseId) {
      this.router.navigate(['/grossesses', this.grossesseId, 'edit']);
    }
  }

  onRetry(): void {
    if (this.grossesseId) {
      this.store.dispatch(GrossessesActions.loadGrossesse({ id: this.grossesseId }));
    }
  }

  // Méthodes pour les consultations
  onNewConsultation(): void {
    if (this.grossesseId) {
      this.router.navigate(['/consultations/new'], { 
        queryParams: { grossesseId: this.grossesseId } 
      });
    }
  }

  onViewConsultation(consultationId: string): void {
    this.router.navigate(['/consultations', consultationId]);
  }

  onEditConsultation(consultationId: string): void {
    this.router.navigate(['/consultations', consultationId, 'edit']);
  }

  // Méthodes pour l'accouchement
  onDeclareAccouchement(): void {
    if (this.grossesseId) {
      this.router.navigate(['/grossesses', this.grossesseId, 'accouchement']);
    }
  }

  onViewAccouchement(): void {
    this.grossesse$.pipe(
      take(1),
      filter(grossesse => grossesse !== null),
      map(grossesse => grossesse!.accouchement)
    ).subscribe(accouchement => {
      if (accouchement) {
        this.router.navigate(['/accouchements', accouchement.id]);
      }
    });
  }

  onDeclareNaissance(): void {
    if (this.grossesseId) {
      this.router.navigate(['/grossesses', this.grossesseId, 'naissance']);
    }
  }

  // Méthodes pour les complications
  onComplicationAdded(complication: ComplicationResponse): void {
    console.log('Complication ajoutée:', complication);
    // La complication sera automatiquement ajoutée au store via les effects
  }

  onComplicationUpdated(complication: ComplicationResponse): void {
    console.log('Complication mise à jour:', complication);
    // La complication sera automatiquement mise à jour dans le store via les effects
  }

  onComplicationDeleted(complicationId: string): void {
    console.log('Complication supprimée:', complicationId);
    // La complication sera automatiquement supprimée du store via les effects
  }

  // Méthodes obsolètes - garder pour compatibilité si utilisées dans le template
  onAddComplication(): void {
    // Cette méthode n'est plus nécessaire car le bouton est géré dans ComplicationListComponent
    console.log('Utiliser le bouton dans le composant de complications');
  }

  onEditComplication(complicationId: string): void {
    // Cette méthode n'est plus nécessaire car l'édition est gérée dans ComplicationListComponent
    console.log('Utiliser le menu dans le composant de complications');
  }

  onDeleteComplication(complicationId: string): void {
    // Cette méthode n'est plus nécessaire car la suppression est gérée dans ComplicationListComponent
    console.log('Utiliser le menu dans le composant de complications');
  }

  // Méthodes utilitaires
  getPatienteName(grossesse: GrossesseResponse): string {
    if (grossesse.patiente) {
      return `${grossesse.patiente.prenom} ${grossesse.patiente.nom}`;
    }
    return 'Patiente inconnue';
  }

  calculateGestationalAge(dateDerniereRegle: Date | string): number {
    if (!dateDerniereRegle) return 0;
    
    const today = new Date();
    const ddr = typeof dateDerniereRegle === 'string' ? new Date(dateDerniereRegle) : dateDerniereRegle;
    const diffTime = Math.abs(today.getTime() - ddr.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7); // Semaines
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  hasAccouchement(grossesse: GrossesseResponse): boolean {
    return !!(grossesse.accouchement);
  }

  hasNaissance(grossesse: GrossesseResponse): boolean {
    // TODO: Vérifier s'il y a une naissance associée - pour l'instant retourner false
    return false;
  }

  canDeclareAccouchement(grossesse: GrossesseResponse): boolean {
    const ageGestationnel = this.calculateGestationalAge(grossesse.dateDerniereRegle);
    return ageGestationnel >= 28; // Peut déclarer à partir de 28 SA
  }

  getComplicationSeverity(gravite: string): string {
    switch (gravite) {
      case 'FAIBLE': return 'primary';
      case 'MODEREE': return 'accent';
      case 'ELEVEE': return 'warn';
      default: return 'primary';
    }
  }

  getAutomaticAlerts(): Alert[] {
    // TODO: Implémenter la logique des alertes automatiques basées sur les données
    const alerts: Alert[] = [];
    
    // Exemple d'alertes basées sur l'âge gestationnel
    this.grossesse$.pipe(takeUntil(this.destroy$)).subscribe(grossesse => {
      if (grossesse) {
        const ageGestationnel = this.calculateGestationalAge(grossesse.dateDerniereRegle);
        
        if (ageGestationnel > 42) {
          alerts.push({
            severity: 'error',
            icon: 'warning',
            title: 'Terme dépassé',
            message: 'La grossesse a dépassé le terme prévu. Surveillance renforcée recommandée.'
          });
        } else if (ageGestationnel > 40) {
          alerts.push({
            severity: 'warning',
            icon: 'schedule',
            title: 'Proche du terme',
            message: 'La date prévue d\'accouchement est proche ou dépassée.'
          });
        }
        
        if (ageGestationnel < 37 && ageGestationnel > 20) {
          alerts.push({
            severity: 'info',
            icon: 'info',
            title: 'Surveillance prématurité',
            message: 'Surveillance pour risque d\'accouchement prématuré.'
          });
        }
      }
    });
    
    return alerts;
  }

  private loadConsultations(): void {
    if (this.grossesseId) {
      this.store.dispatch(ConsultationsActions.loadConsultationsByGrossesse({ 
        grossesseId: this.grossesseId 
      }));
    }
  }

  private loadComplications(): void {
    // Charger les complications pour cette grossesse
    if (this.grossesseId) {
      this.store.dispatch(ComplicationsActions.loadComplicationsByGrossesse({ 
        grossesseId: this.grossesseId 
      }));
    }
  }

  // Méthodes pour les consultations
  onConsultationAdded(consultation: ConsultationResponse): void {
    console.log('Consultation ajoutée:', consultation);
    // Optionnel: rafraîchir les consultations
    this.loadConsultations();
  }

  onConsultationUpdated(consultation: ConsultationResponse): void {
    console.log('Consultation mise à jour:', consultation);
    // Optionnel: rafraîchir les consultations
    this.loadConsultations();
  }

  onConsultationDeleted(consultationId: string): void {
    console.log('Consultation supprimée:', consultationId);
    // Optionnel: rafraîchir les consultations
    this.loadConsultations();
  }
}


//TODO display datails of accouchement and naissance
