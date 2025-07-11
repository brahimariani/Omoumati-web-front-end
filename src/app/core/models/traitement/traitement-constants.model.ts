// Types TypeScript pour les constantes
export type MedicamentCategory = 'antibiotique' | 'vitamine' | 'antalgique' | 'antispasmodique' | 'hormone';
export type Indication = 'infection' | 'prevention' | 'douleur' | 'spasme' | 'regulation' | 'autre';

// ============================
//   MÉDICAMENTS PAR CATÉGORIE
// ============================

export const ANTIBIOTIQUES_SUGGESTIONS: string[] = [
  'Amoxicilline',
  'Amoxicilline + Acide clavulanique',
  'Céfalexine',
  'Érythromycine',
  'Azithromycine',
  'Clarithromycine',
  'Clindamycine',
  'Métronidazole',
  'Nitrofurantoïne',
  'Fosfomycine',
  'Pénicilline V'
];

export const VITAMINES_SUPPLEMENTS_SUGGESTIONS: string[] = [
  'Acide folique',
  'Fer (sulfate ferreux)',
  'Calcium',
  'Vitamine D',
  'Vitamine B12',
  'Magnésium',
  'Zinc',
  'Multivitamines prénatales',
  'Omega-3 (DHA)',
  'Probiotiques',
  'Vitamine C'
];

export const ANTALGIQUES_SUGGESTIONS: string[] = [
  'Paracétamol',
  'Paracétamol + Codéine',
  'Codéine',
  'Tramadol (avec précaution)',
  'Morphine (cas exceptionnels)',
  'Ibuprofène (1er trimestre uniquement)',
  'Néfopam'
];

export const ANTISPASMODIQUES_SUGGESTIONS: string[] = [
  'Phloroglucinol',
  'Papavérine',
  'Atropine (faible dose)',
  'Salbutamol',
  'Ritodrine'
];

export const HORMONES_SUGGESTIONS: string[] = [
  'Progestérone',
  'Progestérone micronisée',
  'Dydrogestérone',
  'Corticostéroïdes (Bétaméthasone)',
  'Insuline',
  'Thyroxine'
];

// ============================
//   POSOLOGIES COURANTES
// ============================

export const POSOLOGIES_COURANTES: string[] = [
  '1 comprimé x 1/jour',
  '1 comprimé x 2/jour',
  '1 comprimé x 3/jour',
  '2 comprimés x 1/jour',
  '2 comprimés x 2/jour',
  '1/2 comprimé x 1/jour',
  '1/2 comprimé x 2/jour',
  '5 ml x 1/jour',
  '5 ml x 2/jour',
  '5 ml x 3/jour',
  '10 ml x 1/jour',
  '10 ml x 2/jour',
  '1 gélule x 1/jour',
  '1 gélule x 2/jour',
  '1 injection x 1/jour',
  '1 suppositoire x 1/jour',
  '1 suppositoire x 2/jour',
  'Selon prescription médicale'
];

// ============================
//   DURÉES DE TRAITEMENT
// ============================

export const DUREES_TRAITEMENT: string[] = [
  '3 jours',
  '5 jours',
  '7 jours',
  '10 jours',
  '14 jours',
  '21 jours',
  '1 mois',
  '2 mois',
  '3 mois',
  '6 mois',
  'Jusqu\'à l\'accouchement',
  'Selon évolution',
  'Traitement ponctuel'
];

// ============================
//   MÉDICAMENTS PAR INDICATION
// ============================

export const MEDICAMENTS_PAR_INDICATION: Record<Indication, string[]> = {
  infection: [...ANTIBIOTIQUES_SUGGESTIONS],
  prevention: [
    'Acide folique',
    'Fer (sulfate ferreux)',
    'Calcium',
    'Vitamine D',
    'Multivitamines prénatales'
  ],
  douleur: [...ANTALGIQUES_SUGGESTIONS],
  spasme: [...ANTISPASMODIQUES_SUGGESTIONS],
  regulation: [...HORMONES_SUGGESTIONS],
  autre: [
    'Domperidone',
    'Métoclopramide',
    'Smecta',
    'Lactulose',
    'Hépar'
  ]
};

// ============================
//   POSOLOGIES PAR MÉDICAMENT
// ============================

export const MEDICAMENTS_POSOLOGIES: Record<string, string[]> = {
  'Amoxicilline': ['1 comprimé x 3/jour', '2 comprimés x 2/jour'],
  'Paracétamol': ['1 comprimé x 3/jour', '2 comprimés x 3/jour'],
  'Acide folique': ['1 comprimé x 1/jour'],
  'Fer (sulfate ferreux)': ['1 comprimé x 1/jour', '1 comprimé x 2/jour'],
  'Calcium': ['1 comprimé x 2/jour', '2 comprimés x 1/jour'],
  'Vitamine D': ['1 comprimé x 1/jour'],
  'Phloroglucinol': ['1 comprimé x 3/jour', '2 comprimés x 3/jour'],
  'Progestérone': ['1 gélule x 1/jour', '1 gélule x 2/jour'],
  'Érythromycine': ['1 comprimé x 2/jour', '1 comprimé x 3/jour'],
  'Métronidazole': ['1 comprimé x 2/jour', '1 comprimé x 3/jour']
};

// ============================
//   CONTRE-INDICATIONS PAR TRIMESTRE
// ============================

export const CONTRE_INDICATIONS_TRIMESTRE: Record<string, {
  premier: boolean;
  deuxieme: boolean;
  troisieme: boolean;
  allaitement: boolean;
}> = {
  'Ibuprofène': {
    premier: false,
    deuxieme: true,
    troisieme: true,
    allaitement: true
  },
  'Aspirine': {
    premier: true,
    deuxieme: true,
    troisieme: true,
    allaitement: false
  },
  'Tétracycline': {
    premier: true,
    deuxieme: true,
    troisieme: true,
    allaitement: true
  },
  'Warfarine': {
    premier: true,
    deuxieme: true,
    troisieme: true,
    allaitement: true
  }
};

// ============================
//   INSTRUCTIONS SPÉCIALES
// ============================

export const INSTRUCTIONS_SPECIALES: string[] = [
  'À prendre pendant les repas',
  'À prendre à jeun',
  'À prendre au coucher',
  'À distance des repas',
  'Avec un grand verre d\'eau',
  'Surveillance de la tension artérielle',
  'Surveillance de la glycémie',
  'Éviter l\'exposition solaire',
  'Arrêter en cas d\'effets secondaires',
  'Contrôle médical régulier'
]; 