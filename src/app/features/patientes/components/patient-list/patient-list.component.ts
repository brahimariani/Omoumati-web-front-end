import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Observable, tap, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PatientSearchComponent } from '../patient-search/patient-search.component';
import { PatienteResponse } from '../../../../core/models/patiente/patiente.response.model';
import { PatientsActions } from '../../../../store/patients/patients.actions';
import { selectAllPatients, selectPatientsLoading, selectPatientsPagination, selectPatientsError } from '../../../../store/patients/patients.selectors';
import { SidePanelService } from '../../../../core/services/side-panel.service';
import { PatientFormComponent } from '../patient-form/patient-form.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    PatientSearchComponent
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit, OnDestroy {
  patients$: Observable<PatienteResponse[]>;
  loading$: Observable<boolean>;
  pagination$: Observable<any>;
  error$: Observable<string | null>;
  dataSource = new MatTableDataSource<PatienteResponse>([]);
  private subscription = new Subscription();
  errorOccurred = false;
  errorMessage = '';
  
  displayedColumns: string[] = [ 'nom', 'prenom', 'dateNaissance', 'telephone', 'groupageSanguin', 'actions'];
  
  constructor(
    private store: Store, 
    private router: Router,
    private sidePanelService: SidePanelService
  ) {
    // Déboguer l'état du store
    
    this.patients$ = this.store.select(selectAllPatients).pipe(
      tap(patients => {
        console.log('Patients reçus:', patients);
        console.log('Type de patients:', typeof patients);
        console.log('Patients est un tableau:', Array.isArray(patients));
        if (Array.isArray(patients) && patients.length > 0) {
          console.log('Premier patient:', patients[0]);
          this.dataSource.data = patients;
        }
      }),
      catchError(err => {
        this.errorOccurred = true;
        this.errorMessage = err.customMessage || 'Erreur lors du chargement des patientes';
        return of([]);
      })
    );
    
    this.loading$ = this.store.select(selectPatientsLoading);
    this.pagination$ = this.store.select(selectPatientsPagination);
    this.error$ = this.store.select(selectPatientsError);
  }
  
  ngOnInit(): void {
    this.loadPatients();
    
    // S'abonner au flux de patients pour mettre à jour la source de données
    this.subscription.add(
      this.patients$.subscribe(patients => {
        if (patients) {
          this.dataSource.data = patients;
        }
      })
    );
    
    // S'abonner aux erreurs pour mettre à jour l'état d'erreur
    this.subscription.add(
      this.error$.subscribe(error => {
        this.errorOccurred = !!error;
        if (error) {
          this.errorMessage = error;
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  loadPatients(page: number = 0, size: number = 10): void {
    this.errorOccurred = false;
    this.store.dispatch(PatientsActions.loadPatients({ page, size }));
  }
  
  onPageChange(event: PageEvent): void {
    this.loadPatients(event.pageIndex, event.pageSize);
  }
  
  onSortChange(sort: Sort): void {
    const direction = sort.direction || 'asc';
    this.store.dispatch(PatientsActions.loadPatients({ 
      page: 0, 
      size: 10, 
      sort: sort.active,
      direction: direction as 'asc' | 'desc'
    }));
  }
  
  retryLoading(): void {
    this.loadPatients();
  }
  
  viewPatient(id: string): void {
    this.router.navigate(['/patientes', id]);
  }
  
  /**
   * Ouvrir le formulaire d'ajout de patient dans le side panel
   */
  addPatient(): void {
    this.sidePanelService.open({
      title: 'Nouvelle patiente',
      component: PatientFormComponent,
      width: '1000px',
      data: {
        isEdit: false
      }
    });
  }

  
  
  /**
   * Ouvrir le formulaire d'édition de patient dans le side panel
   */
  editPatient(patient: PatienteResponse): void {
    this.sidePanelService.open({
      title: 'Modifier la patiente',
      component: PatientFormComponent,
      width: '1000px',
      data: {
        patient: patient,
        isEdit: true
      }
    });
  }
  
  deletePatient(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette patiente?')) {
      this.store.dispatch(PatientsActions.deletePatient({ id }));
    }
  }
}
