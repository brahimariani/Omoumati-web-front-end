import { AccouchementResponse } from "../accouchement/accouchement-response.model";

export interface NaissanceRequest {
  poids: number;
  perimetreCranien: number;
  sexe: string;
  estVivant: boolean;
  accouchement: AccouchementResponse;
}
