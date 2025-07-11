import { CentreResponse } from "../centre/centre.response.model";
import { RoleResponse } from "../role/role.response.model";
import { StatutUtilisateur } from "./statututilisateur.model";

export interface UtilisateurRequest {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  password: string;
  statut: StatutUtilisateur;
  role: RoleResponse;
  centre: CentreResponse;
}