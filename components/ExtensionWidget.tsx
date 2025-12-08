import React, { useState, useEffect } from 'react';
import { CarDetails, CostEstimation } from '../types';
import { estimateCosts } from '../services/carEstimationService';
import { LucideWrench, LucideShieldCheck, LucideChevronDown, LucideChevronUp, LucideX, LucideSparkles, LucideArrowRight, LucideArrowLeft, LucidePieChart, LucideFuel, LucideAlertTriangle, LucideCheckCircle2, LucideBadgeCheck } from 'lucide-react';

interface ExtensionWidgetProps {
  car: CarDetails;
  onClose?: () => void;
  minimizedByDefault?: boolean;
  mode?: 'floating' | 'inline';
}

export const ExtensionWidget: React.FC<ExtensionWidgetProps> = ({ 
  car, 
  onClose, 
  minimizedByDefault = false,
  mode = 'floating' 
}) => {
  const [costs, setCosts] = useState<CostEstimation | null>(null);
  const [isExpanded, setIsExpanded] = useState(!minimizedByDefault);
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false);

  useEffect(() => {
    if (mode === 'inline') {
      setIsExpanded(true);
    }
  }, [mode]);

  useEffect(() => {
    const data = estimateCosts(car);
    setCosts(data);
    setShowMaintenanceDetails(false);
  }, [car]);

  if (!costs) return null;

  // COULEUR LBC OFFICIELLE : #ec5a13 (Orange)
  const lbcOrange = '#ec5a13';
  
  // Détection si c'est des données vérifiées
  const isVerifiedModel = costs.commonIssues.length > 0 && !costs.commonIssues.includes('Usure normale');

  const getReliabilityColor = (score: number) => {
    if (score >= 8) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 5) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const containerClasses = mode === 'floating' 
    ? `fixed z-50 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl border border-gray-100 overflow-hidden bg-white ${isExpanded ? 'w-full max-w-md bottom-4 right-4' : 'w-auto bottom-4 right-4 cursor-pointer hover:bg-gray-50'}`
    : `w-full rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm mt-4`;

  // --- VUE RÉDUITE (Floating fermé) ---
  if (!isExpanded && mode === 'floating') {
    return (
      <div className={containerClasses} onClick={() => setIsExpanded(true)}>
        <div className="p-4 flex items-center gap-3">
          <div className="bg-[#ec5a13] p-2 rounded-full text-white shadow-sm">
            <LucideSparkles size={24} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base">Budget Auto</div>
            <div className="text-sm text-gray-500">Voir l'estimation</div>
          </div>
          <LucideChevronUp className="text-gray-400 ml-2" />
        </div>
      </div>
    );
  }

  // --- VUE DÉTAILS ENTRETIEN ---
  if (showMaintenanceDetails) {
    return (
      <div className={containerClasses}>
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => setShowMaintenanceDetails(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            <LucideArrowLeft size={18} />
            Retour
          </button>
          <span className="font-bold text-gray-800 text-base">Détail Entretien</span>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <LucideWrench className="text-[#ec5a13]" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total estimé</p>
              <p className="text-2xl font-bold text-[#ec5a13]">{costs.maintenanceYearly.average}€<span className="text-sm text-gray-500 font-normal">/an</span></p>
            </div>
          </div>

          <div className="space-y-3">
            {costs.maintenanceYearly.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.category}</p>
                  <p className="text-xs text-gray-500">{item.frequency}</p>
                </div>
                <span className="font-bold text-gray-900 text-base">{item.cost} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VUE PRINCIPALE ---
  return (
    <div className={containerClasses}>
      {/* HEADER */}
      <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#ec5a13] text-white p-1.5 rounded-md">
            <LucideSparkles size={18} />
          </div>
          <div>
             <h3 className="font-bold text-gray-900 text-lg leading-tight">Assistant Budget</h3>
             {isVerifiedModel && (
               <span title="Données basées sur ce modèle précis" className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                 <LucideBadgeCheck size={12} />
                 Modèle Vérifié
               </span>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {mode === 'floating' && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <LucideChevronDown size={20} />
            </button>
          )}
          {onClose && (
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <LucideX size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* GRILLE BUDGET */}
        <div className="grid grid-cols-2 gap-4">
          {/* CARTE ENTRETIEN */}
          <div 
            onClick={() => setShowMaintenanceDetails(true)}
            className="col-span-1 bg-orange-50 rounded-xl p-4 border border-orange-100 hover:border-orange-300 transition-colors cursor-pointer group relative"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400">
               <LucideArrowRight size={18} />
            </div>
            <div className="flex items-center gap-2 mb-2 text-orange-700">
              <LucideWrench size={18} />
              <span className="text-sm font-bold uppercase tracking-wide">Entretien</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
              {costs.maintenanceYearly.average}€
              <span className="text-sm font-medium text-gray-500 ml-0.5">/an</span>
            </div>
            <div className="text-sm text-orange-600 group-hover:underline flex items-center gap-1 mt-2 font-medium">
              Voir le détail
            </div>
          </div>

          {/* CARTE ASSURANCE */}
          <div className="col-span-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2 text-blue-700">
              <LucideShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wide">Assurance</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
              {costs.insuranceYearly.average}€
              <span className="text-sm font-medium text-gray-500 ml-0.5">/an</span>
            </div>
            <div className="text-sm text-blue-600 mt-2">
              Jeune permis estimé
            </div>
          </div>
        </div>

        {/* CARTE CARBURANT */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex justify-between items-center">
           <div>
              <div className="flex items-center gap-2 mb-1 text-green-700">
                <LucideFuel size={18} />
                <span className="text-sm font-bold">Carburant estimé</span>
              </div>
              <div className="text-sm text-green-800">
                Base 15 000 km/an
              </div>
           </div>
           <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {costs.fuel.monthlyCost}€<span className="text-sm font-medium text-gray-500">/mois</span>
              </div>
              <div className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">
                ~ {costs.fuel.consumptionLiters} {costs.fuel.unit}
              </div>
           </div>
        </div>

        {/* SECTION FIABILITÉ */}
        <div className={`rounded-xl border p-4 ${getReliabilityColor(costs.reliabilityScore)}`}>
           <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold flex items-center gap-2 text-base">
                 {costs.reliabilityScore >= 8 ? <LucideCheckCircle2 size={20}/> : <LucideAlertTriangle size={20}/>}
                 Score Fiabilité
              </h4>
              <span className="text-2xl font-black">{costs.reliabilityScore}/10</span>
           </div>
           
           {/* Jauge visuelle */}
           <div className="w-full h-2.5 bg-gray-200/50 rounded-full mb-3 overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-1000 ${
                 costs.reliabilityScore >= 8 ? 'bg-green-500' : 
                 costs.reliabilityScore >= 5 ? 'bg-orange-500' : 'bg-red-500'
               }`} 
               style={{ width: `${costs.reliabilityScore * 10}%` }}
             />
           </div>

           {/* Points de vigilance */}
           {costs.commonIssues.length > 0 && (
             <div className="mt-3 pt-3 border-t border-black/5">
               <p className="text-sm font-semibold mb-2">À surveiller sur ce modèle :</p>
               <ul className="space-y-1">
                 {costs.commonIssues.map((issue, i) => (
                   <li key={i} className="text-sm flex items-start gap-2">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
                     <span className="leading-tight">{issue}</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};