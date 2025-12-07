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

export interface AIAnalysis {
  pros: string[];
  cons: string[];
  verdict: string;
}