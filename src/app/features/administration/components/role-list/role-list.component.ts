import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { RoleResponse } from '../../../../core/models/role/role.response.model';
import { AppState } from '../../../../store';
import { 
  RolesActions,
  selectAllRoles,
  selectRolesLoading,
  selectRolesError,
  selectRolesPagination,
  selectRolesTotalElements
} from '../../../../store/roles';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { RoleFormComponent } from '../role-form/role-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Propriétés pour la table
  dataSource = new MatTableDataSource<RoleResponse>([]);
  displayedColumns: string[] = ['nom', 'description', 'actions'];
  
  // Propriétés pour la recherche et pagination
  searchTerm = '';
  pageSize = 10;
  pageIndex = 0;
  sortField = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Observables du store
  roles$: Observable<RoleResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  pagination$: Observable<any>;
  totalElements$: Observable<number>;
  
  // Subject pour la recherche avec debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private sidePanelService: SidePanelService,
    private dialog: MatDialog
  ) {
    this.roles$ = this.store.select(selectAllRoles);
    this.loading$ = this.store.select(selectRolesLoading);
    this.error$ = this.store.select(selectRolesError);
    this.pagination$ = this.store.select(selectRolesPagination);
    this.totalElements$ = this.store.select(selectRolesTotalElements);
  }

  ngOnInit(): void {
    this.loadRoles();
    this.setupDataSource();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataSource(): void {
    // Écouter les changements des rôles et mettre à jour la dataSource
    this.roles$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(roles => {
      if (roles) {
        this.dataSource.data = roles;
      }
    });

    // Écouter les changements de pagination pour mettre à jour le paginator
    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination && this.paginator) {
        this.pageIndex = pagination.currentPage;
        this.pageSize = pagination.pageSize;
        // Ne pas déclencher l'événement de changement de page
        this.paginator.pageIndex = pagination.currentPage;
        this.paginator.pageSize = pagination.pageSize;
      }
    });

    // Configuration après ViewInit
    setTimeout(() => {
      // Désactiver la pagination et le tri côté client
      this.dataSource.paginator = null;
      this.dataSource.sort = null;
    });
  }

  private setupSearch(): void {
    // Configuration de la recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0; // Reset à la première page lors de la recherche
      this.loadRoles();
    });
  }

  loadRoles(): void {
    if (this.searchTerm.trim()) {
      // Utiliser la recherche si un terme est présent
      this.store.dispatch(RolesActions.searchRoles({ 
        searchTerm: this.searchTerm,
        page: this.pageIndex,
        size: this.pageSize
      }));
    } else {
      // Charger normalement avec pagination
      this.store.dispatch(RolesActions.loadRoles({ 
        page: this.pageIndex,
        size: this.pageSize,
        sort: this.sortField,
        direction: this.sortDirection
      }));
    }
  }

  refreshRoles(): void {
    this.loadRoles();
    this.snackBar.open('Liste des rôles actualisée', 'Fermer', { duration: 2000 });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadRoles();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active || 'nom';
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'asc';
    this.pageIndex = 0; // Reset à la première page lors du tri
    this.loadRoles();
  }

  /**
   * Ouvrir le formulaire d'ajout de rôle dans le side panel
   */
  addRole(): void {
    this.sidePanelService.open({
      title: 'Nouveau rôle',
      component: RoleFormComponent,
      width: '600px',
      data: {
        isEdit: false
      }
    });
  }

  /**
   * Ouvrir le formulaire d'édition de rôle dans le side panel
   */
  editRole(roleId: string): void {
    // Récupérer le rôle complet
    const role = this.dataSource.data.find(r => r.id === roleId);
    if (role) {
      this.sidePanelService.open({
        title: 'Modifier le rôle',
        component: RoleFormComponent,
        width: '600px',
        data: {
          role: role,
          isEdit: true
        }
      });
    }
  }

  viewRole(roleId: string): void {
    // Navigation vers les détails du rôle (garde la navigation classique)
    window.location.href = `/administration/roles/${roleId}`;
  }

  duplicateRole(role: RoleResponse): void {
    // Ouvrir le formulaire avec les données pré-remplies
    this.sidePanelService.open({
      title: 'Dupliquer le rôle',
      component: RoleFormComponent,
      width: '600px',
      data: {
        role: { ...role, nom: `${role.nom} (Copie)` },
        isEdit: false
      }
    });
  }

  viewUsers(role: RoleResponse): void {
    // Navigation vers la liste des utilisateurs avec ce rôle
    console.log('Voir les utilisateurs du rôle:', role);
    this.snackBar.open(`${role.utilisateurs?.length || 0} utilisateur(s) avec le rôle ${role.nom}`, 'Fermer', { 
      duration: 3000 
    });
  }

  deleteRole(role: RoleResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer le rôle',
        message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(RolesActions.deleteRole({ id: role.id }));
      }
    });
  }
} 