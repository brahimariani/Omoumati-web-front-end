import { RoleResponse } from "../role/role.response.model";
import { CentreResponse } from "../centre/centre.response.model";
import { StatutUtilisateur } from "./statututilisateur.model";

export interface UtilisateurResponse {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  statut: StatutUtilisateur;
  role: RoleResponse;
  centre?: CentreResponse; // Centre d'affectation de l'utilisateur
}