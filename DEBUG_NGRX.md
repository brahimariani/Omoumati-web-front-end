# 🐛 Debug NgRx - Guide de Résolution

## ❌ **Erreur Corrigée**
```
ERROR NullInjectorError: No provider for _StoreRootModule!
```

## 🔧 **Solution Appliquée**

### 1. **Suppression de la double configuration NgRx**
- ✅ Supprimé `StoreModule.forFeature()` et `EffectsModule.forFeature()` du module auth
- ✅ Gardé uniquement la configuration racine dans `app.config.ts`

### 2. **Configuration Correcte**

#### `app.config.ts` (✅ Correct)
```typescript
provideStore(reducers, { metaReducers }),
provideEffects(AuthEffects, PatientsEffects),
```

#### `auth.module.ts` (✅ Corrigé)
```typescript
// Supprimé :
// StoreModule.forFeature('auth', authReducer)
// EffectsModule.forFeature([AuthEffects])
```

## 🚀 **Test de Fonctionnement**

### Démarrer l'application :
```bash
ng serve
```

### Vérifications dans la console :
1. **Aucune erreur NgRx** au démarrage
2. **Store initialisé** correctement
3. **Actions et Effects** fonctionnels

### Tests à effectuer :
1. ✅ L'application démarre sans erreur
2. ✅ Redirection vers `/auth/login` fonctionne
3. ✅ Pages d'authentification s'affichent
4. ✅ Layout ne s'affiche que pour les routes protégées

## 🔍 **Débogage Avancé**

### Si l'erreur persiste :

#### 1. Vérifier les imports
```typescript
// Dans app.config.ts, s'assurer que tous les imports sont corrects
import { reducers, metaReducers } from './store';
import { AuthEffects } from './store/auth';
import { PatientsEffects } from './store/patients';
```

#### 2. Vérifier la structure du store
```typescript
// Dans store/index.ts
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  router: routerReducer,
  patients: patientsReducer,
};
```

#### 3. Nettoyer et rebuilder
```bash
rm -rf node_modules dist .angular
npm install
ng serve
```

## 📊 **État Attendu**

### Console du navigateur (DevTools) :
```
🚀 App Component Init: {
  isLoggedIn: false,
  token: false,
  currentUrl: "http://localhost:4200/"
}

[Action]: @ngrx/store/init
[Action]: @ngrx/effects/init
```

### URL Navigation :
- `http://localhost:4200/` → Redirige vers `http://localhost:4200/auth/login`
- Pages d'auth sans layout
- Routes protégées avec layout

## ⚠️ **Problèmes Courants**

### Si "Cannot find module" :
```bash
# Vérifier les chemins d'import
npm run build -- --dry-run
```

### Si store non initialisé :
```typescript
// Vérifier que provideStore() est bien dans app.config.ts
// Et que les reducers sont correctement exportés
```

### Si effects non lancés :
```typescript
// Vérifier que provideEffects() inclut tous les effects
provideEffects(AuthEffects, PatientsEffects),
```

---

**Status** : ✅ Problème résolu - NgRx configuré correctement 