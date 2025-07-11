/**
 * Configuration d'environnement de production
 */
export const environment = {
  production: true,
  apiUrl: '/api', // URL relative pour la production
  authApiUrl: '/auth',
  apiTimeout: 30000,
  defaultLanguage: 'fr',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiryKey: 'token_expiry'
}; 