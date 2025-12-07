import React, { useState, useEffect } from 'react';
import { CarDetails, CostEstimation } from '../types';
import { estimateCosts } from '../services/carEstimationService';
import { LucideWrench, LucideShieldCheck, LucideZap, LucideChevronDown, LucideChevronUp, LucideX, LucideSparkles, LucideArrowRight, LucideArrowLeft, LucidePieChart, LucideFuel } from 'lucide-react';

interface ExtensionWidgetProps {
  car: CarDetails;
  onClose?: () => void;
  minimizedByDefault?: boolean;
  mode?: 'floating' | 'inline'; // Nouveau prop pour contrôler le style
}

export const ExtensionWidget: React.FC<ExtensionWidgetProps> = ({ 
  car, 
  onClose, 
  minimizedByDefault = false,
  mode = 'floating' 
}) => {
  const [costs, setCosts] = useState<CostEstimation | null>(null);
  const [isExpanded, setIsExpanded] = useState(!minimizedByDefault);
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false); // État pour la vue détaillée

  useEffect(() => {
    // Si on est en mode "inline", on force l'expansion par défaut car c'est un bloc de contenu
    if (mode === 'inline') {
      setIsExpanded(true);
    }
  }, [mode]);

  useEffect(() => {
    const data = estimateCosts(car);
    setCosts(data);
    setShowMaintenanceDetails(false); // Reset details view on car change
  }, [car]);

  if (!costs) return null;

  // STYLES DYNAMIQUES SELON LE MODE
  const containerClasses = mode === 'floating' 
    ? `fixed z-50 transition-all duration-300 shadow-2xl rounded-xl border border-gray-200 overflow-hidden bg-white ${isExpanded ? 'w-full max-w-sm' : 'w-64 cursor-pointer hover:bg-gray-50'}`
    : `w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4`; // Mode Inline se fond dans le décor

  const headerClasses = mode === 'floating'
    ? "bg-slate-900 text-white p-3 cursor-pointer"
    : "bg-gray-50 border-b border-gray-100 p-4";

  return (
    <div className={containerClasses}>
      
      {/* Header */}
      <div 
        className={`${headerClasses} flex justify-between items-center`}
        onClick={() => mode === 'floating' && !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center gap-2">
          {mode === 'floating' ? (
             <div className="bg-blue-500 p-1 rounded-md"><LucideZap size={16} className="text-white" /></div>
          ) : (
             <LucideSparkles className="text-orange-500" size={20} />
          )}
          <span className={`font-bold text-sm ${mode === 'inline' ? 'text-gray-800' : 'text-white'}`}>
            Assistant Budget Auto
          </span>
        </div>
        
        {/* Controls (Only for floating mostly) */}
        {mode === 'floating' && (
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="hover:text-blue-300">
              {isExpanded ? <LucideChevronDown size={18} /> : <LucideChevronUp size={18} />}
            </button>
            {isExpanded && onClose && (
              <button onClick={onClose} className="hover:text-red-300">
                <LucideX size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          
          {/* En mode inline, on rappelle pas le titre car on est déjà dans le contexte */}
          {mode === 'floating' && (
            <div className="mb-4 border-b pb-2">
              <h3 className="font-bold text-gray-800">{car.make} {car.model}</h3>
              <p className="text-xs text-gray-500">{car.year} • {car.fuel}</p>
            </div>
          )}

          <div className="animate-in fade-in duration-300">
            
            {!showMaintenanceDetails ? (
              // VUE D'ENSEMBLE (SUMMARY)
              <div className="space-y-3">
                
                {/* LIGNE 1 : ENTRETIEN & ASSURANCE */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Carte Entretien Interactive */}
                  <div 
                    onClick={() => setShowMaintenanceDetails(true)}
                    className="group bg-orange-50 p-3 rounded-lg border border-orange-100 flex flex-col justify-between cursor-pointer hover:bg-orange-100 transition-colors relative"
                  >
                     <div className="flex items-center gap-1 mb-1 text-orange-700">
                       <LucideWrench size={14} />
                       <span className="text-xs font-bold">Entretien</span>
                     </div>
                     <div>
                        <div className="text-lg font-bold text-orange-900">{costs.maintenanceYearly.average}€<span className="text-xs font-normal">/an</span></div>
                        <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium group-hover:text-orange-800">
                          Voir le détail <LucideArrowRight size={10} />
                        </div>
                     </div>
                  </div>

                  {/* Carte Assurance */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col justify-between">
                     <div className="flex items-center gap-1 mb-1 text-blue-700">
                       <LucideShieldCheck size={14} />
                       <span className="text-xs font-bold">Assurance</span>
                     </div>
                     <div>
                       <div className="text-lg font-bold text-blue-900">{costs.insuranceYearly.average}€<span className="text-xs font-normal">/an</span></div>
                       <div className="text-[10px] text-blue-600 leading-tight">Jeune permis estimé</div>
                     </div>
                  </div>
                </div>

                {/* LIGNE 2 : CARBURANT */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-1 mb-1 text-green-700">
                       <LucideFuel size={14} />
                       <span className="text-xs font-bold">Carburant estimé</span>
                     </div>
                     <div className="text-[10px] text-green-800">
                        Base 15 000 km/an
                     </div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-bold text-green-900">{costs.fuel.monthlyCost}€<span className="text-xs font-normal">/mois</span></div>
                      <div className="text-[10px] font-medium text-green-700 bg-green-200/50 px-1.5 py-0.5 rounded inline-block">
                        ~ {costs.fuel.consumptionLiters} {costs.fuel.unit}
                      </div>
                   </div>
                </div>

                {/* Reliability Warning */}
                <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                   <p className="text-xs font-bold text-gray-700 mb-1">À surveiller sur ce modèle :</p>
                   <ul className="text-xs text-gray-600 space-y-1">
                      {costs.commonIssues.slice(0, 2).map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
                          {issue}
                        </li>
                      ))}
                   </ul>
                </div>
              </div>
            ) : (
              // VUE DÉTAILLÉE (MAINTENANCE DETAILS)
              <div className="space-y-3">
                 <button 
                   onClick={() => setShowMaintenanceDetails(false)}
                   className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-2 transition-colors"
                 >
                   <LucideArrowLeft size={12} /> Retour au résumé
                 </button>
                 
                 <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4 text-orange-800 border-b border-orange-200 pb-2">
                      <div className="bg-orange-200 p-1.5 rounded-full"><LucidePieChart size={16} className="text-orange-700"/></div>
                      <div>
                        <span className="block font-bold text-sm">Répartition Entretien</span>
                        <span className="block text-[10px] text-orange-600">Estimé sur {costs.maintenanceYearly.average}€ / an</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {costs.maintenanceYearly.breakdown.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                           <div className="flex justify-between text-xs font-medium text-gray-800">
                              <span>{item.category}</span>
                              <span>{item.cost} €</span>
                           </div>
                           <div className="w-full bg-orange-200 rounded-full h-1.5">
                              <div 
                                className="bg-orange-500 h-1.5 rounded-full" 
                                style={{ width: `${(item.cost / costs.maintenanceYearly.average) * 100}%` }}
                              ></div>
                           </div>
                           <div className="text-[10px] text-gray-500 italic text-right">{item.frequency}</div>
                        </div>
                      ))}
                    </div>
                 </div>
                 
                 <div className="text-[10px] text-gray-400 text-center mt-2">
                   * Estimation basée sur des données constructeurs et retours propriétaires.
                 </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};