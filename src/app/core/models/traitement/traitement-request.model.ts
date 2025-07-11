import { ConsultationResponse } from "../consultation/consultation-response.model";

export interface TraitementRequest {
  medicament: string;
  posologie: string;
  dateDebut: Date;
  dateFin: Date;
  observation: string;
  consultation: ConsultationResponse;
}
