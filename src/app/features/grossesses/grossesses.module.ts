import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Routes
import { grossessesRoutes } from './grossesses.routes';

// Composants
import { GrossesseListComponent } from './components/grossesse-list/grossesse-list.component';
import { GrossesseFormComponent } from './components/grossesse-form/grossesse-form.component';
import { AccouchementFormComponent } from '../accouchements/components/accouchement-form/accouchement-form.component';
import { NaissanceFormComponent } from '../naissances/components/naissance-form/naissance-form.component';

@NgModule({
  declarations: [
    // Les composants sont standalone, donc pas besoin de les déclarer ici
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(grossessesRoutes),
    
    // Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    MatStepperModule,
    MatChipsModule,
    MatSliderModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    
    // Composants standalone
    GrossesseListComponent,
    GrossesseFormComponent,
    AccouchementFormComponent,
    NaissanceFormComponent
  ],
  exports: [
    GrossesseListComponent,
    GrossesseFormComponent,
    AccouchementFormComponent
  ]
})
export class GrossessesModule { } 