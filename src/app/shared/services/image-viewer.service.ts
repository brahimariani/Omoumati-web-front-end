import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ImageViewerComponent, ImageViewerData } from '../components/image-viewer/image-viewer.component';
import { ImageEchographiqueResponse } from '../../core/models/examen_echographique/image_echographique/image-echographique-response.model';

@Injectable({
  providedIn: 'root'
})
export class ImageViewerService {

  constructor(private dialog: MatDialog) {}

  /**
   * Ouvrir le visualiseur d'images en tant que dialog modal
   */
  openImageViewer(data: {
    images: ImageEchographiqueResponse[];
    selectedIndex?: number;
    title?: string;
    allowDownload?: boolean;
    allowFullscreen?: boolean;
  }): MatDialogRef<ImageViewerComponent> {
    return this.dialog.open(ImageViewerComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '1200px',
      maxHeight: '800px',
      data: {
        images: data.images,
        selectedIndex: data.selectedIndex || 0,
        title: data.title || 'Images Échographiques',
        allowDownload: data.allowDownload !== false,
        allowFullscreen: data.allowFullscreen !== false
      } as ImageViewerData,
      panelClass: ['image-viewer-dialog', 'modern-dialog'],
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });
  }

  /**
   * Ouvrir le visualiseur d'images en plein écran
   */
  openFullscreenImageViewer(data: {
    images: ImageEchographiqueResponse[];
    selectedIndex?: number;
    title?: string;
    allowDownload?: boolean;
  }): MatDialogRef<ImageViewerComponent> {
    return this.dialog.open(ImageViewerComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none',
      data: {
        images: data.images,
        selectedIndex: data.selectedIndex || 0,
        title: data.title || 'Images Échographiques',
        allowDownload: data.allowDownload !== false,
        allowFullscreen: false // Pas de plein écran dans le plein écran
      } as ImageViewerData,
      panelClass: ['fullscreen-image-viewer-dialog', 'fullscreen-dialog'],
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });
  }

  /**
   * Ouvrir une seule image
   */
  openSingleImage(image: ImageEchographiqueResponse, title?: string): MatDialogRef<ImageViewerComponent> {
    return this.openImageViewer({
      images: [image],
      selectedIndex: 0,
      title: title || image.titre || 'Image Échographique',
      allowDownload: true,
      allowFullscreen: true
    });
  }
} 