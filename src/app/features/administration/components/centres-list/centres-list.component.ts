import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable, tap, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CentreResponse } from '../../../../core/models/centre/centre.response.model';
import { TypeCentre } from '../../../../core/models/centre/typecentre.model';
import { CentresActions } from '../../../../store/centres/centres.actions';
import { 
  selectAllCentres, 
  selectCentresLoading, 
  selectCentresPagination, 
  selectCentresError,
  selectCentreTypes 
} from '../../../../store/centres/centres.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { CentreFormComponent } from '../centre-form/centre-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-centres-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './centres-list.component.html',
  styleUrls: ['./centres-list.component.css']
})
export class CentresListComponent implements OnInit, OnDestroy {
  centres$: Observable<CentreResponse[]>;
  loading$: Observable<boolean>;
  pagination$: Observable<any>;
  error$: Observable<string | null>;
  types$: Observable<TypeCentre[]>;
  dataSource = new MatTableDataSource<CentreResponse>([]);
  private subscription = new Subscription();
  errorOccurred = false;
  errorMessage = '';
  selectedType: TypeCentre | null = null;
  
  displayedColumns: string[] = ['nom', 'type', 'adresse', 'telephone', 'email', 'actions'];
  
  // Types de centres pour le filtre
  typeLabels: { [key in TypeCentre]: string } = {
    [TypeCentre.CS]: 'Centre de Santé',
    [TypeCentre.CSC]: 'Centre de Santé Communautaire',
    [TypeCentre.CSU]: 'Centre de Santé Urbain',
    [TypeCentre.CSCA]: 'Centre de Santé Communautaire Avancé',
    [TypeCentre.CSUA]: 'Centre de Santé Urbain Avancé'
  };
  
  constructor(
    private store: Store, 
    private router: Router,
    private sidePanelService: SidePanelService,
    private dialog: MatDialog
  ) {
    this.centres$ = this.store.select(selectAllCentres).pipe(
      tap(centres => {
        console.log('Centres reçus:', centres);
        if (Array.isArray(centres) && centres.length > 0) {
          console.log('Premier centre:', centres[0]);
          this.dataSource.data = centres;
        }
      }),
      catchError(err => {
        this.errorOccurred = true;
        this.errorMessage = err.message || 'Erreur lors du chargement des centres';
        return of([]);
      })
    );
    
    this.loading$ = this.store.select(selectCentresLoading);
    this.pagination$ = this.store.select(selectCentresPagination);
    this.error$ = this.store.select(selectCentresError);
    this.types$ = this.store.select(selectCentreTypes);
  }
  
  ngOnInit(): void {
    this.loadCentres();
    this.loadTypes();
    
    // S'abonner au flux de centres pour mettre à jour la source de données
    this.subscription.add(
      this.centres$.subscribe(centres => {
        if (centres) {
          this.dataSource.data = centres;
        }
      })
    );
    
    // S'abonner aux erreurs pour mettre à jour l'état d'erreur
    this.subscription.add(
      this.error$.subscribe(error => {
        this.errorOccurred = !!error;
        if (error) {
          this.errorMessage = error;
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  loadCentres(page: number = 0, size: number = 10): void {
    this.errorOccurred = false;
    this.store.dispatch(CentresActions.loadCentres({ page, size }));
  }
  
  loadTypes(): void {
    this.store.dispatch(CentresActions.loadTypes());
  }
  
  onPageChange(event: PageEvent): void {
    this.loadCentres(event.pageIndex, event.pageSize);
  }
  
  onSortChange(sort: Sort): void {
    const direction = sort.direction || 'asc';
    this.store.dispatch(CentresActions.loadCentres({ 
      page: 0, 
      size: 10, 
      sort: sort.active,
      direction: direction as 'asc' | 'desc'
    }));
  }
  
  onTypeFilterChange(type: TypeCentre | null): void {
    this.selectedType = type;
    if (type) {
      this.store.dispatch(CentresActions.filterByType({ 
        centreType: type, 
        page: 0, 
        size: 10 
      }));
    } else {
      this.loadCentres();
    }
  }
  
  retryLoading(): void {
    this.loadCentres();
  }
  
  viewCentre(id: string): void {
    this.router.navigate(['/administration/centres', id]);
  }
  
  /**
   * Ouvrir le formulaire d'ajout de centre dans le side panel
   */
  addCentre(): void {
    this.sidePanelService.open({
      title: 'Nouveau centre',
      component: CentreFormComponent,
      width: '800px',
      data: {
        isEdit: false
      }
    });
  }
  
  /**
   * Ouvrir le formulaire d'édition de centre dans le side panel
   */
  editCentre(centre: CentreResponse): void {
    this.sidePanelService.open({
      title: 'Modifier le centre',
      component: CentreFormComponent,
      width: '800px',
      data: {
        centre: centre,
        isEdit: true
      }
    });
  }
  
  deleteCentre(centre: CentreResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le centre "${centre.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(CentresActions.deleteCentre({ id: centre.id }));
      }
    });
  }
  
  /**
   * Obtenir le libellé du type de centre
   */
  getTypeLabel(type: TypeCentre): string {
    return this.typeLabels[type] || type;
  }
  
  
  
  /**
   * Obtenir la couleur du chip selon le type
   */
  getTypeChipColor(type: TypeCentre): string {
    const colors: { [key in TypeCentre]: string } = {
      [TypeCentre.CS]: 'primary',
      [TypeCentre.CSC]: 'accent',
      [TypeCentre.CSU]: 'warn',
      [TypeCentre.CSCA]: 'primary',
      [TypeCentre.CSUA]: 'accent'
    };
    return colors[type] || 'primary';
  }
} 