import { AccouchementResponse } from "../accouchement/accouchement-response.model";
import { GrossesseResponse } from "../grossesse/grossesse-response.model";
import { NaissanceResponse } from "../naissance/naissance-response.model";

export interface ComplicationRequest {
    nature: string;
    date: Date;
    lieu: string; 
    observation: string;
    grossesse?: GrossesseResponse | null;
    accouchement?: AccouchementResponse | null;
    naissance?: NaissanceResponse | null;
}
