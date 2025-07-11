import { AccouchementResponse } from "../accouchement/accouchement-response.model";
import { PatienteResponse } from "../patiente/patiente.response.model";

export interface GrossesseResponse {
  id: string;
  gestation: number;
  parite: number;
  dateDerniereRegle: Date;
  datePrevueAccouchment: Date;
  dateDepacementTerme: Date;
  estDesiree: boolean;
  accouchement: AccouchementResponse;
  patiente: PatienteResponse;
}

