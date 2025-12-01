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

export interface CostEstimation {
  maintenanceYearly: {
    min: number;
    max: number;
    average: number;
    level: 'low' | 'medium' | 'high';
  };
  insuranceYearly: {
    min: number;
    max: number;
    average: number;
    level: 'low' | 'medium' | 'high';
  };
  reliabilityScore: number; // 0 to 10
  commonIssues: string[];
}

export interface AIAnalysis {
  pros: string[];
  cons: string[];
  verdict: string;
}
