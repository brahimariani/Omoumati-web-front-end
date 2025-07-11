import { TypeCentre } from "./typecentre.model";

export interface CentreRequest {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  siteWeb: string;
  type: TypeCentre;
}