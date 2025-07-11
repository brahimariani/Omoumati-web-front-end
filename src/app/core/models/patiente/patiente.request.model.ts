import { Groupage } from "./groupage.model";
import { NiveauInstruction } from "./niveauinstruction.model";
import { Rhesus } from "./rhesus.model";
import { Sexe } from "./sexe.model";

export interface PatienteRequest {
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
}