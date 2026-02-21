export const POSITIONS = [
  'Directeur général',
  'Directeur technique',
  'Directeur administratif et financier',
  'Conducteur de travaux',
  'Chef de chantier',
  "Chef d'équipe",
  "Chargé d'affaires",
  'Responsable QSE',
  'Assistant(e) QSE',
  'Responsable RH',
  'Technicien réseaux',
  'Technicien fibre optique',
  'Monteur électricien',
  'Monteur réseaux',
  'Terrassier',
  'Chauffeur PL/SPL',
  'Chargé(e) de formation',
  'Assistant(e) administratif(ve)',
  'Assistant(e) de direction',
  'Comptable',
  'Magasinier',
  'Dessinateur / Projeteur',
  'Autre',
] as const;

export type Position = (typeof POSITIONS)[number];

export const CONTRACT_TYPES = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'interim', label: 'Intérim' },
  { value: 'apprentissage', label: 'Apprentissage' },
  { value: 'professionnalisation', label: 'Contrat pro' },
  { value: 'stage', label: 'Stage' },
] as const;

export const EMERGENCY_RELATIONSHIPS = [
  'Conjoint(e)',
  'Parent',
  'Enfant',
  'Frère/Soeur',
  'Ami(e)',
  'Autre',
] as const;
