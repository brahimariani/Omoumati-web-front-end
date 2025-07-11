import { CentreResponse } from "../centre/centre.response.model";
import { PatienteResponse } from "../patiente/patiente.response.model";
import { StatutRendezVous } from "./statut.model";

export interface RendezVousResponseDto {
  id: string;
  date: string;
  motif: string;
  statut: StatutRendezVous;
  patiente: PatienteResponse;
  centre: CentreResponse;
  createdAt: string;
  updatedAt: string;
}


