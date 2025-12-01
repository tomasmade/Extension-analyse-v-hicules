import React, { useState, useEffect } from 'react';
import { CarDetails, CostEstimation, AIAnalysis } from '../types';
import { estimateCosts } from '../services/carEstimationService';
import { analyzeCarWithGemini } from '../services/geminiService';
import { LucideWrench, LucideShieldCheck, LucideZap, LucideChevronDown, LucideChevronUp, LucideX, LucideBrain, LucideSparkles, LucideArrowRight, LucideArrowLeft, LucidePieChart } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false); // État pour la vue détaillée
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    // Si on est en mode "inline", on force l'expansion par défaut car c'est un bloc de contenu
    if (mode === 'inline') {
      setIsExpanded(true);
    }
  }, [mode]);

  useEffect(() => {
    const data = estimateCosts(car);
    setCosts(data);
    setAiAnalysis(null);
    setShowMaintenanceDetails(false); // Reset details view on car change
  }, [car]);

  const handleFetchAI = async () => {
    setIsLoadingAi(true);
    const result = await analyzeCarWithGemini(car);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

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
            Assistant Achat {mode === 'inline' && "Auto"}
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

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => { setActiveTab('overview'); setShowMaintenanceDetails(false); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Budget annuel
            </button>
            <button 
              onClick={() => { setActiveTab('ai'); setShowMaintenanceDetails(false); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LucideBrain size={12} />
              Avis IA
            </button>
          </div>

          {activeTab === 'overview' ? (
            <div className="animate-in fade-in duration-300">
              
              {!showMaintenanceDetails ? (
                // VUE D'ENSEMBLE (SUMMARY)
                <div className="space-y-4">
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
          ) : (
            // ONGLET IA (Reste inchangé)
            <div className="space-y-3 animate-in fade-in duration-300">
              {!aiAnalysis && !isLoadingAi && (
                <div className="text-center py-6 bg-indigo-50 rounded-lg border border-indigo-100 border-dashed">
                  <p className="text-xs text-indigo-800 mb-3 px-4">Demandez à l'IA d'analyser la fiabilité spécifique de ce modèle.</p>
                  <button 
                    onClick={handleFetchAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-6 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Lancer l'analyse
                  </button>
                </div>
              )}

              {isLoadingAi && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-indigo-600 font-medium">L'IA analyse le véhicule...</span>
                </div>
              )}

              {aiAnalysis && (
                <div className="text-xs space-y-3">
                   <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                     <span className="font-bold text-green-800 block mb-2 flex items-center gap-1"><LucideSparkles size={12}/> Points forts</span>
                     <ul className="space-y-1.5">
                        {aiAnalysis.pros.map((p, i) => <li key={i} className="flex items-start gap-1.5 text-green-900"><span className="mt-1 w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>{p}</li>)}
                     </ul>
                   </div>
                   <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                     <span className="font-bold text-red-800 block mb-2">Points faibles</span>
                     <ul className="space-y-1.5">
                        {aiAnalysis.cons.map((c, i) => <li key={i} className="flex items-start gap-1.5 text-red-900"><span className="mt-1 w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>{c}</li>)}
                     </ul>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};