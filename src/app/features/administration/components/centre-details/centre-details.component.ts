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
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, filter } from 'rxjs/operators';

import { CentreResponse } from '../../../../core/models/centre/centre.response.model';
import { TypeCentre } from '../../../../core/models/centre/typecentre.model';
import { CentresActions } from '../../../../store/centres/centres.actions';
import { selectSelectedCentre, selectCentresLoading, selectCentresError } from '../../../../store/centres/centres.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { CentreFormComponent } from '../centre-form/centre-form.component';

@Component({
  selector: 'app-centre-details',
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
  templateUrl: './centre-details.component.html',
  styleUrls: ['./centre-details.component.css']
})
export class CentreDetailsComponent implements OnInit, OnDestroy {
  centre$: Observable<CentreResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  centreId: string;
  private destroy$ = new Subject<void>();
  
  // Libellés des types de centres
  typeLabels: { [key in TypeCentre]: string } = {
    [TypeCentre.CS]: 'Centre de Santé',
    [TypeCentre.CSC]: 'Centre de Santé Communautaire',
    [TypeCentre.CSU]: 'Centre de Santé Urbain',
    [TypeCentre.CSCA]: 'Centre de Santé Communautaire Avancé',
    [TypeCentre.CSUA]: 'Centre de Santé Urbain Avancé'
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private sidePanelService: SidePanelService
  ) {
    this.centre$ = this.store.select(selectSelectedCentre);
    this.loading$ = this.store.select(selectCentresLoading);
    this.error$ = this.store.select(selectCentresError);
    
    this.centreId = this.route.snapshot.paramMap.get('id') || '';
  }
  
  ngOnInit(): void {
    if (this.centreId) {
      // Charger les détails du centre
      this.store.dispatch(CentresActions.loadCentre({ id: this.centreId }));
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Ouvrir le formulaire d'édition
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
  
  /**
   * Retourner à la liste
   */
  goBack(): void {
    this.router.navigate(['/administration/centres']);
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
  
  /**
   * Obtenir l'icône selon le type de centre
   */
  getTypeIcon(type: TypeCentre): string {
    const icons: { [key in TypeCentre]: string } = {
      [TypeCentre.CS]: 'local_hospital',
      [TypeCentre.CSC]: 'home_health',
      [TypeCentre.CSU]: 'business',
      [TypeCentre.CSCA]: 'medical_services',
      [TypeCentre.CSUA]: 'corporate_fare'
    };
    return icons[type] || 'business';
  }
  
  /**
   * Ouvrir le site web du centre
   */
  openWebsite(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  
  /**
   * Appeler le centre
   */
  callCentre(telephone: string): void {
    if (telephone) {
      window.open(`tel:${telephone}`);
    }
  }
  
  /**
   * Envoyer un email au centre
   */
  emailCentre(email: string): void {
    if (email) {
      window.open(`mailto:${email}`);
    }
  }
  
  /**
   * Voir la localisation du centre
   */
  viewLocation(adresse: string): void {
    if (adresse) {
      const encodedAddress = encodeURIComponent(adresse);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  }
} 