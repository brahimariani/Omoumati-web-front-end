
import { CentreResponse } from '../centre/centre.response.model';
import { PatienteResponse } from '../patiente/patiente.response.model';
import { StatutReference } from './statut.model';

export interface ReferenceResponse {
  id: string;
  date: Date;
  motif: string;
  statut: StatutReference;
  patiente: PatienteResponse;
  centreOrigine: CentreResponse;
  centreDestination: CentreResponse;
  createdAt: Date;
  updatedAt: Date;
}

