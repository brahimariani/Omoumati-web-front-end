import { UtilisateurResponse } from "../utilisateur/utilisateur.response.model";
import { TypeCentre } from "./typecentre.model";

export interface CentreResponse {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  siteWeb: string;
  type: TypeCentre;
}