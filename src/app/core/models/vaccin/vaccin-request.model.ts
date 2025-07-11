export interface VaccinRequestDto {
    nom: string;
    date: Date;
    patienteId: string;
    naissanceId: string;
}


export const VACCINS_SUGGESTIONS= [
    'VAT 1',
    'VAT 2', 
    'VAT 3',
    'VAT 4',
    'VAT 5',
    'Rubéole',
    'Hépatite B', 
    'Frottis cervical',
    'IVA (mois de 3 ans)',
    'BCG',
    'HB'
] as const;
