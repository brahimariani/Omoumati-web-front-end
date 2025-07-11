export interface AntecedentRequest {
  nature: string;
  type: string;
  observation: string;
  date: Date; 
  lieu: string;
  ageGestationnel: number;
  membreFamille: string;
  patienteId: string; 
}

export const NATURES = ['Femme', 'Héréditaire', 'Obstetrical'];

export const TYPES_FEMME = [
  'Medical',
  'Chirugical', 
  'Gynécologique',
  'Autre'
];

export const TYPES_HEREDITAIRE = [
  'HTA',
  'Diabète', 
  'Maladies Héréditaires',
  'Malformations',
  'Alergies',
  'Autre'
];

export const TYPES_OBSTETRICAL = [
  'Avortement',
  'Accouchement prématuré',
  'Mort foetale in utéro', 
  'Autre'
];
