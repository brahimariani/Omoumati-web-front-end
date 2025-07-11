import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UtilisateurResponse } from '../../core/models/utilisateur/utilisateur.response.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser$: Observable<UtilisateurResponse | null>;
  isAuthenticated$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser().pipe(
      tap(user => {
        if (!environment.production) {
          console.log('🧑‍💼 Header - Current User changed:', user);
        }
      })
    );
    
    this.isAuthenticated$ = this.authService.isAuthenticated$.pipe(
      tap(isAuth => {
        if (!environment.production) {
          console.log('🔐 Header - Auth state changed:', isAuth);
        }
      })
    );
  }

  ngOnInit(): void {
    if (!environment.production) {
      console.log('🎯 HeaderComponent Init');
    }
    
    // S'abonner aux changements pour debug
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (!environment.production) {
        console.log('👤 Header - User subscription:', user);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Génère les initiales de l'utilisateur pour l'avatar
   */
  getUserInitials(user: UtilisateurResponse): string {
    if (!user) return 'U';
    
    const prenom = user.prenom?.trim() || '';
    const nom = user.nom?.trim() || '';
    
    // Si on a prénom et nom
    if (prenom && nom) {
      return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
    }
    
    // Si on a seulement le nom (ex: "Utilisateur")
    if (nom && !prenom) {
      // Prendre les 2 premières lettres du nom ou la première + deuxième mot
      const words = nom.split(' ');
      if (words.length > 1) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
      } else {
        return nom.length > 1 ? 
          (nom.charAt(0) + nom.charAt(1)).toUpperCase() : 
          nom.charAt(0).toUpperCase();
      }
    }
    
    // Si on a seulement le prénom
    if (prenom && !nom) {
      return prenom.length > 1 ? 
        (prenom.charAt(0) + prenom.charAt(1)).toUpperCase() : 
        prenom.charAt(0).toUpperCase();
    }
    
    // Par défaut
    return 'U';
  }

  /**
   * Obtient le nom complet à afficher
   */
  getDisplayName(user: UtilisateurResponse): string {
    if (!user) return 'Utilisateur';
    
    const prenom = user.prenom?.trim() || '';
    const nom = user.nom?.trim() || '';
    
    if (prenom && nom) {
      return `${prenom} ${nom}`;
    } else if (nom) {
      return nom;
    } else if (prenom) {
      return prenom;
    }
    
    return 'Utilisateur';
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Formate le rôle pour l'affichage
   */
  getDisplayRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'DOCTOR': 'Médecin',
      'NURSE': 'Infirmière',
      'USER': 'Utilisateur',
      'PATIENT': 'Patient'
    };
    
    return roleMap[role] || role;
  }
} 