import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { administrationRoutes } from './administration.routes';

// Composants
import { CentresListComponent } from './components/centres-list/centres-list.component';
import { CentreFormComponent } from './components/centre-form/centre-form.component';
import { CentreDetailsComponent } from './components/centre-details/centre-details.component';
import { UtilisateurListComponent } from './components/utilisateur-list/utilisateur-list.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { UtilisateurFormComponent } from './components/utilisateur-form/utilisateur-form.component';
import { RoleListComponent } from './components/role-list/role-list.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { RoleFormComponent } from './components/role-form/role-form.component';

@NgModule({
  declarations: [
    // Plus de composants dans declarations car tous sont standalone
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(administrationRoutes),
    
    // Composants standalone
    CentresListComponent,
    CentreFormComponent,
    CentreDetailsComponent,
    UtilisateurListComponent,
    UtilisateurDetailsComponent,
    UtilisateurFormComponent,
    RoleListComponent,
    RoleDetailsComponent,
    RoleFormComponent,
    
    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDividerModule
  ]
})
export class AdministrationModule { } 