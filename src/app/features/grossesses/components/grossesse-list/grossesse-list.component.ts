import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { GrossessesActions } from '../../../../store/grossesses';
import * as GrossessesSelectors from '../../../../store/grossesses/grossesses.selectors';
import { GrossesseResponse } from '../../../../core/models/grossesse/grossesse-response.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { GrossesseFormComponent } from '../grossesse-form/grossesse-form.component';

@Component({
  selector: 'app-grossesse-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatButtonToggleModule
  ],
  templateUrl: './grossesse-list.component.html',
  styleUrl: './grossesse-list.component.css'
})
export class GrossesseListComponent implements OnInit, OnDestroy {
  grossesses$: Observable<GrossesseResponse[]>;
  filteredGrossesses$: Observable<GrossesseResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  pagination$: Observable<any>;

  displayedColumns: string[] = [
    'patiente',
    'gestation',
    'parite',
    'dateDerniereRegle',
    'datePrevueAccouchment',
    'ageGestationnel',
    'statut',
    'accouchement',
    'actions'
  ];

  // Filtre de statut avec BehaviorSubject
  private statusFilterSubject = new BehaviorSubject<'all' | 'completed' | 'ongoing'>('ongoing');
  statusFilter$ = this.statusFilterSubject.asObservable();

  private destroy$ = new Subject<void>();
  private currentPageSize = 10; // Stocker la taille de page actuelle

  constructor(
    private store: Store,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private sidePanelService: SidePanelService
  ) {
    this.grossesses$ = this.store.select(GrossessesSelectors.selectAllGrossesses);
    this.loading$ = this.store.select(GrossessesSelectors.selectGrossessesLoading);
    this.error$ = this.store.select(GrossessesSelectors.selectGrossessesError);
    this.pagination$ = this.store.select(GrossessesSelectors.selectGrossessesPagination);
    
    // Initialiser le flux filtré
    this.filteredGrossesses$ = combineLatest([
      this.grossesses$,
      this.statusFilter$
    ]).pipe(
      map(([grossesses, filter]) => this.filterGrossessesByStatus(grossesses, filter))
    );
  }

  ngOnInit(): void {
    // S'abonner aux changements de pagination pour maintenir la taille de page
    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination?.pageSize) {
        this.currentPageSize = pagination.pageSize;
      }
    });

    // Vérifier s'il y a un paramètre de requête pour filtrer par patiente
    this.activatedRoute.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['patientId']) {
        // Charger les grossesses de cette patiente spécifique
        this.store.dispatch(GrossessesActions.loadGrossessesByPatient({ patientId: params['patientId'] }));
      } else {
        // Charger toutes les grossesses normalement
        this.loadGrossesses();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGrossesses(page: number = 0, size: number = 10): void {
    this.store.dispatch(GrossessesActions.loadGrossesses({ page, size }));
  }

  onPageChange(event: PageEvent): void {
    this.currentPageSize = event.pageSize; // Mettre à jour la taille de page
    this.loadGrossesses(event.pageIndex, event.pageSize);
  }

  onNewGrossesse(): void {
    this.sidePanelService.open({
      title: 'Nouvelle grossesse',
      component: GrossesseFormComponent,
      data: {
        isEdit: false
      },
      width: '800px'
    });
  }

  onEditGrossesse(grossesse: GrossesseResponse): void {
    this.sidePanelService.open({
      title: 'Modifier la grossesse',
      component: GrossesseFormComponent,
      data: {
        grossesse: grossesse,
        isEdit: true
      },
      width: '800px'
    });
  }

  onViewDetails(grossesse: GrossesseResponse): void {
    this.router.navigate(['/grossesses', grossesse.id]);
  }

  onDeleteGrossesse(grossesse: GrossesseResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer cette grossesse ? Cette action supprimera également tous les accouchements et naissances associés et est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(GrossessesActions.deleteGrossesse({ id: grossesse.id }));
      }
    });
  }

  onNewAccouchement(grossesse: GrossesseResponse): void {
    this.router.navigate(['/grossesses', grossesse.id, 'accouchement']);
  }

  onNewNaissance(grossesse: GrossesseResponse): void {
    this.router.navigate(['/grossesses', grossesse.id, 'naissance']);
  }

  onViewPatientProfile(grossesse: GrossesseResponse): void {
    if (grossesse.patiente && grossesse.patiente.id) {
      this.router.navigate(['/patientes', grossesse.patiente.id]);
    }
  }

  calculateGestationalAge(dateDerniereRegle: Date | string, grossesse?: GrossesseResponse): number {
    if (!dateDerniereRegle) return 0;
    
    const ddr = typeof dateDerniereRegle === 'string' ? new Date(dateDerniereRegle) : dateDerniereRegle;
    
    // Si la grossesse a un accouchement, calculer avec la date d'accouchement
    let endDate: Date;
    if (grossesse && this.hasAccouchement(grossesse) && grossesse.accouchement.date) {
      endDate = typeof grossesse.accouchement.date === 'string' 
        ? new Date(grossesse.accouchement.date) 
        : grossesse.accouchement.date;
    } else {
      // Sinon, calculer avec la date d'aujourd'hui
      endDate = new Date();
    }
    
    const diffTime = Math.abs(endDate.getTime() - ddr.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7); // Semaines
  }

  getGrossesseStatus(grossesse: GrossesseResponse): { label: string; color: string } {
    const ageGestationnel = this.calculateGestationalAge(grossesse.dateDerniereRegle, grossesse);
    
    if (ageGestationnel < 12) {
      return { label: '1er Trimestre', color: 'primary' };
    } else if (ageGestationnel < 28) {
      return { label: '2ème Trimestre', color: 'accent' };
    } else if (ageGestationnel < 40) {
      return { label: '3ème Trimestre', color: 'warn' };
    } else {
      return { label: 'Terme dépassé', color: 'warn' };
    }
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

  getPatienteName(grossesse: GrossesseResponse): string {
    if (grossesse.patiente) {
      return `${grossesse.patiente.prenom} ${grossesse.patiente.nom}`.toUpperCase();
    }
    return `Patiente inconnue`;
  }

  // Méthodes pour gérer l'affichage de l'accouchement
  hasAccouchement(grossesse: GrossesseResponse): boolean {
    return grossesse.accouchement !== null && grossesse.accouchement !== undefined;
  }

  getAccouchementStatus(grossesse: GrossesseResponse): { label: string; color: string; icon: string } {
    if (!this.hasAccouchement(grossesse)) {
      const ageGestationnel = this.calculateGestationalAge(grossesse.dateDerniereRegle, grossesse);
      
      if (ageGestationnel >= 37) {
        return { 
          label: 'En attente', 
          color: 'warn',
          icon: 'schedule'
        };
      } else {
        return { 
          label: 'En cours', 
          color: 'primary',
          icon: 'pregnant_woman'
        };
      }
    } else {
      return { 
        label: 'Terminé', 
        color: 'accent',
        icon: 'check_circle'
      };
    }
  }

  getAccouchementDate(grossesse: GrossesseResponse): string {
    if (this.hasAccouchement(grossesse) && grossesse.accouchement.date) {
      return this.formatDate(grossesse.accouchement.date);
    }
    return '-';
  }

  onViewAccouchement(grossesse: GrossesseResponse): void {
    if (this.hasAccouchement(grossesse)) {
      this.router.navigate(['/accouchements', grossesse.accouchement.id]);
    }
  }

  filterGrossessesByStatus(grossesses: GrossesseResponse[], status: 'all' | 'completed' | 'ongoing'): GrossesseResponse[] {
    if (status === 'all') {
      return grossesses;
    } else if (status === 'completed') {
      return grossesses.filter(g => this.hasAccouchement(g));
    } else if (status === 'ongoing') {
      return grossesses.filter(g => !this.hasAccouchement(g));
    }
    return grossesses;
  }

  onStatusFilterChange(status: 'all' | 'completed' | 'ongoing'): void {
    this.statusFilterSubject.next(status);
    // Pas besoin de recharger les grossesses, le filtre se fait côté client
  }

  get currentStatusFilter(): 'all' | 'completed' | 'ongoing' {
    return this.statusFilterSubject.value;
  }
} 