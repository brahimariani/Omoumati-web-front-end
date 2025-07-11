import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

// Composants
import { ReferenceListComponent } from './components/reference-list/reference-list.component';
import { RendezVousListComponent } from './components/rendez-vous-list/rendez-vous-list.component';

// Routes
import { referencesEtRendezVousRoutes } from './references-et-rendezvous.routes';

// Composants partagés
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    ReferenceListComponent,
    RendezVousListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(referencesEtRendezVousRoutes),
    
    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatDividerModule,
    
    
    // Composants partagés
    ConfirmDialogComponent
  ],
  exports: [
    ReferenceListComponent,
    RendezVousListComponent
  ]
})
export class ReferencesEtRendezVousModule { } 