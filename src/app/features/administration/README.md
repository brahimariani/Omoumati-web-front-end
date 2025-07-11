# 🔐 Module Administration - Omoumati

## Vue d'ensemble

Le module d'administration est un espace sécurisé réservé aux administrateurs système pour la gestion des centres, utilisateurs et rôles. Il est accessible uniquement aux utilisateurs avec le rôle `ADMIN`.

## 🚀 Fonctionnalités

### ✅ Implémentées

#### 📊 Dashboard d'Administration
- **Vue d'ensemble des statistiques** système
- **Cartes de métriques** : Utilisateurs totaux, utilisateurs actifs, centres, rôles
- **Navigation rapide** vers les sections de gestion
- **Design responsive** avec animations modernes

#### 🏢 Gestion des Centres
- **Liste complète** des centres médicaux avec pagination
- **Recherche et filtrage** avancés
- **Formulaire d'ajout/modification** avec validation
- **Gestion des statuts** (Actif/Inactif)
- **Types de centres** : Hôpital, Clinique, Dispensaire, Centre de Santé, Maternité
- **Export** des données (en développement)

#### 👥 Gestion des Utilisateurs
- **Table interactive** avec tri et filtrage
- **Filtres avancés** : Rôle, Statut, Centre
- **Profils utilisateurs** avec avatar et informations détaillées
- **Gestion des statuts** : Actif, Inactif, Suspendu
- **Actions multiples** : Modifier, Suspendre, Réactiver, Supprimer
- **Réinitialisation de mot de passe**
- **Assignation aux centres**

#### 🔒 Gestion des Rôles
- **Affichage en cartes** des rôles système
- **Permissions par rôle** avec comptage des utilisateurs
- **Protection contre suppression** des rôles assignés
- **Rôles prédéfinis** : ADMIN, DOCTOR, NURSE, RECEPTIONIST

### 🚧 En développement

- Formulaires complets de rôles avec gestion des permissions
- Export des données utilisateurs
- Audit trail des actions administratives
- Gestion des permissions granulaires
- Notifications système avancées

## 🏗️ Architecture

```
src/app/features/administration/
├── administration.module.ts           # Module principal avec imports
├── administration.routes.ts           # Routes protégées par RoleGuard
├── README.md                         # Cette documentation
└── components/
    ├── administration-dashboard/     # Dashboard avec statistiques
    ├── centre-management/           # Gestion des centres
    ├── centre-form-dialog/         # Formulaire de centre
    ├── utilisateur-list/           # Liste des utilisateurs
    ├── utilisateur-details/        # Détails d'un utilisateur
    ├── utilisateur-form/           # Formulaire d'utilisateur
    ├── role-management/           # Gestion des rôles
    └── role-form-dialog/         # Formulaire de rôle
```

## 🔐 Sécurité

### Protection par Rôle
- **AuthGuard** : Vérification de l'authentification
- **RoleGuard** : Restriction exclusive au rôle `ADMIN`
- **Redirection automatique** en cas d'accès non autorisé

### Routes Sécurisées
```typescript
{
  path: 'administration',
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'ADMIN' },
  children: [...]
}
```

## 🎨 Design System

### Couleurs et Thème
- **Variables CSS** unifiées avec le design system global
- **Palette moderne** avec dégradés et animations
- **Responsive design** pour tous les écrans
- **Accessibilité** WCAG 2.1 compliant

### Composants UI
- **Cartes modernes** avec hover effects
- **Tables interactives** avec Material Design
- **Formulaires validés** avec feedback utilisateur
- **Notifications** contextuelles
- **Dialogues modaux** avec animations

## 📱 Responsive Design

### Breakpoints
- **Desktop** (1200px+) : Affichage complet
- **Tablet** (768px-1199px) : Adaptation des grilles
- **Mobile** (< 768px) : Masquage de colonnes, navigation simplifiée

### Adaptations Mobile
- **Colonnes cachées** automatiquement
- **Actions regroupées** dans des menus
- **Filtres empilés** verticalement
- **Navigation tactile** optimisée

## 🔧 Utilisation

### Accès au Module
1. **Connexion** avec un compte administrateur
2. **Navigation** via la sidebar → Administration
3. **Sélection** de la section souhaitée

### Gestion des Centres
```typescript
// Ajouter un centre
const nouveauCentre = {
  nom: 'Centre Médical',
  type: 'Hôpital',
  adresse: '123 Rue Principale',
  telephone: '+212-xxx-xxxxxx',
  email: 'contact@centre.ma',
  statut: 'ACTIF'
};
```

### Gestion des Utilisateurs
```typescript
// Créer un utilisateur
const nouvelUtilisateur = {
  prenom: 'Ahmed',
  nom: 'Benali',
  email: 'a.benali@centre.ma',
  role: 'DOCTOR',
  centreId: 1,
  statut: 'ACTIF'
};
```

## 🔄 Intégration avec les Services

### Services Backend (À implémenter)
- `CentreService` - CRUD des centres
- `UtilisateurService` - Gestion des utilisateurs
- `RoleService` - Gestion des rôles et permissions
- `AuditService` - Traçabilité des actions

### NgRx Store (Futur)
- `administration.actions.ts` - Actions d'administration
- `administration.effects.ts` - Effets pour API calls
- `administration.reducer.ts` - État d'administration
- `administration.selectors.ts` - Sélecteurs typés

## ⚡ Performance

### Optimisations
- **Lazy loading** du module entier
- **OnPush** change detection sur les composants
- **Virtual scrolling** pour les grandes listes
- **Pagination** des données

### Mise en cache
- **Données statiques** (types, rôles) en cache
- **Invalidation** automatique lors des modifications
- **Prefetching** des données critiques

## 🧪 Tests (À implémenter)

### Tests Unitaires
```bash
ng test src/app/features/administration
```

### Tests E2E
```bash
ng e2e --suite=administration
```

### Scénarios de Test
- Accès sécurisé par rôle
- CRUD complet des entités
- Validation des formulaires
- Navigation et filtrage

## 📊 Métriques et Monitoring

### KPIs Trackés
- **Temps de chargement** des pages
- **Taux d'utilisation** des fonctionnalités
- **Erreurs utilisateur** et validation
- **Actions administratives** par session

## 🚀 Déploiement

### Variables d'Environnement
```typescript
environment.administration = {
  enableAuditTrail: true,
  maxUsersPerPage: 50,
  exportFormats: ['CSV', 'PDF', 'Excel']
};
```

### Build de Production
```bash
ng build --prod --aot
```

## 📞 Support

### Logs et Debug
- **Console errors** avec contexte
- **Network monitoring** des API calls
- **User actions tracking**
- **Performance metrics**

### Documentation Technique
- [Guards Documentation](../../core/guards/README.md)
- [Services Documentation](../../core/services/README.md)
- [Design System](../../../styles/README.md)

---

**Développé pour Omoumati - Application de Gestion de Santé Maternelle**  
**Version**: 1.0.0  
**Dernière mise à jour**: 2024-01-20 