import { CarDetails, CostEstimation, CostBreakdownItem, DealVerdict } from '../types';
import { findPreciseCarData } from './carDatabase';

// Tables de correspondance génériques (Fallback)
const SEGMENT_COSTS: Record<string, { maint: number, insur: number }> = {
  'CITY': { maint: 600, insur: 700 },     // Citadines (Clio, 208)
  'COMPACT': { maint: 800, insur: 900 },  // Compactes (Golf, 308)
  'SUV': { maint: 950, insur: 1000 },     // SUV (3008, Tiguan)
  'PREMIUM': { maint: 1300, insur: 1400 }, // BMW, Merco, Tesla
  'LUXURY': { maint: 2000, insur: 2500 }   // Porsche, etc.
};

const FUEL_PRICES = {
  'Diesel': 1.75,
  'Essence': 1.85,
  'Électrique': 0.25,
  'Electrique': 0.25,
  'Hybride': 1.80
};

const getSegment = (car: CarDetails): string => {
  const model = car.model.toUpperCase();
  const make = car.make.toUpperCase();
  
  if (make === 'PORSCHE' || make === 'MASERATI') return 'LUXURY';
  if (['BMW', 'AUDI', 'MERCEDES', 'TESLA', 'LEXUS', 'VOLVO'].includes(make)) return 'PREMIUM';
  if (model.includes('3008') || model.includes('5008') || model.includes('TIGUAN') || model.includes('X3') || model.includes('Q5')) return 'SUV';
  if (model.includes('GOLF') || model.includes('308') || model.includes('MEGANE') || model.includes('A3') || model.includes('SERIE 1')) return 'COMPACT';
  
  return 'CITY'; // Défaut
};

const generateMaintenanceBreakdown = (totalCost: number, car: CarDetails, isElectric: boolean): CostBreakdownItem[] => {
  const breakdown: CostBreakdownItem[] = [];
  const isHighMileage = car.mileage > 120000;

  const revisionShare = isElectric ? 0.2 : (isHighMileage ? 0.25 : 0.40);
  const wearShare = isElectric ? 0.5 : 0.35; // Les VE usent plus de pneus
  
  const revisionCost = Math.round(totalCost * revisionShare);
  breakdown.push({
    category: isElectric ? 'Maintenance Système' : 'Révision annuelle',
    cost: revisionCost,
    frequency: 'Annuel'
  });

  const wearCost = Math.round(totalCost * wearShare);
  breakdown.push({
    category: isElectric ? 'Pneus & Trains roulants' : 'Pièces d\'usure (Pneus/Freins)',
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

/**
 * NIVEAU 1 : VERDICT RAPIDE (Local / Sans API)
 * Calcule une estimation "Bon plan" basée sur des heuristiques simples (Année/Km/Prix)
 */
export const calculateQuickVerdict = (car: CarDetails): DealVerdict => {
  const currentYear = new Date().getFullYear();
  const carAge = Math.max(1, currentYear - car.year);
  const kmPerYear = car.mileage / carAge;

  // Logique simple pour MVP :
  // Une voiture qui roule peu (<10k/an) et qui n'est pas trop chère pour son âge est un "Bon plan"
  
  // 1. Analyse Kilométrique
  let kmStatus = 'normal';
  if (kmPerYear < 10000) kmStatus = 'low';
  if (kmPerYear > 25000) kmStatus = 'high';

  // 2. Analyse Prix (Très arbitraire sans vraie cote, basé sur des décotes théoriques)
  // Prix neuf théorique moyen par segment
  const segment = getSegment(car);
  let baseNewPrice = 20000;
  if (segment === 'SUV') baseNewPrice = 35000;
  if (segment === 'PREMIUM') baseNewPrice = 50000;
  if (segment === 'LUXURY') baseNewPrice = 90000;

  // Décote théorique : -20% an 1, puis -10%/an
  let theoreticalPrice = baseNewPrice * 0.8; // An 1
  for (let i = 1; i < carAge; i++) {
    theoreticalPrice = theoreticalPrice * 0.9;
  }
  // Ajustement km
  if (kmStatus === 'high') theoreticalPrice *= 0.8;
  if (kmStatus === 'low') theoreticalPrice *= 1.1;

  const priceGap = ((car.price - theoreticalPrice) / theoreticalPrice) * 100;

  // Verdict
  if (priceGap < -10) {
    return { 
      status: 'good', 
      label: '✓ Bon plan probable', 
      color: 'text-green-700 bg-green-50',
      priceGapPercent: Math.round(priceGap)
    };
  } else if (priceGap > 15) {
    return { 
      status: 'bad', 
      label: '⚠️ Prix élevé estimé', 
      color: 'text-red-700 bg-red-50',
      priceGapPercent: Math.round(priceGap)
    };
  } else {
    return { 
      status: 'fair', 
      label: 'Prix cohérent', 
      color: 'text-blue-700 bg-blue-50',
      priceGapPercent: Math.round(priceGap)
    };
  }
};

export const estimateCosts = (car: CarDetails): CostEstimation => {
  // 1. TENTATIVE DE RECONNAISSANCE PRÉCISE (Database)
  const preciseData = findPreciseCarData(car.title + ' ' + car.model, car.make);
  
  let baseMaint = 0;
  let baseInsur = 0;
  let reliabilityScore = 0;
  let commonIssues: string[] = [];
  let consumption = 0;
  let isVerified = false;

  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;
  const isElectric = car.fuel.toUpperCase().includes('ELECTRI') || car.fuel.toUpperCase().includes('ÉLECTRI');
  const isDiesel = car.fuel.toUpperCase().includes('DIESEL');

  if (preciseData) {
    // --- MODE PRÉCIS ---
    isVerified = true;
    baseMaint = preciseData.maintenanceCost;
    baseInsur = preciseData.insuranceCost;
    reliabilityScore = preciseData.reliabilityScore;
    commonIssues = [...preciseData.knownIssues];
    
    // Récupération consommation exacte
    if (isElectric && preciseData.realConsumption.electric) {
        consumption = preciseData.realConsumption.electric;
    } else if (isDiesel && preciseData.realConsumption.diesel) {
        consumption = preciseData.realConsumption.diesel;
    } else if (car.fuel.toUpperCase().includes('HYBRID') && preciseData.realConsumption.hybrid) {
        consumption = preciseData.realConsumption.hybrid;
    } else {
        consumption = preciseData.realConsumption.petrol || 7.0;
    }

  } else {
    // --- MODE GÉNÉRIQUE (Fallback) ---
    const segment = getSegment(car);
    const costs = SEGMENT_COSTS[segment];
    baseMaint = costs.maint;
    baseInsur = costs.insur;
    
    // Conso approximative
    if (isElectric) consumption = 17;
    else consumption = isDiesel ? 5.5 : 7.0;
    if (segment === 'SUV' && !isElectric) consumption += 1.5;

    // Fiabilité générique
    reliabilityScore = 7;
    if (car.mileage > 150000) reliabilityScore -= 2;
    commonIssues = ['Usure normale'];
  }

  // --- AJUSTEMENTS COMMUNS (Km, Age) ---
  
  // Pénalité Kilométrique
  const mileagePenalty = Math.max(0, Math.floor((car.mileage - 60000) / 40000) * 0.15);
  
  // Grosse révision des 100-120k km (Distribution souvent)
  if (car.mileage > 90000 && car.mileage < 130000 && !isElectric) {
     baseMaint += 250; // Lissage du coût de la distrib
     if (!isVerified) commonIssues.push('Grosse révision imminente (Distribution ?)');
  }

  // Calculs Finaux
  let maintMultiplier = 1 + (age * 0.02) + mileagePenalty; 
  let insurMultiplier = 1 - (age * 0.01); 

  // Ajustement Jeune Permis générique (si < 5000€ souvent jeune permis)
  if (car.price < 5000 && car.price > 1000) {
     insurMultiplier *= 1.4; // Surtaxe probable
  }

  const estMaint = Math.round(baseMaint * maintMultiplier);
  const estInsur = Math.round(baseInsur * insurMultiplier);

  // Calcul Carburant
  let fuelTypeKey = 'Essence';
  if (isDiesel) fuelTypeKey = 'Diesel';
  if (isElectric) fuelTypeKey = 'Électrique';
  
  const fuelPrice = FUEL_PRICES[fuelTypeKey as keyof typeof FUEL_PRICES] || 1.8;
  const monthlyKm = 1250; // 15k / an
  const monthlyFuelCost = (consumption / 100) * monthlyKm * fuelPrice;

  // Determination du niveau
  const getLevel = (val: number) => val < 700 ? 'low' : val > 1300 ? 'high' : 'medium';

  return {
    maintenanceYearly: {
      min: Math.round(estMaint * 0.9),
      max: Math.round(estMaint * 1.1),
      average: estMaint,
      level: getLevel(estMaint),
      breakdown: generateMaintenanceBreakdown(estMaint, car, isElectric)
    },
    insuranceYearly: {
      min: Math.round(estInsur * 0.8),
      max: Math.round(estInsur * 1.2),
      average: estInsur,
      level: getLevel(estInsur)
    },
    fuel: {
      consumptionLiters: consumption,
      monthlyCost: Math.round(monthlyFuelCost),
      unit: isElectric ? 'kWh/100km' : 'L/100km'
    },
    reliabilityScore: Math.min(10, Math.max(1, reliabilityScore)),
    commonIssues: commonIssues,
  };
};