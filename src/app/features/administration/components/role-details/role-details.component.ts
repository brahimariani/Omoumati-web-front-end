import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RoleResponse } from '../../../../core/models/role/role.response.model';
import { UtilisateurResponse } from '../../../../core/models/utilisateur/utilisateur.response.model';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoleFormComponent } from '../role-form/role-form.component';
import { AppState } from '../../../../store';
import { 
  RolesActions,
  selectSelectedRole,
  selectRolesLoading,
  selectRolesError
} from '../../../../store/roles';

@Component({
  selector: 'app-role-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.css']
})
export class RoleDetailsComponent implements OnInit, OnDestroy {
  role$: Observable<RoleResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  // Propriétés pour les utilisateurs du rôle
  utilisateurs: UtilisateurResponse[] = [];
  utilisateursLoading = false;
  utilisateursError: string | null = null;
  totalUtilisateurs = 0;
  
  private roleId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private utilisateurService: UtilisateurService,
    private dialog: MatDialog,
    private sidePanelService: SidePanelService
  ) {
    this.loading$ = this.store.select(selectRolesLoading);
    this.error$ = this.store.select(selectRolesError);
    this.role$ = this.store.select(selectSelectedRole);
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.params['id'];
    
    // Charger le rôle spécifique
    this.store.dispatch(RolesActions.loadRole({ id: this.roleId }));
    
    // Charger les utilisateurs de ce rôle
    this.loadUtilisateurs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les utilisateurs du rôle
   */
  loadUtilisateurs(): void {
    this.utilisateursLoading = true;
    this.utilisateursError = null;
    
    this.utilisateurService.getUsersByRole(this.roleId, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.utilisateurs = response.content;
          this.totalUtilisateurs = response.totalElements;
          this.utilisateursLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.utilisateursError = 'Erreur lors du chargement des utilisateurs';
          this.utilisateursLoading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/administration/roles']);
  }

  editRole(role: RoleResponse): void {
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

  duplicateRole(role: RoleResponse): void {
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

  deleteRole(role: RoleResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le rôle',
        message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(RolesActions.deleteRole({ id: role.id }));
      }
    });
  }

  retryLoad(): void {
    this.store.dispatch(RolesActions.loadRole({ id: this.roleId }));
    this.loadUtilisateurs();
  }

  getActiveUsersCount(): number {
    return this.utilisateurs.filter(u => u.statut === 'ACTIF').length;
  }

  viewUser(userId: string): void {
    this.router.navigate(['/administration/utilisateurs', userId]);
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  }

  getUserStatusClass(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'status-active';
      case 'INACTIF': return 'status-inactive';
      case 'SUSPENDU': return 'status-suspended';
      default: return 'status-unknown';
    }
  }

  getUserStatusLabel(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'INACTIF': return 'Inactif';
      case 'SUSPENDU': return 'Suspendu';
      default: return 'Inconnu';
    }
  }

  trackByUserId(index: number, utilisateur: UtilisateurResponse): string {
    return utilisateur.id;
  }
} 