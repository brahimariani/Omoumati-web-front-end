/**
 * Configuration d'environnement par défaut (développement)
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api', // URL de l'API microservices
  authApiUrl: 'http://localhost:8080/api/serviceetablissements/v1/auth',
  parientesApiUrl: 'servicepatientes/v1/',
  etablissementApiUrl: 'serviceetablissements/v1/',
  grossesseApiUrl: 'servicegrossesses/v1/',
  diagnostiqueApiUrl:'servicediagnostique/v1/',
  referencesApiUrl: 'servicerefsetrdvs/v1/',
  rendezVousApiUrl: 'servicerefsetrdvs/v1/',
  apiTimeout: 30000, // Timeout des requêtes en ms
  defaultLanguage: 'fr',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiryKey: 'token_expiry'
}; 