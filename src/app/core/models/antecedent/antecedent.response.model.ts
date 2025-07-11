import { PatienteResponse } from "../patiente/patiente.response.model";

export interface AntecedentResponse {
  id: string;
  nature: string;
  type: string;
  observation: string;
  date: Date;
  lieu: string;
  ageGestationnel: number;
  membreFamille: string;
  patiente: PatienteResponse;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
