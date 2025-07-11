import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { RendezVousResponseDto } from '../../../../core/models/rendez-vous/rendez-vous-response.model';
import { StatutRendezVous } from '../../../../core/models/rendez-vous/statut.model';
import { RendezVousService } from '../../../../core/services/rendez-vous.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RendezVousFormComponent } from '../rendez-vous-form/rendez-vous-form.component';

import * as RendezVousActions from '../../../../store/rendez-vous/rendez-vous.actions';
import { 
  selectRendezVous, 
  selectRendezVousLoading, 
  selectRendezVousError,
  selectRendezVousTotalElements,
  selectRendezVousTotalPages,
  selectRendezVousCurrentPage,
  selectRendezVousPageSize
} from '../../../../store/rendez-vous/rendez-vous.selectors';

@Component({
  selector: 'app-rendez-vous-list',
  templateUrl: './rendez-vous-list.component.html',
  styleUrls: ['./rendez-vous-list.component.css']
})
export class RendezVousListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'date',
    'heure',
    'patiente',
    'motif',
    'centre',
    'statut',
    'actions'
  ];

  dataSource = new MatTableDataSource<RendezVousResponseDto>();
  
  // Observables du store
  rendezVous$ = this.store.select(selectRendezVous);
  loading$ = this.store.select(selectRendezVousLoading);
  error$ = this.store.select(selectRendezVousError);
  totalElements$ = this.store.select(selectRendezVousTotalElements);
  totalPages$ = this.store.select(selectRendezVousTotalPages);
  currentPage$ = this.store.select(selectRendezVousCurrentPage);
  pageSize$ = this.store.select(selectRendezVousPageSize);

  // Filtres
  searchTerm = '';
  selectedStatut: StatutRendezVous | '' = '';
  selectedDateFilter = '';

  // Options de filtre
  statutOptions = Object.values(StatutRendezVous);
  dateFilterOptions = [
    { value: '', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'tomorrow', label: 'Demain' },
    { value: 'thisWeek', label: 'Cette semaine' },
    { value: 'nextWeek', label: 'Semaine prochaine' },
    { value: 'thisMonth', label: 'Ce mois' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private rendezVousService: RendezVousService,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    this.loadRendezVous();
    this.setupDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataSource(): void {
    this.rendezVous$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(rendezVous => {
      this.dataSource.data = rendezVous;
    });
  }

  private loadRendezVous(): void {
    this.store.dispatch(RendezVousActions.loadRendezVous({
      page: 0,
      size: 10
    }));
  }

  onSearch(): void {
    this.store.dispatch(RendezVousActions.searchRendezVous({
      searchTerm: this.searchTerm,
      statut: this.selectedStatut || undefined,
      dateDebut: this.selectedDateFilter === 'today' ? new Date().toISOString() : undefined,
      dateFin: this.selectedDateFilter === 'tomorrow' ? new Date().toISOString() : undefined,
      page: 0,
      size: 10
    }));
  }

  onFilterChange(): void {
    this.onSearch();
  }

  onSortChange(sortEvent: any): void {
    this.store.dispatch(RendezVousActions.loadRendezVous({
      page: 0,
      size: 10,
      sort: sortEvent.active,
      direction: sortEvent.direction
    }));
  }

  onPageChange(pageEvent: any): void {
    this.store.dispatch(RendezVousActions.loadRendezVous({
      page: pageEvent.pageIndex,
      size: pageEvent.pageSize
    }));
  }

  createRendezVous(): void {
    this.sidePanelService.open({
      title: 'Nouveau rendez-vous',
      component: RendezVousFormComponent,
      width: '700px',
      data: {
        isEdit: false
      }
    });
  }

  viewRendezVous(rendezVous: RendezVousResponseDto): void {
    this.sidePanelService.open({
      title: 'Détails du rendez-vous',
      component: RendezVousFormComponent,
      width: '700px',
      data: {
        rendezVous: rendezVous,
        isEdit: false,
        viewOnly: true
      }
    });
  }

  editRendezVous(rendezVous: RendezVousResponseDto): void {
    this.sidePanelService.open({
      title: 'Modifier le rendez-vous',
      component: RendezVousFormComponent,
      width: '700px',
      data: {
        rendezVous: rendezVous,
        isEdit: true
      }
    });
  }

  confirmerRendezVous(rendezVous: RendezVousResponseDto): void {
    this.store.dispatch(RendezVousActions.confirmerRendezVous({
      id: rendezVous.id
    }));
  }

  annulerRendezVous(rendezVous: RendezVousResponseDto): void {
    this.store.dispatch(RendezVousActions.annulerRendezVous({
      id: rendezVous.id
    }));
  }

  reporterRendezVous(rendezVous: RendezVousResponseDto): void {
    this.store.dispatch(RendezVousActions.reporterRendezVous({
      id: rendezVous.id
    }));
  }

  deleteRendezVous(rendezVous: RendezVousResponseDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le rendez-vous',
        message: `Êtes-vous sûr de vouloir supprimer ce rendez-vous avec ${this.getPatienteNom(rendezVous)} ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(RendezVousActions.deleteRendezVous({
          id: rendezVous.id
        }));
      }
    });
  }

  changeStatut(rendezVous: RendezVousResponseDto, newStatut: StatutRendezVous): void {
    this.store.dispatch(RendezVousActions.changeStatutRendezVous({
      id: rendezVous.id,
      statut: newStatut
    }));
  }

  // Fonctions utilitaires
  formatDate(dateStr: string): string {
    if (!dateStr) return 'Date non définie';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return 'Heure non définie';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Heure invalide';
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Heure invalide';
    }
  }

  getPatienteNom(rendezVous: RendezVousResponseDto): string {
    return rendezVous.patiente ? 
      `${rendezVous.patiente.prenom} ${rendezVous.patiente.nom}` : 
      'Patiente non assignée';
  }

  getCentreNom(centre: any): string {
    return centre?.nom || 'Centre non assigné';
  }

  getStatutLabel(statut: StatutRendezVous): string {
    if (!statut) return 'Statut non défini';
    try {
      return this.rendezVousService.getStatutLabel(statut) || 'Statut inconnu';
    } catch (error) {
      return 'Statut inconnu';
    }
  }

  getStatutClass(statut: StatutRendezVous): string {
    if (!statut) return 'status-chip';
    try {
      return this.rendezVousService.getStatutClass(statut) || 'status-chip';
    } catch (error) {
      return 'status-chip';
    }
  }

  getStatutColor(statut: StatutRendezVous): string {
    if (!statut) return '#666';
    try {
      return this.rendezVousService.getStatutColor(statut) || '#666';
    } catch (error) {
      return '#666';
    }
  }

  isRendezVousToday(dateStr: string): boolean {
    if (!dateStr) return false;
    try {
      const rendezVousDate = new Date(dateStr);
      if (isNaN(rendezVousDate.getTime())) return false;
      const today = new Date();
      return rendezVousDate.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  }

  isRendezVousPassed(dateStr: string): boolean {
    if (!dateStr) return false;
    try {
      const rendezVousDate = new Date(dateStr);
      if (isNaN(rendezVousDate.getTime())) return false;
      const now = new Date();
      return rendezVousDate < now;
    } catch (error) {
      return false;
    }
  }

  canEdit(rendezVous: RendezVousResponseDto): boolean {
    if (!rendezVous || !rendezVous.date || !rendezVous.statut) return false;
    return !this.isRendezVousPassed(rendezVous.date) && 
           rendezVous.statut !== StatutRendezVous.REJECTED;
  }

  canConfirm(rendezVous: RendezVousResponseDto): boolean {
    if (!rendezVous || !rendezVous.date || !rendezVous.statut) return false;
    return !this.isRendezVousPassed(rendezVous.date) && 
           rendezVous.statut === StatutRendezVous.PENDING;
  }

  canCancel(rendezVous: RendezVousResponseDto): boolean {
    if (!rendezVous || !rendezVous.date || !rendezVous.statut) return false;
    return !this.isRendezVousPassed(rendezVous.date) && 
           (rendezVous.statut === StatutRendezVous.PENDING || 
            rendezVous.statut === StatutRendezVous.ACCEPTED);
  }

  canReport(rendezVous: RendezVousResponseDto): boolean {
    if (!rendezVous || !rendezVous.date || !rendezVous.statut) return false;
    return !this.isRendezVousPassed(rendezVous.date) && 
           (rendezVous.statut === StatutRendezVous.PENDING || 
            rendezVous.statut === StatutRendezVous.ACCEPTED);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.selectedDateFilter = '';
    this.loadRendezVous();
  }

  exportRendezVous(): void {
    // TODO: Implémenter l'export des rendez-vous
    console.log('Export des rendez-vous');
  }

  refreshData(): void {
    this.loadRendezVous();
  }

  // Actions rapides
  markAsUrgent(rendezVous: RendezVousResponseDto): void {
    // TODO: Implémenter le marquage comme urgent
    console.log('Marquer comme urgent:', rendezVous);
  }

  sendReminder(rendezVous: RendezVousResponseDto): void {
    // TODO: Implémenter l'envoi de rappel
    console.log('Envoyer rappel:', rendezVous);
  }

  viewPatientProfile(rendezVous: RendezVousResponseDto): void {
    if (rendezVous.patiente?.id) {
      this.router.navigate(['/patients', rendezVous.patiente.id]);
    }
  }
} 