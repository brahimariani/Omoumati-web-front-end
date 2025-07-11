import { Groupage } from "./groupage.model";
import { NiveauInstruction } from "./niveauinstruction.model";
import { Rhesus } from "./rhesus.model";
import { Sexe } from "./sexe.model";

/**
 * Interface pour les données de patiente retournées par l'API
 */
export interface PatienteResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  telephoneMari: string;
  adresse: string;
  profession: string;
  professionMari: string;
  consanguinite: boolean;
  dateNaissance: Date;
  cin: string;
  rhesus: Rhesus;
  groupageSanguin: Groupage;
  niveauInstruction: NiveauInstruction;
  observation: string;
  sexe: Sexe;
  createdAt: Date;
  updatedAt: Date;
}