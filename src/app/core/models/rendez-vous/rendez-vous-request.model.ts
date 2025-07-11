import { StatutRendezVous } from "./statut.model";

export interface RendezVousRequestDto {
  date: string;
  motif: string;
  statut: StatutRendezVous;
  patiente: string;
  centre: string;
}
