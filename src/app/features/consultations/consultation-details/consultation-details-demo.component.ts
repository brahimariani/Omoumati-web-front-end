import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ConsultationDetailsComponent } from './consultation-details.component';

@Component({
  selector: 'app-consultation-details-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    ConsultationDetailsComponent
  ],
  template: `
    <div style="padding: 20px;">
      <mat-card style="margin-bottom: 20px;">
        <mat-card-header>
          <mat-card-title>Démonstration - Détails de Consultation</mat-card-title>
          <mat-card-subtitle>Component standalone avec design system respecté</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Ce composant affiche les détails d'une consultation avec les sections:</p>
          <ul>
            <li>✅ Informations de la consultation</li>
            <li>🧪 Examens biologiques</li>
            <li>🩺 Examens cliniques</li>
            <li>📡 Examens échographiques</li>
          </ul>
          <p><strong>Design features:</strong></p>
          <ul>
            <li>Respect complet du design system (styles.css)</li>
            <li>Layout responsive similaire à grossesse-details</li>
            <li>Onglets pour organiser les différents types d'examens</li>
            <li>États vides avec appels à l'action</li>
            <li>Statuts colorés pour les résultats d'examens</li>
          </ul>
        </mat-card-content>
      </mat-card>

      <!-- Démonstration du composant -->
      <app-consultation-details
        consultationId="demo-consultation-1"
        grossesseId="demo-grossesse-1"
        patienteName="Mme. Fatima ALAMI">
      </app-consultation-details>
    </div>
  `
})
export class ConsultationDetailsDemoComponent {} 