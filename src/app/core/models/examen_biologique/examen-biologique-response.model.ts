import { ActeBiologiqueResponse } from "./acte_biologique/acte-biologique-response.model";

export interface ExamenBiologiqueResponse {
  id: string;
  observation: string;
  actesBiologiques: ActeBiologiqueResponse[];
}
