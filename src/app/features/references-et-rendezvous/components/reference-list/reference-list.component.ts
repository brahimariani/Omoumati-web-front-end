import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ReferenceResponse } from '../../../../core/models/reference/reference-response.model';
import { StatutReference } from '../../../../core/models/reference/statut.model';
import { ReferenceService } from '../../../../core/services/reference.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ReferenceFormComponent } from '../reference-form/reference-form.component';

import * as ReferencesActions from '../../../../store/references/references.actions';
import { 
  selectReferences, 
  selectReferencesLoading, 
  selectReferencesError,
  selectReferencesTotalElements,
  selectReferencesTotalPages,
  selectReferencesCurrentPage,
  selectReferencesPageSize
} from '../../../../store/references/references.selectors';

@Component({
  selector: 'app-reference-list',
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.css']
})
export class ReferenceListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'date',
    'patiente',
    'motif',
    'centreOrigine',
    'centreDestination',
    'statut',
    'actions'
  ];

  dataSource = new MatTableDataSource<ReferenceResponse>();
  
  // Observables du store
  references$ = this.store.select(selectReferences);
  loading$ = this.store.select(selectReferencesLoading);
  error$ = this.store.select(selectReferencesError);
  totalElements$ = this.store.select(selectReferencesTotalElements);
  totalPages$ = this.store.select(selectReferencesTotalPages);
  currentPage$ = this.store.select(selectReferencesCurrentPage);
  pageSize$ = this.store.select(selectReferencesPageSize);

  // Filtres
  searchTerm = '';
  selectedStatut: StatutReference | '' = '';
  selectedCentreOrigine = '';
  selectedCentreDestination = '';

  // Options de filtre
  statutOptions = Object.values(StatutReference);
  centres: any[] = []; // À charger depuis le service des centres

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private referenceService: ReferenceService,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    this.loadReferences();
    this.setupDataSource();
    this.loadCentres();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataSource(): void {
    this.references$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(references => {
      this.dataSource.data = references;
    });
  }

  private loadReferences(): void {
    this.store.dispatch(ReferencesActions.loadReferences({}));
  }

  private loadCentres(): void {
    // TODO: Charger la liste des centres pour les filtres
    // this.centreService.getAllCentres().subscribe(centres => {
    //   this.centres = centres.content;
    // });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.store.dispatch(ReferencesActions.searchReferences({
        searchTerm: this.searchTerm,
        statut: this.selectedStatut || undefined,
        centreOrigine: this.selectedCentreOrigine || undefined,
        centreDestination: this.selectedCentreDestination || undefined
      }));
    } else {
      this.loadReferences();
    }
  }

  onFilterChange(): void {
    this.onSearch();
  }

  onPageChange(event: any): void {
    this.store.dispatch(ReferencesActions.loadReferences({
      page: event.pageIndex,
      size: event.pageSize
    }));
  }

  onSortChange(event: any): void {
    this.store.dispatch(ReferencesActions.loadReferences({
      sort: event.active,
      direction: event.direction
    }));
  }

  createReference(): void {
    this.sidePanelService.open({
      title: 'Nouvelle référence',
      component: ReferenceFormComponent,
      width: '700px',
      data: {
        isEdit: false
      }
    });
  }

  viewReference(reference: ReferenceResponse): void {
    this.sidePanelService.open({
      title: 'Détails de la référence',
      component: ReferenceFormComponent,
      width: '700px',
      data: {
        reference: reference,
        isEdit: false,
        viewOnly: true // Pour mode consultation uniquement
      }
    });
  }

  editReference(reference: ReferenceResponse): void {
    this.sidePanelService.open({
      title: 'Modifier la référence',
      component: ReferenceFormComponent,
      width: '700px',
      data: {
        reference: reference,
        isEdit: true
      }
    });
  }

  changeStatut(reference: ReferenceResponse, newStatut: StatutReference): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Changer le statut',
        message: `Êtes-vous sûr de vouloir changer le statut de cette référence vers "${this.getStatutLabel(newStatut)}" ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(ReferencesActions.changeStatutReference({
          id: reference.id,
          statut: newStatut
        }));
      }
    });
  }

  deleteReference(reference: ReferenceResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer la référence',
        message: `Êtes-vous sûr de vouloir supprimer cette référence ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(ReferencesActions.deleteReference({
          id: reference.id
        }));
      }
    });
  }

  getStatutLabel(statut: StatutReference): string {
    return this.referenceService.getStatutLabel(statut);
  }

  getStatutClass(statut: StatutReference): string {
    return this.referenceService.getStatutClass(statut);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  }

  getPatienteNom(reference: ReferenceResponse): string {
    return `${reference.patiente.prenom} ${reference.patiente.nom}`;
  }

  getCentreNom(centre: any): string {
    return centre?.nom || 'N/A';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.selectedCentreOrigine = '';
    this.selectedCentreDestination = '';
    this.loadReferences();
  }

  exportReferences(): void {
    // TODO: Implémenter l'export des références
    console.log('Export des références');
  }

  refreshData(): void {
    this.loadReferences();
  }
} 