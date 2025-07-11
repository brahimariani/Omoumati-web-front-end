/**
 * Modèle pour la mise à jour du profil utilisateur
 * Contient uniquement les champs modifiables par l'utilisateur
 */
export interface UtilisateurUpdateProfileRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  matricule: string;
} 