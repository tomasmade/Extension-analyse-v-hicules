import { CarDetails } from '../types';

export interface PreciseCarData {
  id: string;
  matchKeywords: string[]; // Mots clés pour reconnaitre le véhicule dans le titre (ex: ["clio", "5"], ["model 3"])
  maintenanceCost: number;
  insuranceCost: number;
  reliabilityScore: number; // 0-10
  realConsumption: {
    diesel?: number;
    petrol?: number;
    electric?: number; // kWh/100km
    hybrid?: number;
  };
  knownIssues: string[];
  specificAdvice: string;
}

// Données basées sur les statistiques réelles (L'argus, Caradisiac, SRA) pour les best-sellers
export const CAR_DATABASE: PreciseCarData[] = [
  {
    id: 'renault_clio_5',
    matchKeywords: ['clio', '5'], // Clio V
    maintenanceCost: 550,
    insuranceCost: 650,
    reliabilityScore: 8,
    realConsumption: { petrol: 6.2, diesel: 4.8, hybrid: 4.5 },
    knownIssues: ['Bug tablette EasyLink (fréquent)', 'Bruits d\'air sur autoroute'],
    specificAdvice: 'Excellente polyvalente. La version Hybride E-Tech est très économe en ville.'
  },
  {
    id: 'peugeot_208_2',
    matchKeywords: ['208'], // Générique 208 (souvent II)
    maintenanceCost: 680,
    insuranceCost: 720,
    reliabilityScore: 5, // Note basse à cause du PureTech
    realConsumption: { petrol: 6.5, diesel: 5.0, electric: 16.5 },
    knownIssues: ['Moteur 1.2 PureTech : Courroie de distribution (Vérifier si changée !)', 'Réservoir AdBlue (Diesel)', 'Bug écran tactile'],
    specificAdvice: '⚠️ Attention sur les moteurs essence PureTech : exigez la preuve du changement de courroie.'
  },
  {
    id: 'citroen_c3',
    matchKeywords: ['c3'],
    maintenanceCost: 600,
    insuranceCost: 600,
    reliabilityScore: 6,
    realConsumption: { petrol: 6.4, diesel: 4.9 },
    knownIssues: ['Moteur 1.2 PureTech (Courroie)', 'Usure prématurée pneus avant'],
    specificAdvice: 'Très confortable. Mêmes points de vigilance moteur que la Peugeot 208.'
  },
  {
    id: 'dacia_sandero',
    matchKeywords: ['sandero'],
    maintenanceCost: 450,
    insuranceCost: 500,
    reliabilityScore: 8,
    realConsumption: { petrol: 6.8, diesel: 5.2, hybrid: 7.5 }, // GPL souvent
    knownIssues: ['Bruits parasites habitacle', 'Embrayage parfois fragile'],
    specificAdvice: 'Le champion du coût d\'utilisation. Rustique mais très fiable.'
  },
  {
    id: 'tesla_model_3',
    matchKeywords: ['tesla', 'model 3'],
    maintenanceCost: 250,
    insuranceCost: 1100,
    reliabilityScore: 9, // Très peu de panne mécanique
    realConsumption: { electric: 15.5 },
    knownIssues: ['Alignement carrosserie', 'Peinture fragile', 'Bras de suspension (bruit)'],
    specificAdvice: 'Entretien quasi nul. Attention au prix de l\'assurance qui a augmenté récemment.'
  },
  {
    id: 'vw_golf_7',
    matchKeywords: ['golf', 'vii', '7'],
    maintenanceCost: 850,
    insuranceCost: 950,
    reliabilityScore: 8,
    realConsumption: { petrol: 7.0, diesel: 5.5, hybrid: 2.0 }, // GTE
    knownIssues: ['Boîte DSG (Vérifier vidange tous les 60k km)', 'Pompe à eau'],
    specificAdvice: 'Valeur sûre. La boîte auto DSG est un régal mais doit être entretenue rigoureusement.'
  },
  {
    id: 'toyota_yaris',
    matchKeywords: ['yaris'],
    maintenanceCost: 500,
    insuranceCost: 600,
    reliabilityScore: 9.5,
    realConsumption: { hybrid: 4.2, petrol: 6.0 },
    knownIssues: ['Aucun problème majeur', 'Plastiques intérieurs fragiles'],
    specificAdvice: 'La référence absolue en fiabilité, surtout en Hybride.'
  },
  {
    id: 'mg_4',
    matchKeywords: ['mg4', 'mg 4'],
    maintenanceCost: 350,
    insuranceCost: 850,
    reliabilityScore: 7,
    realConsumption: { electric: 17.0 },
    knownIssues: ['Fuites d\'huile (différentiel)', 'Bugs logiciel fréquents'],
    specificAdvice: 'Rapport prix/perf imbattable, mais logiciel parfois capricieux.'
  }
];

export const findPreciseCarData = (title: string, make: string): PreciseCarData | null => {
  const normalizedTitle = title.toLowerCase();
  
  // Recherche par mot-clés
  return CAR_DATABASE.find(car => {
    // Vérifie si TOUS les mots clés sont présents dans le titre ou le modèle
    return car.matchKeywords.every(keyword => normalizedTitle.includes(keyword));
  }) || null;
};