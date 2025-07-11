import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ConsultationsActions } from '../../../store/consultations/consultations.actions';
import * as ConsultationsSelectors from '../../../store/consultations/consultations.selectors';
import { ConsultationResponse } from '../../../core/models/consultation/consultation-response.model';
import { SidePanelService } from '../../../core/services/side-panel.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConsultationFormComponent } from '../consultation-form/consultation-form.component';
import { ConsultationDetailsComponent } from '../consultation-details/consultation-details.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './consultation-list.component.html',
  styleUrls: ['./consultation-list.component.css']
})
export class ConsultationListComponent implements OnInit, OnDestroy {
  @Input() grossesseId!: string;
  @Input() patienteName?: string;
  @Output() consultationAdded = new EventEmitter<ConsultationResponse>();
  @Output() consultationUpdated = new EventEmitter<ConsultationResponse>();
  @Output() consultationDeleted = new EventEmitter<string>();

  // Observables du store
  consultations$: Observable<ConsultationResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  pagination$: Observable<any>;

  // Configuration de la table
  displayedColumns: string[] = ['date', 'observation', 'actions'];
  
  // Contrôles de recherche et filtrage
  searchControl = new FormControl('');
  currentPage = 0;
  pageSize = 10;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sidePanelService: SidePanelService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // Initialisation des observables
    this.consultations$ = this.store.select(ConsultationsSelectors.selectAllConsultations);
    this.loading$ = this.store.select(ConsultationsSelectors.selectConsultationsLoading);
    this.error$ = this.store.select(ConsultationsSelectors.selectConsultationsError);
    this.pagination$ = this.store.select(ConsultationsSelectors.selectConsultationsPagination);
  }

  ngOnInit(): void {
    // Mettre à jour le sélecteur avec l'ID de grossesse
    if (this.grossesseId) {
      this.consultations$ = this.store.select(ConsultationsSelectors.selectConsultationsByGrossesseId(this.grossesseId));
    }
    
    this.loadConsultations();
    this.setupSearch();

    // Écouter les erreurs pour notifier l'utilisateur
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.notificationService.error(
          error,
          'Erreur lors de l\'opération'
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadConsultations(): void {
    if (this.grossesseId) {
      this.store.dispatch(ConsultationsActions.loadConsultationsByGrossesse({ 
        grossesseId: this.grossesseId,
        page: this.currentPage,
        size: this.pageSize
      }));
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.trim()) {
        this.store.dispatch(ConsultationsActions.searchConsultations({
          grossesseId: this.grossesseId,
          observation: searchTerm.trim(),
          page: 0,
          size: this.pageSize
        }));
      } else {
        this.loadConsultations();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadConsultations();
  }

  onSort(sort: Sort): void {
    this.store.dispatch(ConsultationsActions.loadConsultationsByGrossesse({ 
      grossesseId: this.grossesseId,
      page: this.currentPage,
      size: this.pageSize
    }));
  }

  onAddConsultation(): void {
    this.sidePanelService.open({
      title: 'Nouvelle Consultation',
      component: ConsultationFormComponent,
      width: '500px',
      data: {
        grossesseId: this.grossesseId,
        patienteName: this.patienteName,
        mode: 'create'
      }
    });
  }

  onEditConsultation(consultation: ConsultationResponse): void {
    this.sidePanelService.open({
      title: 'Modifier la Consultation',
      component: ConsultationFormComponent,
      width: '500px',
      data: {
        grossesseId: this.grossesseId,
        patienteName: this.patienteName,
        consultation: consultation,
        mode: 'edit'
      }
    });
  }

  onViewConsultation(consultation: ConsultationResponse): void {
    this.router.navigate(['/grossesses', this.grossesseId, 'consultations', consultation.id], {
      queryParams: { patienteName: this.patienteName }
    });
  }

  onDeleteConsultation(consultation: ConsultationResponse): void {
    const dialogData: ConfirmDialogData = {
      title: 'Supprimer la consultation',
      message: `Êtes-vous sûr de vouloir supprimer définitivement cette consultation du ${this.formatDate(consultation.date)} ?\n\nCette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(ConsultationsActions.deleteConsultation({ 
          id: consultation.id 
        }));
        this.consultationDeleted.emit(consultation.id);
        this.notificationService.success(
          `La consultation du ${this.formatDate(consultation.date)} a été supprimée avec succès.`,
          'Consultation supprimée'
        );
      }
    });
  }

  onRefresh(): void {
    this.store.dispatch(ConsultationsActions.refreshConsultationsForGrossesse({ 
      grossesseId: this.grossesseId 
    }));
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  // Méthodes utilitaires
  formatDate(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  formatDateTime(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  getObservationPreview(observation: string): string {
    if (!observation) return 'Aucune observation';
    return observation.length > 100 ? observation.substring(0, 100) + '...' : observation;
  }
} 