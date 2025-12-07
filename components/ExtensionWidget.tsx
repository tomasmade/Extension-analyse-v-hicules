import React, { useState, useEffect } from 'react';
import { CarDetails, CostEstimation } from '../types';
import { estimateCosts } from '../services/carEstimationService';
import { LucideWrench, LucideShieldCheck, LucideChevronDown, LucideChevronUp, LucideX, LucideSparkles, LucideArrowRight, LucideArrowLeft, LucidePieChart, LucideFuel, LucideAlertTriangle, LucideCheckCircle2 } from 'lucide-react';

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

  // Helper pour la couleur de fiabilité
  const getReliabilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const containerClasses = mode === 'floating' 
    ? `fixed z-50 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl border border-gray-100 overflow-hidden bg-white ${isExpanded ? 'w-full max-w-sm bottom-4 right-4' : 'w-auto bottom-4 right-4 cursor-pointer hover:bg-gray-50'}`
    : `w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 mt-2`;

  const headerClasses = mode === 'floating'
    ? "bg-white border-b border-gray-100 p-3 cursor-pointer"
    : "bg-white border-b border-gray-100 p-4 pb-2";

  return (
    <div className={containerClasses}>
      
      {/* Header */}
      <div 
        className={`${headerClasses} flex justify-between items-center`}
        onClick={() => mode === 'floating' && !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#ec5a13]/10">
             <LucideSparkles style={{ color: lbcOrange }} size={16} />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-sm block leading-tight">
              Assistant Budget
            </span>
            {mode === 'floating' && !isExpanded && (
               <span className="text-[10px] text-gray-500">Cliquez pour voir l'estimation</span>
            )}
          </div>
        </div>
        
        {mode === 'floating' && (
          <div className="flex gap-2 text-gray-400">
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="hover:text-[#ec5a13]">
              {isExpanded ? <LucideChevronDown size={18} /> : <LucideChevronUp size={18} />}
            </button>
            {isExpanded && onClose && (
              <button onClick={onClose} className="hover:text-red-500">
                <LucideX size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-3">
          
          {mode === 'floating' && (
            <div className="mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">{car.make} {car.model}</h3>
              <p className="text-xs text-gray-500">{car.year} • {car.mileage.toLocaleString()} km • {car.fuel}</p>
            </div>
          )}

          <div className="animate-in fade-in duration-300">
            
            {!showMaintenanceDetails ? (
              // VUE D'ENSEMBLE
              <div className="space-y-3">
                
                {/* Score Fiabilité */}
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${getReliabilityColor(costs.reliabilityScore)}`}>
                   <div className="flex items-center gap-2">
                      {costs.reliabilityScore >= 8 ? <LucideCheckCircle2 size={16}/> : <LucideAlertTriangle size={16}/>}
                      <span className="text-xs font-bold">Indice Fiabilité</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className={`w-3 h-1.5 rounded-full ${i < Math.floor(costs.reliabilityScore / 2) ? 'bg-current opacity-80' : 'bg-gray-200'}`}></div>
                        ))}
                      </div>
                      <span className="text-sm font-bold">{costs.reliabilityScore}/10</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Carte Entretien */}
                  <div 
                    onClick={() => setShowMaintenanceDetails(true)}
                    className="group bg-white hover:bg-gray-50 border border-gray-200 p-3 rounded-lg cursor-pointer transition-all hover:border-[#ec5a13]/30 hover:shadow-sm"
                  >
                     <div className="flex items-center gap-1.5 mb-1.5 text-gray-500">
                       <LucideWrench size={14} />
                       <span className="text-[11px] font-semibold uppercase tracking-wide">Entretien</span>
                     </div>
                     <div className="mb-1">
                        <div className="text-xl font-bold text-gray-800">{costs.maintenanceYearly.average}€</div>
                        <div className="text-[10px] text-gray-400">estimation / an</div>
                     </div>
                     <div className="flex items-center gap-1 text-[10px] text-[#ec5a13] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Détail <LucideArrowRight size={10} />
                     </div>
                  </div>

                  {/* Carte Assurance */}
                  <div className="bg-white border border-gray-200 p-3 rounded-lg">
                     <div className="flex items-center gap-1.5 mb-1.5 text-gray-500">
                       <LucideShieldCheck size={14} />
                       <span className="text-[11px] font-semibold uppercase tracking-wide">Assurance</span>
                     </div>
                     <div>
                       <div className="text-xl font-bold text-gray-800">{costs.insuranceYearly.average}€</div>
                       <div className="text-[10px] text-gray-400">estimation / an</div>
                     </div>
                  </div>
                </div>

                {/* Carburant */}
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="bg-white p-1.5 rounded border border-gray-100 text-gray-600">
                        <LucideFuel size={16} />
                     </div>
                     <div>
                       <div className="text-xs font-bold text-gray-700">Carburant</div>
                       <div className="text-[10px] text-gray-500">{costs.fuel.consumptionLiters} {costs.fuel.unit} (mixte)</div>
                     </div>
                   </div>
                   <div className="text-right">
                      <div className="font-bold text-gray-800">{costs.fuel.monthlyCost}€<span className="text-xs font-normal text-gray-500">/mois</span></div>
                   </div>
                </div>

                {/* Warning Points */}
                {costs.commonIssues.length > 0 && (
                  <div className="pt-1">
                     <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Points de vigilance</p>
                     <ul className="space-y-1.5">
                        {costs.commonIssues.slice(0, 2).map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="mt-1 w-1.5 h-1.5 bg-[#ec5a13] rounded-full flex-shrink-0"></span>
                            {issue}
                          </li>
                        ))}
                     </ul>
                  </div>
                )}
              </div>
            ) : (
              // VUE DÉTAILLÉE
              <div className="space-y-4">
                 <button 
                   onClick={() => setShowMaintenanceDetails(false)}
                   className="text-xs flex items-center gap-1 text-gray-500 hover:text-[#ec5a13] transition-colors font-medium"
                 >
                   <LucideArrowLeft size={14} /> Retour au résumé
                 </button>
                 
                 <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="bg-orange-50 p-2 rounded-full text-[#ec5a13]"><LucidePieChart size={18} /></div>
                      <div>
                        <span className="block font-bold text-gray-800 text-sm">Répartition des coûts</span>
                        <span className="block text-[10px] text-gray-500">Pour un kilométrage de {car.mileage.toLocaleString()} km</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {costs.maintenanceYearly.breakdown.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                           <div className="flex justify-between text-xs font-semibold text-gray-700">
                              <span>{item.category}</span>
                              <span>{item.cost} €</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-1.5 rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${(item.cost / costs.maintenanceYearly.average) * 100}%`,
                                  backgroundColor: idx === 2 ? '#d9351c' : '#ec5a13' // Rouge pour les imprévus
                                }}
                              ></div>
                           </div>
                           <div className="text-[10px] text-gray-400 text-right">{item.frequency}</div>
                        </div>
                      ))}
                    </div>
                 </div>
                 
                 <div className="text-[10px] text-gray-400 text-center leading-relaxed px-2">
                   * Ces montants sont des estimations basées sur les données constructeurs et l'âge du véhicule. Ils ne remplacent pas l'avis d'un expert.
                 </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};