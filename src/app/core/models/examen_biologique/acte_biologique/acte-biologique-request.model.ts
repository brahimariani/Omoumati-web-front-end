import { ExamenBiologiqueResponse } from "../examen-biologique-response.model";

export interface ActeBiologiqueRequest {
  nom: string;
  valeur: string;
  unite: string;
  normesRef: string;
  examenBiologique: ExamenBiologiqueResponse;   
}
