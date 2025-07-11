import { ConsultationResponse } from "../consultation/consultation-response.model";

export interface ExamenCliniqueResponse {
  id: string;
  poids: number;
  taille: number;
  tensionArterielle: string;
  temperature: number;
  frequenceCardiaque: number;
  anomalieSquelette: string;
  etatConjonctives: string;
  etatSeins: string;
  oedemes: string;
  mouvements: string;
  hu: number;
  bcf: number;
  speculum: string;
  toucherVaginalEtatCol: string;
  toucherVaginalPresentation: string;
  toucherVaginalBassin: string;
  observation: string;
  consultation: ConsultationResponse;
}
