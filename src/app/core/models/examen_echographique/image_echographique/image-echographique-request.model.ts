/**
 * Modèle de requête pour une image échographique
 */
export interface ImageEchographiqueRequest {
  chemin: string;
  titre: string;
  examenEchographiqueId?: string;
}
