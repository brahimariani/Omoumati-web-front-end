# 📋 Side Panel System - Guide d'utilisation

## 🎯 Vue d'ensemble

Le système de side panel permet d'afficher des formulaires et contenus dans un panneau latéral superposé (overlay) sur l'application, offrant une expérience utilisateur fluide sans navigation entre les pages.

## 🏗️ Architecture

### Composants principaux

1. **`SidePanelService`** - Service de gestion d'état du panel
2. **`SidePanelComponent`** - Composant UI du panel overlay
3. **`SidePanelFormsService`** - Service utilitaire pour les formulaires
4. **Composants de formulaires** - Composants spécialisés pour le panel

### Structure des fichiers

```
src/app/
├── core/services/
│   ├── side-panel.service.ts           # Service principal
│   └── side-panel-forms.service.ts     # Service utilitaire
├── layout/side-panel/
│   ├── side-panel.component.ts         # Composant principal
│   └── side-panel.component.css        # Styles du panel
└── shared/components/
    └── side-panel-patient-form/        # Exemple de formulaire
        ├── side-panel-patient-form.component.ts
        ├── side-panel-patient-form.component.css
        └── ...
```

## 🚀 Utilisation rapide

### 1. Injection du service

```typescript
import { SidePanelService } from '../core/services/side-panel.service';

constructor(private sidePanelService: SidePanelService) {}
```

### 2. Ouverture d'un panel simple

```typescript
import { MonComposantFormulaire } from './mon-composant-formulaire.component';

openPanel(): void {
  this.sidePanelService.open({
    title: 'Mon Formulaire',
    component: MonComposantFormulaire,
    width: '600px', // Optionnel (défaut: 500px)
    data: {
      // Données à passer au composant
      isEdit: false,
      initialData: {}
    }
  });
}
```

### 3. Fermeture du panel

```typescript
closePanel(): void {
  this.sidePanelService.close();
}
```

## 📝 Configuration avancée

### Interface `SidePanelConfig`

```typescript
interface SidePanelConfig {
  title: string;              // Titre affiché dans l'en-tête
  component: any;              // Composant à afficher
  data?: any;                  // Données passées au composant
  width?: string;              // Largeur du panel (ex: '600px', '50%')
  showCloseButton?: boolean;   // Afficher le bouton fermer (défaut: true)
}
```

### Largeurs prédéfinies

- **Étroit** : `400px` - Pour les formulaires simples
- **Standard** : `500px` - Largeur par défaut
- **Large** : `600px` - Pour les formulaires complexes
- **Très large** : `800px` - Pour les contenus riches
- **Responsive** : `90vw` - S'adapte à l'écran

## 🎨 Styles et thèmes

### Classes CSS disponibles

```css
/* Panel principal */
.side-panel-overlay       /* Overlay de fond */
.side-panel              /* Panel principal */
.panel-header            /* En-tête du panel */
.panel-content           /* Zone de contenu */

/* Modes spéciaux */
.side-panel.narrow       /* Panel étroit (400px) */
.side-panel.wide         /* Panel large (800px) */
.side-panel.fullscreen   /* Panel plein écran */
```

### Personnalisation des couleurs

Le panel utilise les variables CSS globales :
- `--bg-primary` : Couleur de fond
- `--primary-500` : Couleur d'accent
- `--text-primary` : Couleur du texte
- `--shadow-xl` : Ombre du panel

## 📱 Responsive Design

### Breakpoints

- **Desktop** (>768px) : Panel avec largeur fixe
- **Tablet** (768px) : Panel pleine largeur
- **Mobile** (<480px) : Panel plein écran avec ajustements

### Comportement mobile

- Header adaptatif avec titre et bouton de fermeture repositionnés
- Contenu optimisé pour le défilement tactile
- Gestes de fermeture améliorés

## 🔧 Création d'un composant de formulaire

### 1. Structure de base

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SidePanelService } from '../../../core/services/side-panel.service';

@Component({
  selector: 'app-mon-formulaire',
  standalone: true,
  template: `
    <div class="form-container">
      <!-- Contenu du formulaire -->
      <div class="form-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSubmit()">
          Sauvegarder
        </button>
      </div>
    </div>
  `
})
export class MonFormulaireComponent {
  @Input() data?: any;
  @Output() onClose = new EventEmitter<void>();

  constructor(private sidePanelService: SidePanelService) {}

  onCancel(): void {
    this.sidePanelService.close();
  }

  onSubmit(): void {
    // Logique de sauvegarde
    this.sidePanelService.close();
  }
}
```

### 2. Styles recommandés

```css
.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-xl);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: auto;
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--gray-200);
}
```

## 🛠️ Service utilitaire - `SidePanelFormsService`

### Méthodes prêtes à l'emploi

```typescript
import { SidePanelFormsService } from '../core/services/side-panel-forms.service';

constructor(private sidePanelForms: SidePanelFormsService) {}

// Créer un patient
addPatient(): void {
  this.sidePanelForms.openPatientCreateForm((data) => {
    console.log('Nouveau patient:', data);
    // Logique de sauvegarde
  });
}

// Modifier un patient
editPatient(patient: any): void {
  this.sidePanelForms.openPatientEditForm(patient, (data) => {
    console.log('Patient modifié:', data);
    // Logique de mise à jour
  });
}

// Formulaire personnalisé
openCustomForm(): void {
  this.sidePanelForms.openCustomForm({
    title: 'Mon formulaire',
    component: MonComposantComponent,
    width: '700px',
    data: { /* données */ }
  });
}
```

## 📊 Exemples d'utilisation

### 1. Formulaire de patient (exemple inclus)

```typescript
// Dans patient-list.component.ts
addPatient(): void {
  this.sidePanelService.open({
    title: 'Nouvelle patiente',
    component: SidePanelPatientFormComponent,
    width: '600px',
    data: {
      isEdit: false,
      onSave: (patientData) => {
        // Dispatcher action NgRx
        this.store.dispatch(PatientsActions.addPatient({ patient: patientData }));
      }
    }
  });
}
```

### 2. Formulaire avec validation

```typescript
// Composant avec gestion d'erreurs
export class FormulaireAvecValidationComponent {
  form: FormGroup;
  errors: string[] = [];

  onSubmit(): void {
    if (this.form.valid) {
      // Traitement
      this.sidePanelService.close();
    } else {
      this.errors = this.getFormErrors();
    }
  }
}
```

### 3. Formulaire multi-étapes

```typescript
// Formulaire avec navigation interne
export class FormulaireMultiEtapesComponent {
  currentStep = 1;
  totalSteps = 3;

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
```

## 🔍 Debugging et logs

### Activation des logs

```typescript
// Dans le service, activez les logs pour déboguer
console.log('Panel ouvert:', config);
console.log('Données passées:', config.data);
```

### Vérification de l'état

```typescript
// Vérifier si le panel est ouvert
if (this.sidePanelService.isOpen) {
  console.log('Panel actuellement ouvert');
}

// Obtenir la configuration actuelle
const config = this.sidePanelService.currentConfig;
console.log('Configuration actuelle:', config);
```

## 🚧 Limitations et considérations

### Limitations actuelles

1. **Un seul panel** : Impossible d'avoir plusieurs panels ouverts simultanément
2. **Composants dynamiques** : Les composants doivent être standalone ou importés
3. **Données limitées** : Passage de données via `@Input` uniquement

### Bonnes pratiques

1. **Gestion mémoire** : Toujours nettoyer les subscriptions dans `ngOnDestroy`
2. **Validation** : Valider les données avant ouverture du panel
3. **UX** : Prévoir des états de chargement et d'erreur
4. **Accessibilité** : Gérer le focus et les lecteurs d'écran

## 🔄 Intégration avec NgRx

### Exemple avec actions NgRx

```typescript
// Dans le composant de formulaire
onSubmit(): void {
  const formData = this.form.value;
  
  // Dispatcher l'action
  this.store.dispatch(PatientsActions.addPatient({ 
    patient: formData 
  }));
  
  // Écouter le succès
  this.store.select(selectPatientsLoading).pipe(
    filter(loading => !loading),
    take(1)
  ).subscribe(() => {
    this.sidePanelService.close();
  });
}
```

## 📚 Ressources

### Documentation Material Design

- [Material Sidenav](https://material.angular.io/components/sidenav)
- [Material Dialog](https://material.angular.io/components/dialog)
- [Angular Animations](https://angular.io/guide/animations)

### Exemples de patterns

- **Overlay Pattern** : Interface non-bloquante
- **Drawer Pattern** : Navigation latérale
- **Modal Pattern** : Contenu focalisé

---

**Dernière mise à jour** : 2024-01-XX  
**Version** : 1.0.0  
**Auteur** : Équipe Omoumati 