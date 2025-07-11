import { StatutUtilisateur } from './statututilisateur.model';
import { RoleResponse } from '../role/role.response.model';
import { CentreResponse } from '../centre/centre.response.model';

/**
 * Modèle de requête pour la mise à jour d'un utilisateur
 * Tous les champs sont optionnels pour permettre des mises à jour partielles
 */
export interface UtilisateurUpdateRequest {
  matricule?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  password?: string; // Optionnel - seulement si on veut changer le mot de passe
  statut?: StatutUtilisateur;
  role?: {
    id: string;
    nom?: string;
    description?: string;
    utilisateurs?: any[];
  };
  centre?: {
    id: string;
    nom?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    siteWeb?: string;
    type?: 'HOPITAL' | 'CLINIQUE' | 'CENTRE_SANTE' | 'MATERNITE';
  };
}

/**
 * Utilitaire pour créer une requête de mise à jour à partir des données du formulaire
 */
export class UtilisateurUpdateHelper {
  /**
   * Crée une requête de mise à jour en excluant les champs non modifiés
   */
  static createUpdateRequest(
    formData: any,
    originalUser?: any,
    includePassword: boolean = false
  ): UtilisateurUpdateRequest {
    const updateRequest: UtilisateurUpdateRequest = {};

    // Vérifier chaque champ et l'inclure seulement s'il a changé
    if (formData.matricule && formData.matricule !== originalUser?.matricule) {
      updateRequest.matricule = formData.matricule;
    }

    if (formData.nom && formData.nom !== originalUser?.nom) {
      updateRequest.nom = formData.nom;
    }

    if (formData.prenom && formData.prenom !== originalUser?.prenom) {
      updateRequest.prenom = formData.prenom;
    }

    if (formData.email && formData.email !== originalUser?.email) {
      updateRequest.email = formData.email;
    }

    if (formData.telephone && formData.telephone !== originalUser?.telephone) {
      updateRequest.telephone = formData.telephone;
    }

    if (formData.adresse && formData.adresse !== originalUser?.adresse) {
      updateRequest.adresse = formData.adresse;
    }

    if (includePassword && formData.motDePasse && formData.motDePasse.trim() !== '') {
      updateRequest.password = formData.motDePasse;
    }

    if (formData.statut && formData.statut !== originalUser?.statut) {
      updateRequest.statut = formData.statut;
    }

    if (formData.roleId && formData.roleId !== originalUser?.role?.id) {
      updateRequest.role = {
        id: formData.roleId
      };
    }

    if (formData.centreId && formData.centreId !== originalUser?.centre?.id) {
      updateRequest.centre = {
        id: formData.centreId
      };
    }

    return updateRequest;
  }

  /**
   * Vérifie si la requête de mise à jour contient des modifications
   */
  static hasChanges(updateRequest: UtilisateurUpdateRequest): boolean {
    return Object.keys(updateRequest).length > 0;
  }
} 