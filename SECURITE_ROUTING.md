# 🔒 Configuration de Sécurité - Routing Omoumati

## 📋 Vue d'ensemble

Le système de routing de l'application Omoumati est maintenant entièrement sécurisé avec plusieurs niveaux de protection :

### 🛡️ Guards Implémentés

#### 1. **AuthGuard** - Protection d'authentification
- **Fichier**: `src/app/core/guards/auth.guard.ts`
- **Fonction**: Vérifie si l'utilisateur est connecté
- **Redirection**: `/auth/login` avec `returnUrl`
- **Implémente**: `CanActivate`, `CanActivateChild`, `CanLoad`

#### 2. **RoleGuard** - Protection basée sur les rôles
- **Fichier**: `src/app/core/guards/role.guard.ts`
- **Fonction**: Vérifie les permissions par rôle
- **Supports**: Rôle unique (`role`) et tableaux (`roles`)
- **Redirection**: `/patientes` en cas d'accès refusé

#### 3. **AuthRedirectGuard** - Anti-double connexion
- **Fichier**: `src/app/core/guards/auth-redirect.guard.ts`
- **Fonction**: Empêche l'accès aux pages d'auth si déjà connecté
- **Redirection**: `/patientes`

### 🗺️ Configuration des Routes

#### Routes Principales (`app.routes.ts`)
```typescript
✅ Routes protégées avec AuthGuard :
- /dashboard (temporaire → /patientes)
- /patientes (ADMIN, DOCTOR, NURSE)
- Tous les modules métier

✅ Routes d'authentification avec AuthRedirectGuard :
- /auth/login
- /auth/register  
- /auth/forgot-password

✅ Route de profil protégée :
- /auth/profile (AuthGuard)
```

#### Routes du Module Patientes (`patientes.routes.ts`)
```typescript
✅ Protection granulaire :
- Liste : Tous les rôles médicaux
- Consultation : Tous les rôles médicaux  
- Création/Modification : ADMIN, DOCTOR uniquement
- Recherche : Tous les rôles médicaux
```

### 👥 Système de Rôles

#### Rôles Définis
- **ADMIN** : Accès complet, gestion utilisateurs
- **DOCTOR** : Accès médical complet, création/modification patients
- **NURSE** : Consultation et assistance médicale
- **USER** : Accès limité (futur usage)

#### Permissions par Module
| Module | ADMIN | DOCTOR | NURSE | USER |
|--------|-------|--------|-------|------|
| Patientes (lecture) | ✅ | ✅ | ✅ | ❌ |
| Patientes (écriture) | ✅ | ✅ | ❌ | ❌ |
| Diagnostique | ✅ | ✅ | ❌ | ❌ |
| Administration | ✅ | ❌ | ❌ | ❌ |

### 🔧 Services de Sécurité

#### AuthService
- **JWT Management** : Stockage et validation des tokens
- **Role Verification** : `hasRole(role: string)`
- **Session Management** : Auto-refresh, expiration
- **User State** : BehaviorSubject pour l'état utilisateur

#### SecurityService (Nouveau)
- **Permission Checking** : Vérification granulaire des accès
- **UI Permissions** : Observable des permissions d'interface
- **Resource Access** : Contrôle d'accès aux ressources

### 🚀 Flux d'Authentification Sécurisé

#### 1. Connexion
```
User → /auth/login → AuthRedirectGuard → LoginComponent
     ↓
JWT Token → AuthService → Store → Redirect to returnUrl
```

#### 2. Accès à une Route Protégée
```
User → Protected Route → AuthGuard → Check Token
     ↓                              ↓
Valid Token                    Invalid Token
     ↓                              ↓
RoleGuard → Check Permissions    Redirect /auth/login
     ↓
Allow/Deny Access
```

#### 3. Déconnexion
```
User → Logout → Clear Token → Clear Store → Redirect /auth/login
```

### 📊 Matrice de Sécurité

| Action | Auth Required | Roles Required | Guard |
|--------|---------------|----------------|-------|
| Login | ❌ | - | AuthRedirectGuard |
| Register | ❌ | - | AuthRedirectGuard |
| Dashboard | ✅ | Any | AuthGuard |
| View Patients | ✅ | ADMIN, DOCTOR, NURSE | AuthGuard |
| Create Patient | ✅ | ADMIN, DOCTOR | RoleGuard |
| Edit Patient | ✅ | ADMIN, DOCTOR | RoleGuard |
| Administration | ✅ | ADMIN | RoleGuard |

### 🛠️ Améliorations Apportées

#### ✅ Sécurité
- Protection complète des routes sensibles
- Système de rôles granulaire
- Anti-accès double aux pages d'auth
- Gestion des redirections avec `returnUrl`

#### ✅ UX/UI
- Redirection intelligente après connexion
- Messages d'erreur contextuels
- Pas de loops de redirection

#### ✅ Architecture
- Guards réutilisables et modulaires
- Service de sécurité centralisé
- Type safety avec TypeScript
- Observable pattern pour la réactivité

### 🔍 Tests de Sécurité

#### Scénarios à Valider
1. **Accès non authentifié** → Redirection vers login
2. **Accès avec rôle insuffisant** → Message d'erreur + redirection
3. **Double connexion** → Redirection automatique
4. **Token expiré** → Refresh automatique ou logout
5. **URL manipulation** → Protection maintenue

### 📝 TODO - Améliorations Futures

#### Sprint 4 - Rendez-vous
- [ ] Ajouter les permissions pour les rendez-vous
- [ ] Contrôle d'accès par patient assigné

#### Sprint 5 - Grossesses & Diagnostics  
- [ ] Permissions spécialisées par type de diagnostic
- [ ] Contrôle d'accès temporel (suivi grossesse)

#### Sécurité Avancée
- [ ] Audit trail des actions sensibles
- [ ] Rate limiting sur les API
- [ ] 2FA pour les administrateurs
- [ ] Session timeout configurable

### 🆘 Support et Maintenance

#### Logs de Sécurité
- AuthGuard : Console warnings pour debug
- RoleGuard : Notifications utilisateur des refus d'accès
- AuthService : Tracking des sessions

#### Monitoring
- Failed login attempts
- Unauthorized access attempts  
- Token refresh patterns
- Role escalation attempts

---

**Dernière mise à jour** : 2024-12-19  
**Version** : Sprint 3 - Module Authentification  
**Status** : ✅ Production Ready 