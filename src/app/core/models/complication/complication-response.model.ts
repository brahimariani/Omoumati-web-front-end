import { AccouchementResponse } from "../accouchement/accouchement-response.model";
import { GrossesseResponse } from "../grossesse/grossesse-response.model";
import { NaissanceResponse } from "../naissance/naissance-response.model";

export interface ComplicationResponse {
    id: string;
    nature: string;
    date: Date;
    lieu: string; 
    observation: string;
}
