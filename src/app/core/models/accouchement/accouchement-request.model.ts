import { GrossesseResponse } from "../grossesse/grossesse-response.model";

export interface AccouchementRequest {
  date: Date;
  modaliteExtraction: string;
  lieu: string;
  assisstanceQualifiee: boolean;
  observation: string;
  idPatient: string;
  grossesse: GrossesseResponse;
}

