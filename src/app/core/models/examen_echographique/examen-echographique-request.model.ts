import { ImageEchographiqueRequest } from './image_echographique/image-echographique-request.model';

/**
 * Modèle de requête pour un examen échographique
 */
export interface ExamenEchographiqueRequest {
  nbEmbryons: number;
  lcc: string;
  cn: string;
  bip: string;
  dat: string;
  longueurFemoral: number;
  placenta: string;
  liquideAmniotique: string;
  observation: string;
  consultationId?: string;
  images?: ImageEchographiqueRequest[];
}
