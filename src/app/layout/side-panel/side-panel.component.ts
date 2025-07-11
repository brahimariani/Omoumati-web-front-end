import { Component, OnInit, OnDestroy, ViewContainerRef, ComponentRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { SidePanelService, SidePanelConfig } from '../../core/services/side-panel.service';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    <div 
      class="side-panel-overlay" 
      [class.open]="isOpen"
      (click)="onOverlayClick($event)">
      
      <div 
        class="side-panel" 
        [style.width]="panelWidth"
        [@slideIn]="isOpen ? 'in' : 'out'"
        (click)="$event.stopPropagation()">
        
        <!-- Header du panel -->
        <div class="panel-header">
          <h2 class="panel-title">{{ config?.title || 'Formulaire' }}</h2>
          <button 
            *ngIf="config?.showCloseButton !== false"
            mat-icon-button 
            (click)="closePanel()"
            class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <mat-divider></mat-divider>
        
        <!-- Contenu dynamique -->
        <div class="panel-content">
          <ng-container #dynamicContent></ng-container>
        </div>
        
      </div>
    </div>
  `,
  styleUrls: ['./side-panel.component.css'],
  animations: [
    trigger('slideIn', [
      state('in', style({ transform: 'translateX(0%)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('in <=> out', animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ]
})
export class SidePanelComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dynamicContent', { read: ViewContainerRef }) dynamicContent!: ViewContainerRef;

  isOpen = false;
  config: SidePanelConfig | null = null;
  panelWidth = '500px';
  
  private destroy$ = new Subject<void>();
  private componentRef: ComponentRef<any> | null = null;
  private viewInitialized = false;
  private pendingConfig: SidePanelConfig | null = null;

  constructor(private sidePanelService: SidePanelService) {}

  ngOnInit(): void {
    // S'abonner à l'état d'ouverture
    this.sidePanelService.isOpen$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isOpen => {
      this.isOpen = isOpen;
    });

    // S'abonner à la configuration
    this.sidePanelService.config$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(config => {
      console.log('Config received:', config, 'viewInitialized:', this.viewInitialized);
      
      if (this.viewInitialized) {
        this.config = config;
        if (config) {
          this.panelWidth = config.width || '500px';
          this.loadDynamicComponent();
        } else {
          this.clearDynamicComponent();
        }
      } else {
        // Stocker la config en attente si la vue n'est pas encore initialisée
        this.pendingConfig = config;
        if (config) {
          this.panelWidth = config.width || '500px';
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearDynamicComponent();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: View initialized, dynamicContent available:', !!this.dynamicContent);
    this.viewInitialized = true;
    
    // Si on a une config en attente, la charger maintenant
    if (this.pendingConfig) {
      console.log('Loading pending config:', this.pendingConfig);
      this.config = this.pendingConfig;
      this.pendingConfig = null;
      this.loadDynamicComponent();
    }
  }

  /**
   * Charger le composant dynamique
   */
  private loadDynamicComponent(): void {
    console.log('loadDynamicComponent called', { 
      hasComponent: !!this.config?.component, 
      hasDynamicContent: !!this.dynamicContent,
      config: this.config 
    });
    
    if (!this.config?.component || !this.dynamicContent) {
      console.log('Missing component or dynamicContent:', {
        component: this.config?.component,
        dynamicContent: this.dynamicContent
      });
      return;
    }

    this.clearDynamicComponent();
    
    console.log('Creating component...');
    this.componentRef = this.dynamicContent.createComponent(this.config.component);
    console.log('Component created:', this.componentRef);
    
    // Passer les données au composant si disponibles
    if (this.config.data && this.componentRef.instance) {
      console.log('Assigning data to component:', this.config.data);
      Object.assign(this.componentRef.instance, this.config.data);
    }

    // Écouter les événements de fermeture du composant
    if (this.componentRef.instance.onClose) {
      this.componentRef.instance.onClose.subscribe((success: boolean) => {
        this.closePanel();
        // Ici on pourrait émettre un événement pour notifier le parent du succès
        // Mais pour le moment on se contente de fermer
      });
    }

    // Méthodes alternatives de fermeture (pour compatibilité)
    if (this.componentRef.instance.closed) {
      this.componentRef.instance.closed.subscribe(() => {
        this.closePanel();
      });
    }
  }

  /**
   * Nettoyer le composant dynamique
   */
  private clearDynamicComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    if (this.dynamicContent) {
      this.dynamicContent.clear();
    }
  }

  /**
   * Fermer le panel
   */
  closePanel(): void {
    this.sidePanelService.close();
  }

  /**
   * Gérer le clic sur l'overlay
   */
  onOverlayClick(event: MouseEvent): void {
    // Fermer si on clique sur l'overlay mais pas sur le panel
    if (event.target === event.currentTarget) {
      this.closePanel();
    }
  }
} 