import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ImageEchographiqueResponse } from '../../../core/models/examen_echographique/image_echographique/image-echographique-response.model';
import { SidePanelService } from '../../../core/services/side-panel.service';
import { ImageUrlService } from '../../services/image-url.service';

export interface ImageViewerData {
  images: ImageEchographiqueResponse[];
  selectedIndex?: number;
  title?: string;
  allowDownload?: boolean;
  allowFullscreen?: boolean;
}

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.css'
})
export class ImageViewerComponent implements OnInit, OnDestroy {
  @Input() images: ImageEchographiqueResponse[] = [];
  @Input() selectedIndex: number = 0;
  @Input() title: string = 'Images Échographiques';
  @Input() allowDownload: boolean = true;
  @Input() allowFullscreen: boolean = true;
  @Input() showThumbnails: boolean = true;
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 3000;

  @Output() imageChanged = new EventEmitter<number>();
  @Output() imageLoaded = new EventEmitter<ImageEchographiqueResponse>();
  @Output() imageError = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  currentIndex: number = 0;
  zoomLevel: number = 1;
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  autoPlayTimer?: any;

  // Variables pour le drag & zoom
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  imageTranslateX: number = 0;
  imageTranslateY: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private sidePanelService: SidePanelService,
    private imageUrlService: ImageUrlService,
    @Optional() public dialogRef?: MatDialogRef<ImageViewerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: ImageViewerData
  ) {
    // Si des données sont passées via le dialog ou le side panel, les utiliser
    if (this.dialogData) {
      this.images = this.dialogData.images || [];
      this.selectedIndex = this.dialogData.selectedIndex || 0;
      this.title = this.dialogData.title || 'Images Échographiques';
      this.allowDownload = this.dialogData.allowDownload !== false;
      this.allowFullscreen = this.dialogData.allowFullscreen !== false;
    }
  }

  ngOnInit(): void {
    this.currentIndex = this.selectedIndex || 0;
    this.setupKeyboardNavigation();
    
    if (this.autoPlay && this.images.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  /**
   * Configuration de la navigation au clavier
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Gestion des touches du clavier
   */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case '+':
      case '=':
        event.preventDefault();
        this.zoomIn();
        break;
      case '-':
        event.preventDefault();
        this.zoomOut();
        break;
      case '0':
        event.preventDefault();
        this.resetZoom();
        break;
    }
  }

  /**
   * Image précédente
   */
  previousImage(): void {
    if (this.images.length > 1) {
      this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
      this.onImageChange();
    }
  }

  /**
   * Image suivante
   */
  nextImage(): void {
    if (this.images.length > 1) {
      this.currentIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
      this.onImageChange();
    }
  }

  /**
   * Aller à une image spécifique
   */
  goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.onImageChange();
    }
  }

  /**
   * Événement de changement d'image
   */
  private onImageChange(): void {
    this.resetZoom();
    this.resetPan();
    this.imageChanged.emit(this.currentIndex);
    
    if (this.autoPlay) {
      this.restartAutoPlay();
    }
  }

  /**
   * Zoom avant
   */
  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel * 1.2, 5);
  }

  /**
   * Zoom arrière
   */
  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
    
    // Réajuster la position si nécessaire
    if (this.zoomLevel === 1) {
      this.resetPan();
    }
  }

  /**
   * Réinitialiser le zoom
   */
  resetZoom(): void {
    this.zoomLevel = 1;
    this.resetPan();
  }

  /**
   * Réinitialiser la position
   */
  private resetPan(): void {
    this.imageTranslateX = 0;
    this.imageTranslateY = 0;
  }

  /**
   * Début du glissement
   */
  onMouseDown(event: MouseEvent): void {
    if (this.zoomLevel > 1) {
      this.isDragging = true;
      this.dragStartX = event.clientX - this.imageTranslateX;
      this.dragStartY = event.clientY - this.imageTranslateY;
      event.preventDefault();
    }
  }

  /**
   * Glissement en cours
   */
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.zoomLevel > 1) {
      this.imageTranslateX = event.clientX - this.dragStartX;
      this.imageTranslateY = event.clientY - this.dragStartY;
      event.preventDefault();
    }
  }

  /**
   * Fin du glissement
   */
  onMouseUp(): void {
    this.isDragging = false;
  }

  /**
   * Zoom avec la molette
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  /**
   * Chargement de l'image
   */
  onImageLoad(): void {
    this.isLoading = false;
    this.hasError = false;
    
    if (this.currentImage) {
      this.imageLoaded.emit(this.currentImage);
    }
  }

  /**
   * Erreur de chargement
   */
  onImageLoadError(): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = 'Impossible de charger l\'image depuis le serveur';
    this.imageError.emit(this.errorMessage);
    
    console.error('Erreur de chargement d\'image:', {
      image: this.currentImage,
      url: this.currentImageUrl,
      index: this.currentIndex
    });
  }

  /**
   * Réessayer le chargement de l'image
   */
  retryImageLoad(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    // Forcer le rechargement en ajoutant un timestamp
    if (this.currentImage) {
      const img = new Image();
      img.onload = () => this.onImageLoad();
      img.onerror = () => this.onImageLoadError();
      img.src = this.currentImageUrl + '?t=' + Date.now();
    }
  }

  /**
   * Masquer une image miniature en cas d'erreur
   */
  hideErrorImage(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  /**
   * Télécharger l'image courante
   */
  downloadImage(): void {
    if (this.currentImage && this.allowDownload) {
      const link = document.createElement('a');
      link.href = this.getImageUrl(this.currentImage);
      link.download = this.currentImage.titre || `image_echographique_${this.currentIndex + 1}`;
      link.target = '_blank';
      link.click();
    }
  }

  /**
   * Ouvrir en plein écran
   */
  openFullscreen(): void {
    if (this.allowFullscreen) {
      this.dialog.open(ImageViewerComponent, {
        width: '95vw',
        height: '95vh',
        maxWidth: 'none',
        maxHeight: 'none',
        data: {
          images: this.images,
          selectedIndex: this.currentIndex,
          title: this.title,
          allowDownload: this.allowDownload,
          allowFullscreen: false
        },
        panelClass: 'fullscreen-dialog'
      });
    }
  }

  /**
   * Démarrer le diaporama automatique
   */
  startAutoPlay(): void {
    if (this.images.length > 1) {
      this.autoPlayTimer = setInterval(() => {
        this.nextImage();
      }, this.autoPlayInterval);
    }
  }

  /**
   * Arrêter le diaporama automatique
   */
  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  /**
   * Redémarrer le diaporama automatique
   */
  private restartAutoPlay(): void {
    if (this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  /**
   * Basculer le diaporama automatique
   */
  toggleAutoPlay(): void {
    if (this.autoPlayTimer) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  /**
   * Fermer le visualiseur
   */
  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Si ouvert via SidePanel, le fermer
      this.sidePanelService.close();
    }
    this.closed.emit();
  }

  /**
   * Obtenir l'image courante
   */
  get currentImage(): ImageEchographiqueResponse | null {
    return this.images[this.currentIndex] || null;
  }

  /**
   * Obtenir l'URL complète d'une image
   */
  getImageUrl(image: ImageEchographiqueResponse): string {
    return this.imageUrlService.buildImageUrl(image.titre);
  }

  /**
   * Obtenir l'URL de l'image courante
   */
  get currentImageUrl(): string {
    return this.currentImage ? this.getImageUrl(this.currentImage) : '';
  }

  /**
   * Obtenir le style de transformation de l'image
   */
  get imageTransform(): string {
    return `scale(${this.zoomLevel}) translate(${this.imageTranslateX / this.zoomLevel}px, ${this.imageTranslateY / this.zoomLevel}px)`;
  }

  /**
   * Vérifier si on peut naviguer
   */
  get canNavigate(): boolean {
    return this.images.length > 1;
  }

  /**
   * Vérifier si le diaporama automatique est actif
   */
  get isAutoPlayActive(): boolean {
    return !!this.autoPlayTimer;
  }

  /**
   * TrackBy pour les miniatures
   */
  trackByImageId(index: number, image: ImageEchographiqueResponse): string {
    return image.id;
  }
} 