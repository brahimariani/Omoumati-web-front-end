import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilisateurResponse } from '../../../../core/models/utilisateur/utilisateur.response.model';
import { StatutUtilisateur } from '../../../../core/models/utilisateur/statututilisateur.model';
import { UtilisateursActions } from '../../../../store/utilisateurs/utilisateurs.actions';
import { selectSelectedUtilisateur, selectUtilisateursLoading, selectUtilisateursError } from '../../../../store/utilisateurs/utilisateurs.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { UtilisateurFormComponent } from '../utilisateur-form/utilisateur-form.component';

@Component({
  selector: 'app-utilisateur-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule, 
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './utilisateur-details.component.html',
  styleUrls: ['./utilisateur-details.component.css']
})
export class UtilisateurDetailsComponent implements OnInit, OnDestroy {
  utilisateur$: Observable<UtilisateurResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  utilisateurId: string;
  private destroy$ = new Subject<void>();
  
  // Libellés des statuts utilisateurs
  statutLabels: { [key in StatutUtilisateur]: string } = {
    [StatutUtilisateur.ACTIF]: 'Actif',
    [StatutUtilisateur.INACTIF]: 'Inactif',
    [StatutUtilisateur.SUSPENDU]: 'Suspendu',
    [StatutUtilisateur.SUPPRIME]: 'Supprimé'
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private sidePanelService: SidePanelService
  ) {
    this.utilisateur$ = this.store.select(selectSelectedUtilisateur);
    this.loading$ = this.store.select(selectUtilisateursLoading);
    this.error$ = this.store.select(selectUtilisateursError);
    
    this.utilisateurId = this.route.snapshot.paramMap.get('id') || '';
  }
  
  ngOnInit(): void {
    if (this.utilisateurId) {
      // Charger les détails de l'utilisateur
      this.store.dispatch(UtilisateursActions.loadUtilisateur({ id: this.utilisateurId }));
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Ouvrir le formulaire d'édition
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
   * Retourner à la liste
   */
  goBack(): void {
    this.router.navigate(['/administration/utilisateurs']);
  }
  
  /**
   * Obtenir le libellé du statut
   */
  getStatutLabel(statut: StatutUtilisateur): string {
    return this.statutLabels[statut] || statut;
  }
  
  /**
   * Obtenir la couleur du chip selon le statut
   */
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
   * Obtenir l'icône selon le statut de l'utilisateur
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
   * Appeler l'utilisateur
   */
  callUtilisateur(telephone: string): void {
    if (telephone) {
      window.open(`tel:${telephone}`);
    }
  }
  
  /**
   * Envoyer un email à l'utilisateur
   */
  emailUtilisateur(email: string): void {
    if (email) {
      window.open(`mailto:${email}`);
    }
  }
  
  /**
   * Voir la localisation de l'utilisateur
   */
  viewLocation(adresse: string): void {
    if (adresse) {
      const encodedAddress = encodeURIComponent(adresse);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
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

  /**
   * Obtenir le nom complet
   */
  getFullName(utilisateur: UtilisateurResponse): string {
    return `${utilisateur.prenom} ${utilisateur.nom}`;
  }

  /**
   * Obtenir les initiales pour l'avatar
   */
  getInitials(utilisateur: UtilisateurResponse): string {
    return `${utilisateur.prenom.charAt(0)}${utilisateur.nom.charAt(0)}`.toUpperCase();
  }
} 