export interface CarDetails {
  id?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  mileage: number;
  imageUrl?: string;
  title: string;
  imageCount?: number;
}

export interface CostBreakdownItem {
  category: string;
  cost: number;
  frequency: string; // ex: "Annuel", "Tous les 2 ans", "Variable"
}

export interface CostEstimation {
  maintenanceYearly: {
    min: number;
    max: number;
    average: number;
    level: 'low' | 'medium' | 'high';
    breakdown: CostBreakdownItem[];
  };
  insuranceYearly: {
    min: number;
    max: number;
    average: number;
    level: 'low' | 'medium' | 'high';
  };
  fuel: {
    consumptionLiters: number; // L/100km ou kWh/100km
    monthlyCost: number;      // Coût estimé par mois
    unit: 'L/100km' | 'kWh/100km';
  };
  reliabilityScore: number; // 0 to 10
  commonIssues: string[];
}

// NIVEAU 1 : Verdict Rapide Local
export interface DealVerdict {
  status: 'good' | 'fair' | 'bad' | 'unknown';
  label: string;
  color: string;
  priceGapPercent?: number; // ex: -12 (pour 12% moins cher)
}

// NIVEAU 2 & 3 : Réponse IA Structurée
export interface AIAnalysisResponse {
  dealQuality: 'good' | 'fair' | 'bad';
  dealSummary: string; // Phrase courte "Prix 12% sous le marché"
  estimatedRealPrice: number;
  
  annualCosts: {
    fuel: number;
    maintenance: number;
    insurance: number;
    total: number;
  };
  
  fuelConsumption: number;
  fuelUnit: string;

  reliabilityScore: number; // 0-10
  topWarnings: string[]; // Top 3 pour le niveau 2
  
  // Niveau 3 (Détails)
  detailedAnalysis: {
    pros: string[];
    cons: string[];
    maintenanceAdvice: string;
    modelReliabilityDetails: string;
  };
}