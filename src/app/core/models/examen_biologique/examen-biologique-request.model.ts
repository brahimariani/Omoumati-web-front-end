import { ActeBiologiqueRequest } from "./acte_biologique/acte-biologique-request.model";
import { ConsultationResponse } from "../consultation/consultation-response.model";

export interface ExamenBiologiqueRequest {
  observation: string;
  consultation: ConsultationResponse;
  actesBiologiques: ActeBiologiqueRequest[];
}
