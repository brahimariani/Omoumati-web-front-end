import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { Observable } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  requiredRole?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isOpen = true;
  
  currentUser$: Observable<any>;
  
  navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Patientes',
      icon: 'people',
      route: '/patientes' 
    },
    {
      label: 'Grossesses',
      icon: 'pregnant_woman',
      route: '/grossesses'
    },
    {
      label: 'Références & RDV',
      icon: 'assignment_turned_in',
      children: [
        { label: 'Liste des références', icon: 'assignment', route: '/references-et-rendezvous/references' },
        { label: 'Liste des RDV', icon: 'event_note', route: '/references-et-rendezvous/rendez-vous' },
        // TODO: Ajouter le calendrier quand le composant sera créé
        // { label: 'Calendrier RDV', icon: 'calendar_month', route: '/references-et-rendezvous/rendez-vous/calendar' }
      ]
    },
    {
      label: 'Diagnostics',
      icon: 'healing',
      route: '/diagnostics'
    },
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      requiredRole: ['ADMIN'],
      children: [
        { label: 'Centres', icon: 'business', route: '/administration/centres' },
        { label: 'Utilisateurs', icon: 'people', route: '/administration/utilisateurs' },
        { label: 'Rôles', icon: 'security', route: '/administration/roles' }
      ]
    }
  ];

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  hasRequiredRole(roles?: string[]): boolean {
    // À implémenter avec la vérification des rôles de l'utilisateur actuel
    return true;
  }
} 