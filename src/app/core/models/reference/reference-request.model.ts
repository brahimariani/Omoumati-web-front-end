import { StatutReference } from './statut.model';

export interface ReferenceRequest {
  date: Date;
  motif: string;
  statut: StatutReference;
  patiente: string;
  centreOrigine: string;
  centreDestination: string;
}
