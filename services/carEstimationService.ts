import { CarDetails, CostEstimation, CostBreakdownItem } from '../types';

// Tables de correspondance simplifiées (Mock Data)
const BASE_MAINTENANCE: Record<string, number> = {
  'Peugeot': 600,
  'Renault': 550,
  'BMW': 1200,
  'Tesla': 300, // Peu d'entretien
  'Audi': 1100,
  'Volkswagen': 800
};

const BASE_INSURANCE: Record<string, number> = {
  'Peugeot': 700,
  'Renault': 650,
  'BMW': 1500,
  'Tesla': 1100, // Puissance fiscale souvent élevée malgré l'électrique
  'Audi': 1400,
  'Volkswagen': 900
};

/**
 * Génère une répartition réaliste des coûts basée sur le total
 */
const generateMaintenanceBreakdown = (totalCost: number, car: CarDetails): CostBreakdownItem[] => {
  // Répartition théorique approximative
  const breakdown: CostBreakdownItem[] = [];
  
  // 1. Révision (Vidange, filtres...) ~30-40%
  const revisionCost = Math.round(totalCost * 0.35);
  breakdown.push({
    category: car.fuel === 'Électrique' ? 'Check-up système' : 'Révision (Vidange/Filtres)',
    cost: revisionCost,
    frequency: 'Annuel'
  });

  // 2. Consommables (Pneus, Freins) ~40%
  const wearCost = Math.round(totalCost * 0.40);
  breakdown.push({
    category: 'Pièces d\'usure (Pneus/Freins)',
    cost: wearCost,
    frequency: 'Moyenne lissée'
  });

  // 3. Imprévus / Divers ~25%
  const unexpectedCost = totalCost - revisionCost - wearCost;
  breakdown.push({
    category: 'Imprévus & Divers',
    cost: unexpectedCost,
    frequency: 'Variable'
  });

  return breakdown;
};

/**
 * Calcule des estimations basées sur la marque, l'année et le carburant.
 * C'est le cœur de la logique métier.
 */
export const estimateCosts = (car: CarDetails): CostEstimation => {
  const baseMaint = BASE_MAINTENANCE[car.make] || 800;
  const baseInsur = BASE_INSURANCE[car.make] || 1000;

  // Facteur d'âge: plus vieux = assurance moins chère, entretien plus cher
  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;
  
  let maintMultiplier = 1 + (age * 0.05); // +5% par an d'ancienneté
  let insurMultiplier = 1 - (age * 0.03); // -3% par an (environ)

  // Facteur motorisation
  if (car.fuel === 'Électrique') {
    maintMultiplier *= 0.6; // Moins de pièces
    insurMultiplier *= 1.1; // Souvent plus cher à réparer en carrosserie
  } else if (car.fuel === 'Diesel') {
    maintMultiplier *= 1.1;
  } else if (car.make === 'BMW' || car.make === 'Audi') {
     maintMultiplier *= 1.3; // Premium
  }

  const estMaint = Math.round(baseMaint * maintMultiplier);
  const estInsur = Math.round(baseInsur * insurMultiplier);

  // Déterminer le "niveau" visuel (low/medium/high)
  const getLevel = (val: number, type: 'maint' | 'insur') => {
     const thresholdLow = type === 'maint' ? 500 : 600;
     const thresholdHigh = type === 'maint' ? 1000 : 1200;
     if (val < thresholdLow) return 'low';
     if (val > thresholdHigh) return 'high';
     return 'medium';
  };

  return {
    maintenanceYearly: {
      min: Math.round(estMaint * 0.8),
      max: Math.round(estMaint * 1.2),
      average: estMaint,
      level: getLevel(estMaint, 'maint'),
      breakdown: generateMaintenanceBreakdown(estMaint, car)
    },
    insuranceYearly: {
      min: Math.round(estInsur * 0.8),
      max: Math.round(estInsur * 1.2),
      average: estInsur,
      level: getLevel(estInsur, 'insur')
    },
    reliabilityScore: car.make === 'Tesla' ? 7 : (car.make === 'BMW' ? 8 : 6), // Mock simple
    commonIssues: mockCommonIssues(car.make)
  };
};

const mockCommonIssues = (make: string): string[] => {
  switch(make) {
    case 'Peugeot': return ['Courroie de distribution', 'Électronique habitacle'];
    case 'BMW': return ['Fuites d\'huile', 'Pompe à eau'];
    case 'Tesla': return ['Alignement carrosserie', 'Bras de suspension'];
    default: return ['Usure prématurée pneus', 'Injecteurs'];
  }
};