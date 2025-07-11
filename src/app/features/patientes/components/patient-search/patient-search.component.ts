import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { PatientsActions } from '../../../../store/patients/patients.actions';
import { selectPatientsSearchTerm } from '../../../../store/patients/patients.selectors';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.css']
})
export class PatientSearchComponent implements OnInit {
  searchControl = new FormControl('');
  private isUpdatingFromStore = false; // Drapeau pour éviter la boucle infinie
  
  constructor(private store: Store) { }
  
  ngOnInit(): void {
    // Récupérer le terme de recherche actuel
    this.store.select(selectPatientsSearchTerm)
      .pipe(
        filter(term => term !== null)
      )
      .subscribe(term => {
        if (term && term !== this.searchControl.value) {
          this.isUpdatingFromStore = true; // Indiquer qu'on met à jour depuis le store
          this.searchControl.setValue(term);
          this.isUpdatingFromStore = false; // Réinitialiser le drapeau après la mise à jour
        }
      });
    
    // Réagir aux changements de recherche avec debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(() => !this.isUpdatingFromStore) // Ignorer les changements provenant du store
    ).subscribe(value => {
      if (value) {
        this.search(value);
      } else {
        this.clearSearch();
      }
    });
  }
  
  search(term: string): void {
    this.store.dispatch(PatientsActions.searchPatients({ 
      searchTerm: term,
      page: 0,
      size: 10
    }));
  }
  
  clearSearch(): void {
    this.searchControl.setValue('');
    this.store.dispatch(PatientsActions.loadPatients({ page: 0, size: 10 }));
  }
}
