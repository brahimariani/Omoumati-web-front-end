import { ImageEchographiqueResponse } from './image_echographique/image-echographique-response.model';

/**
 * Modèle de réponse pour un examen échographique
 */
export interface ExamenEchographiqueResponse {
  id: string;
  nbEmbryons: number;
  lcc: string;
  cn: string;
  bip: string;
  dat: string;
  longueurFemoral: number;
  placenta: string;
  liquideAmniotique: string;
  observation: string;
  images: ImageEchographiqueResponse[];
}
