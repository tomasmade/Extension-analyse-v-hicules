import { CarDetails, CostEstimation, CostBreakdownItem } from '../types';

// Tables de correspondance simplifiées (Mock Data)
const BASE_MAINTENANCE: Record<string, number> = {
  'Peugeot': 600,
  'Renault': 550,
  'Citroen': 580,
  'Dacia': 450,
  'BMW': 1200,
  'Mercedes': 1300,
  'Tesla': 300, 
  'Audi': 1100,
  'Volkswagen': 850,
  'Toyota': 500,
  'Ford': 650
};

const BASE_INSURANCE: Record<string, number> = {
  'Peugeot': 700,
  'Renault': 650,
  'Citroen': 600,
  'Dacia': 450,
  'BMW': 1500,
  'Mercedes': 1600,
  'Tesla': 1100,
  'Audi': 1400,
  'Volkswagen': 900,
  'Toyota': 600,
  'Ford': 750
};

// Prix moyens carburants
const FUEL_PRICES = {
  'Diesel': 1.75,
  'Essence': 1.85,
  'Électrique': 0.25,
  'Hybride': 1.80
};

const generateMaintenanceBreakdown = (totalCost: number, car: CarDetails): CostBreakdownItem[] => {
  const breakdown: CostBreakdownItem[] = [];
  
  // Plus la voiture est kilométrée, plus la part "Imprévus/Réparations" augmente par rapport à la révision simple
  const isHighMileage = car.mileage > 120000;

  const revisionShare = isHighMileage ? 0.25 : 0.40; // La révision pèse moins dans le total si on a de grosses pannes
  const wearShare = 0.35;
  
  const revisionCost = Math.round(totalCost * revisionShare);
  breakdown.push({
    category: car.fuel === 'Électrique' ? 'Maintenance Système' : 'Révision annuelle',
    cost: revisionCost,
    frequency: 'Annuel'
  });

  const wearCost = Math.round(totalCost * wearShare);
  breakdown.push({
    category: 'Pièces d\'usure (Pneus/Freins)',
    cost: wearCost,
    frequency: 'Lissée sur l\'année'
  });

  const unexpectedCost = totalCost - revisionCost - wearCost;
  breakdown.push({
    category: isHighMileage ? 'Réparations & Imprévus (Risque élevé)' : 'Petits imprévus',
    cost: unexpectedCost,
    frequency: 'Variable'
  });

  return breakdown;
};

const estimateFuel = (car: CarDetails) => {
  const isElectric = car.fuel === 'Électrique' || car.fuel === 'Electrique';
  const isDiesel = car.fuel === 'Diesel';
  const kmPerMonth = 1250; // Base 15 000 km / an

  let consumption = 0;
  
  if (isElectric) {
    consumption = 16; 
    if (car.make === 'Tesla') consumption = 15;
    if (['Audi', 'BMW', 'Mercedes'].includes(car.make)) consumption = 19;
  } else {
    consumption = isDiesel ? 5.5 : 7.0;
    if (['BMW', 'Audi', 'Mercedes'].includes(car.make)) consumption += 1.5;
    if (car.make === 'Renault' && car.model.includes('Clio')) consumption -= 0.5;
    if (car.make === 'Toyota' && car.model.includes('Yaris')) consumption -= 1.0; // Hybride souvent
  }

  let pricePerUnit = FUEL_PRICES['Essence'];
  if (isDiesel) pricePerUnit = FUEL_PRICES['Diesel'];
  if (isElectric) pricePerUnit = FUEL_PRICES['Électrique'];

  const monthlyCost = (consumption / 100) * kmPerMonth * pricePerUnit;

  return {
    consumptionLiters: parseFloat(consumption.toFixed(1)),
    monthlyCost: Math.round(monthlyCost),
    unit: (isElectric ? 'kWh/100km' : 'L/100km') as 'L/100km' | 'kWh/100km'
  };
};

/**
 * Calcul du score de fiabilité (0-10)
 */
const calculateReliability = (car: CarDetails): { score: number, issues: string[] } => {
  let score = 8; // Départ optimiste
  const issues: string[] = [];

  // Marques réputées fiables
  if (['Toyota', 'Honda', 'Lexus', 'Mazda'].includes(car.make)) {
    score += 1;
    issues.push('Marque réputée très fiable');
  }
  // Marques avec soucis électroniques fréquents (stéréotype pour la démo)
  if (['Peugeot', 'Citroen', 'Renault'].includes(car.make) && car.year < 2018) {
    score -= 1;
    issues.push('Électronique parfois capricieuse');
  }

  // Facteur Kilométrage (Impact fort)
  if (car.mileage > 200000) {
    score -= 3;
    issues.push('Kilométrage très élevé : risques importants');
  } else if (car.mileage > 120000) {
    score -= 1;
    issues.push('Kilométrage avancé : prévoir pièces d\'usure');
  }

  // Facteur Âge
  const age = new Date().getFullYear() - car.year;
  if (age > 15) {
    score -= 1;
    issues.push('Véhicule ancien : étanchéité moteur à surveiller');
  }

  // Cap le score entre 1 et 10
  score = Math.max(1, Math.min(10, score));

  // Ajout de problèmes génériques si la liste est vide
  if (issues.length === 0) issues.push('Usure normale pour ce modèle');
  if (issues.length === 1 && score < 6) issues.push('Injecteurs ou Turbo à vérifier');

  return { score, issues };
};

export const estimateCosts = (car: CarDetails): CostEstimation => {
  const baseMaint = BASE_MAINTENANCE[car.make] || 800;
  const baseInsur = BASE_INSURANCE[car.make] || 1000;

  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;
  
  // ALGORITHME V2 : IMPACT DU KILOMÉTRAGE
  // +15% de coût d'entretien tous les 50 000km au-delà des premiers 50k
  const mileagePenalty = Math.max(0, Math.floor((car.mileage - 50000) / 50000) * 0.15);
  
  // +3% par an d'ancienneté (pièces vieillissantes)
  let maintMultiplier = 1 + (age * 0.03) + mileagePenalty; 
  
  // Assurance baisse avec l'âge du véhicule
  let insurMultiplier = 1 - (age * 0.02); 

  if (car.fuel === 'Électrique') {
    maintMultiplier *= 0.7; // Entretien moins cher
    insurMultiplier *= 1.15; // Assurance plus chère (experts spécialisés, pièces)
  } else if (['BMW', 'Audi', 'Mercedes'].includes(car.make)) {
     maintMultiplier *= 1.25; // Premium
  }

  const estMaint = Math.round(baseMaint * maintMultiplier);
  const estInsur = Math.round(baseInsur * Math.max(0.4, insurMultiplier)); // Min 40% du prix base

  const getLevel = (val: number, type: 'maint' | 'insur') => {
     const thresholdLow = type === 'maint' ? 600 : 700;
     const thresholdHigh = type === 'maint' ? 1200 : 1400;
     if (val < thresholdLow) return 'low';
     if (val > thresholdHigh) return 'high';
     return 'medium';
  };

  const reliability = calculateReliability(car);

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
    fuel: estimateFuel(car),
    reliabilityScore: reliability.score,
    commonIssues: reliability.issues
  };
};