import { UtilisateurResponse } from "../utilisateur/utilisateur.response.model";

export interface RoleResponse {
  id: string;
  nom: string;
  description: string;
  utilisateurs: Array<UtilisateurResponse>;
}