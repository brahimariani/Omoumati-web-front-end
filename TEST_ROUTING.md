# 🧪 Guide de Test - Routing Sécurisé

## 📋 Tests à Effectuer

### 1. **Test Utilisateur Non Connecté**
```
Étapes :
1. Vider le localStorage : localStorage.clear()
2. Naviguer vers http://localhost:4200/
3. Vérifier la redirection vers http://localhost:4200/auth/login

Résultat attendu : ✅ Page de connexion s'affiche
```

### 2. **Test Redirection après Connexion**
```
Étapes :
1. Se connecter avec des identifiants valides
2. Vérifier la redirection automatique vers /patientes

Résultat attendu : ✅ Liste des patientes s'affiche avec layout
```

### 3. **Test Protection des Routes**
```
Étapes :
1. Sans être connecté, tenter d'accéder à http://localhost:4200/patientes
2. Vérifier la redirection vers login avec returnUrl

Résultat attendu : ✅ Redirection vers /auth/login?returnUrl=/patientes
```

### 4. **Test Anti-Double Connexion**
```
Étapes :
1. Se connecter
2. Naviguer manuellement vers http://localhost:4200/auth/login
3. Vérifier la redirection automatique vers /patientes

Résultat attendu : ✅ Redirection automatique vers le dashboard
```

### 5. **Test des Rôles**
```
Étapes :
1. Se connecter avec un compte NURSE
2. Tenter d'accéder à /patientes/new
3. Vérifier l'affichage du message d'erreur

Résultat attendu : ✅ Message "Accès refusé" + redirection
```

## 🔧 Debug Console

Ouvrir les DevTools et vérifier les logs :

### Logs Normaux (Utilisateur Non Connecté)
```
🚀 App Component Init: {
  isLoggedIn: false,
  token: false,
  currentUrl: "http://localhost:4200/"
}

🔒 AuthGuard Debug: {
  isLoggedIn: false,
  currentPath: "/patientes",
  token: false
}

❌ Utilisateur non authentifié - redirection vers login
```

### Logs Normaux (Utilisateur Connecté)
```
🚀 App Component Init: {
  isLoggedIn: true,
  token: true,
  currentUrl: "http://localhost:4200/patientes"
}

🔒 AuthGuard Debug: {
  isLoggedIn: true,
  currentPath: "/patientes", 
  token: true
}

✅ Utilisateur authentifié - accès autorisé
```

## 🚨 Problèmes Courants

### Boucle de Redirection
**Symptôme :** URL reste à http://localhost:4200/
**Cause :** Configuration incorrecte des routes ou état d'auth incohérent
**Solution :** Vérifier les logs console et l'état du localStorage

### Layout ne s'affiche pas
**Symptôme :** Pages d'auth avec layout ou pages protégées sans layout
**Cause :** Structure des routes incorrecte
**Solution :** Vérifier la hiérarchie des routes dans app.routes.ts

### AuthGuard ne fonctionne pas
**Symptôme :** Accès à des routes protégées sans authentification
**Cause :** Guard pas appliqué ou problème de service
**Solution :** Vérifier l'application des guards et l'état AuthService

## 💾 État LocalStorage

Vérifier le contenu du localStorage pour debug :

```javascript
// Dans la console du navigateur
console.log('Auth Token:', localStorage.getItem('auth_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
console.log('Token Expiry:', localStorage.getItem('token_expiry'));
```

## 🔄 Reset Complet

En cas de problème persistant :

```javascript
// Nettoyer complètement l'état
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

**Comment utiliser ce guide :**
1. Lancer `ng serve`
2. Ouvrir la console des DevTools  
3. Suivre chaque test dans l'ordre
4. Vérifier les résultats attendus
5. Examiner les logs pour déboguer 