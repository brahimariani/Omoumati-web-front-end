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
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, tap, Subscription, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { UtilisateurResponse } from '../../../../core/models/utilisateur/utilisateur.response.model';
import { StatutUtilisateur } from '../../../../core/models/utilisateur/statututilisateur.model';
import { UtilisateursActions } from '../../../../store/utilisateurs/utilisateurs.actions';
import { 
  selectAllUtilisateurs, 
  selectUtilisateursLoading, 
  selectUtilisateursPagination, 
  selectUtilisateursError 
} from '../../../../store/utilisateurs/utilisateurs.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { UtilisateurFormComponent } from '../utilisateur-form/utilisateur-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-utilisateur-list',
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
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './utilisateur-list.component.html',
  styleUrls: ['./utilisateur-list.component.css']
})
export class UtilisateurListComponent implements OnInit, OnDestroy {
  utilisateurs$: Observable<UtilisateurResponse[]>;
  loading$: Observable<boolean>;
  pagination$: Observable<any>;
  error$: Observable<string | null>;
  dataSource = new MatTableDataSource<UtilisateurResponse>([]);
  private subscription = new Subscription();
  errorOccurred = false;
  errorMessage = '';
  selectedStatus: StatutUtilisateur | null = null;
  searchControl = new FormControl('');
  searchTerm = '';
  
  displayedColumns: string[] = ['utilisateur', 'centre', 'role', 'statut', 'actions'];
  
  // Statuts utilisateur pour le filtre
  statutLabels: { [key in StatutUtilisateur]: string } = {
    [StatutUtilisateur.ACTIF]: 'Actif',
    [StatutUtilisateur.INACTIF]: 'Inactif',
    [StatutUtilisateur.SUSPENDU]: 'Suspendu',
    [StatutUtilisateur.SUPPRIME]: 'Supprimé'
  };

  statutTypes = Object.values(StatutUtilisateur);
  
  constructor(
    private store: Store, 
    private router: Router,
    private sidePanelService: SidePanelService,
    private dialog: MatDialog
  ) {
    this.utilisateurs$ = this.store.select(selectAllUtilisateurs).pipe(
      tap(utilisateurs => {
        console.log('Utilisateurs reçus:', utilisateurs);
        if (Array.isArray(utilisateurs) && utilisateurs.length > 0) {
          console.log('Premier utilisateur:', utilisateurs[0]);
          this.dataSource.data = utilisateurs;
        }
      }),
      catchError(err => {
        this.errorOccurred = true;
        this.errorMessage = err.message || 'Erreur lors du chargement des utilisateurs';
        return of([]);
      })
    );
    
    this.loading$ = this.store.select(selectUtilisateursLoading);
    this.pagination$ = this.store.select(selectUtilisateursPagination);
    this.error$ = this.store.select(selectUtilisateursError);
  }
  
  ngOnInit(): void {
    this.loadUtilisateurs();
    this.setupSearch();
    
    // S'abonner au flux d'utilisateurs pour mettre à jour la source de données
    this.subscription.add(
      this.utilisateurs$.subscribe(utilisateurs => {
        if (utilisateurs) {
          this.dataSource.data = utilisateurs;
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

  setupSearch(): void {
    this.subscription.add(
      this.searchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.store.dispatch(UtilisateursActions.searchUtilisateurs({ 
            searchTerm: searchTerm.trim(),
            page: 0,
            size: 10
          }));
        } else {
          this.loadUtilisateurs();
        }
      })
    );
  }
  
  loadUtilisateurs(page: number = 0, size: number = 10): void {
    this.errorOccurred = false;
    this.store.dispatch(UtilisateursActions.loadUtilisateurs({ page, size }));
  }
  
  onPageChange(event: PageEvent): void {
    this.loadUtilisateurs(event.pageIndex, event.pageSize);
  }
  
  onSortChange(sort: Sort): void {
    const direction = sort.direction || 'asc';
    this.store.dispatch(UtilisateursActions.loadUtilisateurs({ 
      page: 0, 
      size: 10, 
      sort: sort.active,
      direction: direction as 'asc' | 'desc'
    }));
  }
  

  
  retryLoading(): void {
    this.loadUtilisateurs();
  }
  
  viewUtilisateur(id: string): void {
    this.router.navigate(['/administration/utilisateurs', id]);
  }
  
  /**
   * Ouvrir le formulaire d'ajout d'utilisateur dans le side panel
   */
  addUtilisateur(): void {
    this.sidePanelService.open({
      title: 'Nouvel utilisateur',
      component: UtilisateurFormComponent,
      width: '800px',
      data: {
        isEdit: false
      }
    });
  }
  
  /**
   * Ouvrir le formulaire d'édition d'utilisateur dans le side panel
   */
  editUtilisateur(utilisateur: UtilisateurResponse): void {
    this.sidePanelService.open({
      title: 'Modifier l\'utilisateur',
      component: UtilisateurFormComponent,
      width: '800px',
      data: {
        utilisateur: utilisateur,
        isEdit: true
      }
    });
  }
  
  /**
   * Confirmer et supprimer un utilisateur
   */
  deleteUtilisateur(utilisateur: UtilisateurResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${utilisateur.nom} ${utilisateur.prenom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(UtilisateursActions.deleteUtilisateur({ id: utilisateur.id }));
      }
    });
  }

  /**
   * Activer un utilisateur
   */
  activateUtilisateur(utilisateur: UtilisateurResponse): void {
    this.store.dispatch(UtilisateursActions.activateUser({ 
      userId: utilisateur.id
    }));
  }

  /**
   * Suspendre un utilisateur
   */
  suspendUtilisateur(utilisateur: UtilisateurResponse): void {
    this.store.dispatch(UtilisateursActions.suspendUser({ 
      userId: utilisateur.id
    }));
  }

  /**
   * Désactiver un utilisateur
   */
  deactivateUtilisateur(utilisateur: UtilisateurResponse): void {
    this.store.dispatch(UtilisateursActions.deactivateUser({ 
      userId: utilisateur.id
    }));
  }
  
  getStatutLabel(statut: StatutUtilisateur): string {
    return this.statutLabels[statut] || statut;
  }
  
  getStatutChipColor(statut: StatutUtilisateur): string {
    const colors: { [key in StatutUtilisateur]: string } = {
      [StatutUtilisateur.ACTIF]: 'primary',
      [StatutUtilisateur.INACTIF]: 'warn',
      [StatutUtilisateur.SUSPENDU]: 'accent',
      [StatutUtilisateur.SUPPRIME]: 'warn'
    };
    return colors[statut] || 'primary';
  }

  /**
   * Obtenir l'icône selon le statut
   */
  getStatutIcon(statut: StatutUtilisateur): string {
    const icons: { [key in StatutUtilisateur]: string } = {
      [StatutUtilisateur.ACTIF]: 'check_circle',
      [StatutUtilisateur.INACTIF]: 'block',
      [StatutUtilisateur.SUSPENDU]: 'pause_circle',
      [StatutUtilisateur.SUPPRIME]: 'delete'
    };
    return icons[statut] || 'help';
  }

  /**
   * Formater le nom complet
   */
  getFullName(utilisateur: UtilisateurResponse): string {
    return `${utilisateur.prenom} ${utilisateur.nom}`;
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(statut: StatutUtilisateur): string {
    const colors: { [key in StatutUtilisateur]: string } = {
      [StatutUtilisateur.ACTIF]: 'success',
      [StatutUtilisateur.INACTIF]: 'error',
      [StatutUtilisateur.SUSPENDU]: 'warning',
      [StatutUtilisateur.SUPPRIME]: 'error'
    };
    return colors[statut] || 'primary';
  }

  /**
   * Créer un nouvel utilisateur (alias pour addUtilisateur)
   */
  createUser(): void {
    this.addUtilisateur();
  }

  /**
   * Recherche avec la nouvelle méthode
   */
  onSearch(): void {
    if (this.searchTerm && this.searchTerm.trim()) {
      this.store.dispatch(UtilisateursActions.searchUtilisateurs({ 
        searchTerm: this.searchTerm.trim(),
        page: 0,
        size: 10
      }));
    } else {
      this.loadUtilisateurs();
    }
  }

  /**
   * Filtre par statut sans paramètre (utilise selectedStatus)
   */
  onStatusFilterChange(): void {
    if (this.selectedStatus) {
      this.store.dispatch(UtilisateursActions.filterByStatus({ 
        statut: this.selectedStatus, 
        page: 0, 
        size: 10 
      }));
    } else {
      this.loadUtilisateurs();
    }
  }

  /**
   * Obtenir les initiales d'un utilisateur
   */
  getInitials(nom: string, prenom: string): string {
    const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
    const lastInitial = nom ? nom.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  /**
   * Obtenir la classe CSS pour le statut
   */
  getStatusClass(statut: StatutUtilisateur): string {
    const classes: { [key in StatutUtilisateur]: string } = {
      [StatutUtilisateur.ACTIF]: 'actif',
      [StatutUtilisateur.INACTIF]: 'inactif',
      [StatutUtilisateur.SUSPENDU]: 'suspendu',
      [StatutUtilisateur.SUPPRIME]: 'inactif'
    };
    return classes[statut] || 'inactif';
  }

  /**
   * Obtenir le label du statut (alias pour getStatutLabel)
   */
  getStatusLabel(statut: StatutUtilisateur): string {
    return this.getStatutLabel(statut);
  }

  /**
   * Voir un utilisateur (alias pour viewUtilisateur)
   */
  viewUser(id: string): void {
    this.viewUtilisateur(id);
  }

  /**
   * Modifier un utilisateur
   */
  editUser(user: UtilisateurResponse): void {
    this.editUtilisateur(user);
  }

  /**
   * Changer le statut d'un utilisateur
   */
  changeStatus(user: UtilisateurResponse, newStatus: string): void {
    switch (newStatus) {
      case 'ACTIF':
        this.activateUtilisateur(user);
        break;
      case 'SUSPENDU':
        this.suspendUtilisateur(user);
        break;
      case 'INACTIF':
        this.deactivateUtilisateur(user);
        break;
    }
  }

  /**
   * Supprimer un utilisateur (alias pour deleteUtilisateur)
   */
  deleteUser(user: UtilisateurResponse): void {
    this.deleteUtilisateur(user);
  }
} 