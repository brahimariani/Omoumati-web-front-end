# 📋 Guide d'utilisation du ConsultationService

## 🎯 Vue d'ensemble

Le `ConsultationService` est un service complet pour la gestion des consultations médicales dans l'application Omoumati. Il fournit toutes les opérations CRUD ainsi que des fonctionnalités avancées comme la recherche, les statistiques, l'export et la gestion de modèles.

## 🏗️ Fonctionnalités principales

### ✅ Opérations CRUD de base
- Créer une nouvelle consultation
- Récupérer toutes les consultations (avec pagination)
- Récupérer une consultation par ID
- Mettre à jour une consultation
- Supprimer une consultation

### ✅ Fonctionnalités spécialisées
- Récupérer les consultations par grossesse
- Recherche avancée avec filtres
- Statistiques des consultations
- Export PDF/Excel
- Vérification des consultations dues
- Modèles de consultation prédéfinis
- Cache intelligent pour optimiser les performances

## 📦 Import et injection

```typescript
import { ConsultationService } from '../../core/services/consultation.service';
import { ConsultationRequest, ConsultationResponse } from '../../core/models/consultation/';

@Component({...})
export class MonComposant {
  constructor(private consultationService: ConsultationService) {}
}
```

## 🔧 Utilisation des méthodes

### 1. Créer une consultation

```typescript
createNewConsultation(grossesseId: string) {
  const consultation: ConsultationRequest = {
    date: new Date(),
    observation: 'Consultation de routine - tout va bien',
    grossesseId: grossesseId
  };

  this.consultationService.createConsultation(consultation)
    .subscribe({
      next: (consultation) => {
        console.log('Consultation créée:', consultation);
        // Le cache est automatiquement mis à jour
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
}
```

### 2. Récupérer les consultations d'une grossesse

```typescript
loadConsultationsForPregnancy(grossesseId: string) {
  // Version avec pagination complète
  this.consultationService.getConsultationsByGrossesse(grossesseId, 0, 20)
    .subscribe({
      next: (response) => {
        this.consultations = response.data;
        this.totalElements = response.totalElements;
      }
    });

  // Version simple pour affichage direct
  this.consultationService.getConsultationsByGrossesseSimple(grossesseId)
    .subscribe({
      next: (consultations) => {
        this.consultations = consultations;
      }
    });
}
```

### 3. Mettre à jour une consultation

```typescript
updateConsultation(consultationId: string, updatedData: ConsultationRequest) {
  this.consultationService.updateConsultation(consultationId, updatedData)
    .subscribe({
      next: (consultation) => {
        console.log('Consultation mise à jour:', consultation);
        // Le cache est automatiquement mis à jour
      },
      error: (error) => {
        console.error('Erreur de mise à jour:', error);
      }
    });
}
```

### 4. Recherche avancée

```typescript
searchConsultations() {
  const searchParams = {
    grossesseId: 'abc123',
    dateDebut: new Date('2024-01-01'),
    dateFin: new Date('2024-12-31'),
    observation: 'routine',
    page: 0,
    size: 10
  };

  this.consultationService.searchConsultations(searchParams)
    .subscribe({
      next: (response) => {
        this.searchResults = response.data;
      }
    });
}
```

### 5. Obtenir les statistiques

```typescript
loadConsultationStats(grossesseId?: string) {
  this.consultationService.getConsultationStats(grossesseId)
    .subscribe({
      next: (stats) => {
        console.log('Total consultations:', stats.totalConsultations);
        console.log('Consultations par mois:', stats.consultationsParMois);
        console.log('Dernière consultation:', stats.derniereConsultation);
      }
    });
}
```

### 6. Vérifier si une consultation est due

```typescript
checkIfConsultationDue(grossesseId: string) {
  this.consultationService.checkConsultationDue(grossesseId)
    .subscribe({
      next: (result) => {
        if (result.isDue) {
          console.log(`Consultation due depuis ${result.daysSinceLastConsultation} jours`);
          console.log(`Date recommandée: ${result.recommendedDate}`);
        }
      }
    });
}
```

### 7. Utiliser les modèles de consultation

```typescript
loadTemplatesAndCreate() {
  // Charger les modèles disponibles
  this.consultationService.getConsultationTemplates()
    .subscribe({
      next: (templates) => {
        this.availableTemplates = templates;
      }
    });
}

createFromTemplate(templateId: string, grossesseId: string) {
  this.consultationService.createConsultationFromTemplate(templateId, grossesseId)
    .subscribe({
      next: (consultation) => {
        console.log('Consultation créée depuis le modèle:', consultation);
      }
    });
}
```

### 8. Export de données

```typescript
exportToPdf(grossesseId: string) {
  this.consultationService.exportConsultationsPdf(grossesseId)
    .subscribe({
      next: (blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `consultations-${grossesseId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
}

exportToExcel(grossesseId: string) {
  this.consultationService.exportConsultationsExcel(grossesseId)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `consultations-${grossesseId}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
}
```

## 🎯 Gestion du cache

Le service intègre un système de cache intelligent :

```typescript
// Observer les changements du cache
ngOnInit() {
  this.consultationService.consultations$
    .subscribe(consultations => {
      this.consultations = consultations;
    });
}

// Vider le cache manuellement
clearConsultationsCache() {
  this.consultationService.clearCache();
}

// Rafraîchir le cache pour une grossesse
refreshDataForPregnancy(grossesseId: string) {
  this.consultationService.refreshConsultationsForGrossesse(grossesseId)
    .subscribe(consultations => {
      console.log('Cache rafraîchi:', consultations);
    });
}
```

## 🔧 Gestion des erreurs

Le service gère automatiquement les erreurs HTTP communes :

```typescript
// Les erreurs sont automatiquement interceptées et formatées
this.consultationService.createConsultation(data)
  .subscribe({
    next: (result) => { /* succès */ },
    error: (errorMessage: string) => {
      // errorMessage contient un message d'erreur français lisible
      this.showErrorMessage(errorMessage);
    }
  });
```

### Messages d'erreur automatiques :
- `400` → "Données de consultation invalides"
- `401` → "Non autorisé - Veuillez vous reconnecter"
- `403` → "Accès interdit"
- `404` → "Consultation non trouvée"
- `409` → "Conflit - La consultation existe déjà"
- `422` → "Données de consultation non valides"
- `500` → "Erreur serveur - Veuillez réessayer plus tard"

## 🎨 Intégration avec les composants

### Exemple complet dans un composant

```typescript
@Component({
  selector: 'app-consultation-manager',
  template: `
    <div class="consultation-manager">
      <!-- Liste des consultations -->
      <div *ngFor="let consultation of consultations">
        {{ consultation.date | date }} - {{ consultation.observation }}
      </div>
      
      <!-- Statistiques -->
      <div class="stats" *ngIf="stats">
        Total: {{ stats.totalConsultations }}
      </div>
    </div>
  `
})
export class ConsultationManagerComponent implements OnInit {
  consultations: ConsultationResponse[] = [];
  stats: any;

  constructor(private consultationService: ConsultationService) {}

  ngOnInit() {
    this.loadData();
    this.subscribeToCache();
  }

  private loadData() {
    const grossesseId = 'abc123';
    
    // Charger les consultations
    this.consultationService.getConsultationsByGrossesseSimple(grossesseId)
      .subscribe(consultations => {
        this.consultations = consultations;
      });
    
    // Charger les statistiques
    this.consultationService.getConsultationStats(grossesseId)
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  private subscribeToCache() {
    // S'abonner aux changements du cache
    this.consultationService.consultations$
      .subscribe(consultations => {
        this.consultations = consultations;
      });
  }
}
```

## 🚀 Bonnes pratiques

### 1. Utilisation du cache
- Le cache est automatiquement mis à jour lors des opérations CRUD
- Utilisez `consultations$` pour les mises à jour en temps réel
- Videz le cache si nécessaire avec `clearCache()`

### 2. Gestion des abonnements
```typescript
export class MonComposant implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.consultationService.consultations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(consultations => {
        // Traitement des données
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. Optimisation des performances
- Utilisez la pagination pour les grandes listes
- Exploitez le cache pour éviter les appels API redondants
- Utilisez `getConsultationsByGrossesseSimple()` pour les affichages simples

## 📊 Endpoints API supportés

Le service supporte les endpoints suivants :

```
GET    /consultations                     - Liste paginée
POST   /consultations                     - Créer
GET    /consultations/{id}               - Récupérer par ID
PUT    /consultations/{id}               - Mettre à jour
DELETE /consultations/{id}               - Supprimer
GET    /consultations/grossesse/{id}     - Par grossesse
GET    /consultations/search             - Recherche
GET    /consultations/stats              - Statistiques
GET    /consultations/templates          - Modèles
POST   /consultations/from-template      - Créer depuis modèle
GET    /consultations/grossesse/{id}/export/pdf   - Export PDF
GET    /consultations/grossesse/{id}/export/excel - Export Excel
GET    /consultations/grossesse/{id}/check-due    - Vérifier échéance
```

## ✨ Conclusion

Le `ConsultationService` fournit une interface complète et robuste pour la gestion des consultations médicales avec :

- 🔄 Cache intelligent automatique
- 🛡️ Gestion d'erreurs robuste
- 📊 Fonctionnalités avancées (stats, export, modèles)
- 🎯 API simple et intuitive
- ⚡ Optimisations de performance intégrées

Il constitue une base solide pour développer des interfaces utilisateur riches et réactives pour la gestion des consultations dans l'application Omoumati. 