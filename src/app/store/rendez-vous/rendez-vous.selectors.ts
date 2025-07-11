import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RendezVousState } from './rendez-vous.reducer';

// Feature selector
export const selectRendezVousState = createFeatureSelector<RendezVousState>('rendezVous');

// Selectors de base
export const selectRendezVous = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.rendezVous
);

export const selectSelectedRendezVous = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.selectedRendezVous
);

export const selectRendezVousLoading = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.loading
);

export const selectRendezVousError = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.error
);

// Selectors de pagination
export const selectRendezVousTotalElements = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.totalElements
);

export const selectRendezVousTotalPages = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.totalPages
);

export const selectRendezVousCurrentPage = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.currentPage
);

export const selectRendezVousPageSize = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.pageSize
);

// Selectors de statistiques
export const selectRendezVousStatistics = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.statistics
);

export const selectRecentRendezVous = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.recentRendezVous
);

export const selectProchainRendezVous = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.prochainRendezVous
);

export const selectRendezVousDuJour = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.rendezVousDuJour
);

export const selectConflitsHoraires = createSelector(
  selectRendezVousState,
  (state: RendezVousState) => state.conflitsHoraires
);

// Selectors composés
export const selectRendezVousWithPagination = createSelector(
  selectRendezVous,
  selectRendezVousTotalElements,
  selectRendezVousTotalPages,
  selectRendezVousCurrentPage,
  selectRendezVousPageSize,
  (rendezVous, totalElements, totalPages, currentPage, pageSize) => ({
    rendezVous,
    totalElements,
    totalPages,
    currentPage,
    pageSize
  })
);

export const selectRendezVousLoadingState = createSelector(
  selectRendezVousLoading,
  selectRendezVousError,
  (loading, error) => ({
    loading,
    error
  })
);

// Selectors par statut
export const selectRendezVousByStatut = (statut: string) => createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.statut === statut)
);

export const selectRendezVousPending = createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.statut === 'PENDING')
);

export const selectRendezVousAccepted = createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.statut === 'ACCEPTED')
);

export const selectRendezVousRejected = createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.statut === 'REJECTED')
);

export const selectRendezVousReported = createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.statut === 'REPORTED')
);

// Selectors par centre
export const selectRendezVousByCentre = (centreId: string) => createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.centre.id === centreId)
);

// Selectors par patiente
export const selectRendezVousByPatiente = (patienteId: string) => createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.filter(rv => rv.patiente.id === patienteId)
);

// Selector pour un rendez-vous par ID
export const selectRendezVousById = (id: string) => createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.find(rv => rv.id === id)
);

// Selectors de comptage
export const selectRendezVousCount = createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.length
);

export const selectRendezVousCountByStatut = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const counts = {
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      REPORTED: 0
    };
    
    rendezVous.forEach(rv => {
      if (counts.hasOwnProperty(rv.statut)) {
        counts[rv.statut as keyof typeof counts]++;
      }
    });
    
    return counts;
  }
);

// Selector pour vérifier si des données existent
export const selectHasRendezVous = createSelector(
  selectRendezVous,
  (rendezVous) => rendezVous.length > 0
);

// Selectors par date
export const selectRendezVousByDate = (date: string) => createSelector(
  selectRendezVous,
  (rendezVous) => {
    const targetDate = new Date(date).toDateString();
    return rendezVous.filter(rv => 
      new Date(rv.date).toDateString() === targetDate
    );
  }
);

export const selectRendezVousToday = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const today = new Date().toDateString();
    return rendezVous.filter(rv => 
      new Date(rv.date).toDateString() === today
    );
  }
);

export const selectRendezVousTomorrow = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();
    
    return rendezVous.filter(rv => 
      new Date(rv.date).toDateString() === tomorrowStr
    );
  }
);

export const selectRendezVousThisWeek = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return rendezVous.filter(rv => {
      const rvDate = new Date(rv.date);
      return rvDate >= startOfWeek && rvDate <= endOfWeek;
    });
  }
);

export const selectRendezVousThisMonth = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return rendezVous.filter(rv => {
      const rvDate = new Date(rv.date);
      return rvDate >= startOfMonth && rvDate <= endOfMonth;
    });
  }
);

// Selector pour les rendez-vous récents (dernières 24h)
export const selectRecentRendezVousToday = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    return rendezVous.filter(rv => 
      new Date(rv.createdAt) >= yesterday
    );
  }
);

// Selector pour les rendez-vous par mois
export const selectRendezVousByMonth = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const rendezVousByMonth: { [key: string]: number } = {};
    
    rendezVous.forEach(rv => {
      const date = new Date(rv.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      rendezVousByMonth[monthKey] = (rendezVousByMonth[monthKey] || 0) + 1;
    });
    
    return rendezVousByMonth;
  }
);

// Selector pour les rendez-vous en conflit
export const selectHasConflits = createSelector(
  selectConflitsHoraires,
  (conflits) => conflits.length > 0
);

export const selectConflitsCount = createSelector(
  selectConflitsHoraires,
  (conflits) => conflits.length
);

// Selectors pour les prochains rendez-vous triés
export const selectProchainRendezVousSorted = createSelector(
  selectProchainRendezVous,
  (rendezVous) => [...rendezVous].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
);

// Selector pour les rendez-vous urgents (dans les prochaines 2 heures)
export const selectRendezVousUrgents = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const now = new Date();
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return rendezVous.filter(rv => {
      const rvDate = new Date(rv.date);
      return rvDate >= now && rvDate <= in2Hours && rv.statut === 'ACCEPTED';
    });
  }
);

// Selector pour les rendez-vous en retard
export const selectRendezVousEnRetard = createSelector(
  selectRendezVous,
  (rendezVous) => {
    const now = new Date();
    
    return rendezVous.filter(rv => {
      const rvDate = new Date(rv.date);
      return rvDate < now && rv.statut === 'PENDING';
    });
  }
);

// Selector pour les statistiques avancées
export const selectRendezVousAdvancedStats = createSelector(
  selectRendezVous,
  selectRendezVousStatistics,
  (rendezVous, statistics) => {
    const today = new Date();
    const thisMonth = rendezVous.filter(rv => {
      const rvDate = new Date(rv.date);
      return rvDate.getMonth() === today.getMonth() && 
             rvDate.getFullYear() === today.getFullYear();
    });
    
    return {
      totalThisMonth: thisMonth.length,
      confirmedThisMonth: thisMonth.filter(rv => rv.statut === 'ACCEPTED').length,
      pendingThisMonth: thisMonth.filter(rv => rv.statut === 'PENDING').length,
      cancelledThisMonth: thisMonth.filter(rv => rv.statut === 'REJECTED').length,
      global: statistics
    };
  }
);

// Selector pour vérifier si on peut créer un nouveau rendez-vous
export const selectCanCreateRendezVous = createSelector(
  selectRendezVousLoading,
  selectRendezVousError,
  (loading, error) => !loading && !error
); 