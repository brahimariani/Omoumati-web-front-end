import { ConsultationResponse } from "../consultation/consultation-response.model";

export interface TraitementResponse {
  id: string;
  medicament: string;
  posologie: string;
  dateDebut: Date;
  dateFin: Date;
  observation: string;
  consultation: ConsultationResponse;
}
