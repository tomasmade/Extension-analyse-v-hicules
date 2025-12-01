import React, { useState, useEffect } from 'react';
import { CarDetails, CostEstimation, AIAnalysis } from '../types';
import { estimateCosts } from '../services/carEstimationService';
import { analyzeCarWithGemini } from '../services/geminiService';
import { LucideWrench, LucideShieldCheck, LucideZap, LucideChevronDown, LucideChevronUp, LucideX, LucideBrain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExtensionWidgetProps {
  car: CarDetails;
  onClose: () => void;
  minimizedByDefault?: boolean;
}

export const ExtensionWidget: React.FC<ExtensionWidgetProps> = ({ car, onClose, minimizedByDefault = false }) => {
  const [costs, setCosts] = useState<CostEstimation | null>(null);
  const [isExpanded, setIsExpanded] = useState(!minimizedByDefault);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    // Whenever the car changes, recalculate costs immediately (local logic)
    const data = estimateCosts(car);
    setCosts(data);
    setAiAnalysis(null); // Reset AI data
  }, [car]);

  const handleFetchAI = async () => {
    setIsLoadingAi(true);
    const result = await analyzeCarWithGemini(car);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  if (!costs) return null;

  // Chart Data Preparation
  const chartData = [
    { name: 'Entretien', value: costs.maintenanceYearly.average, color: '#f59e0b' },
    { name: 'Assurance', value: costs.insuranceYearly.average, color: '#3b82f6' },
  ];

  return (
    <div className={`
      bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden font-sans transition-all duration-300
      ${isExpanded ? 'w-full max-w-sm' : 'w-64 cursor-pointer hover:bg-gray-50'}
    `}>
      
      {/* Header */}
      <div 
        className="bg-slate-900 text-white p-3 flex justify-between items-center"
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1 rounded-md">
            <LucideZap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm">AutoMate Assistant</span>
        </div>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="hover:text-blue-300">
            {isExpanded ? <LucideChevronDown size={18} /> : <LucideChevronUp size={18} />}
          </button>
          {isExpanded && (
            <button onClick={onClose} className="hover:text-red-300">
              <LucideX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-800">{car.make} {car.model}</h3>
            <p className="text-xs text-gray-500">{car.year} • {car.fuel}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Estimations
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LucideBrain size={12} />
              Avis IA
            </button>
          </div>

          {activeTab === 'overview' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                   <div className="flex items-center gap-1 mb-1 text-orange-700">
                     <LucideWrench size={14} />
                     <span className="text-xs font-bold">Entretien</span>
                   </div>
                   <div className="text-lg font-bold text-orange-900">{costs.maintenanceYearly.average}€<span className="text-xs font-normal">/an</span></div>
                   <div className="text-[10px] text-orange-600">Moy. estimée</div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                   <div className="flex items-center gap-1 mb-1 text-blue-700">
                     <LucideShieldCheck size={14} />
                     <span className="text-xs font-bold">Assurance</span>
                   </div>
                   <div className="text-lg font-bold text-blue-900">{costs.insuranceYearly.average}€<span className="text-xs font-normal">/an</span></div>
                   <div className="text-[10px] text-blue-600">Tiers étendu</div>
                </div>
              </div>

              {/* Simple Chart */}
              <div className="h-32 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, left: 0, right: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Reliability Warning */}
              <div className="mt-2">
                 <p className="text-xs font-semibold text-gray-500 mb-1">Points de vigilance connus:</p>
                 <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                    {costs.commonIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                 </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              {!aiAnalysis && !isLoadingAi && (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 mb-3">Obtenez une analyse détaillée générée par Gemini.</p>
                  <button 
                    onClick={handleFetchAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-4 rounded-full font-medium transition-colors"
                  >
                    Lancer l'analyse
                  </button>
                </div>
              )}

              {isLoadingAi && (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-indigo-600 font-medium">Analyse en cours...</span>
                </div>
              )}

              {aiAnalysis && (
                <div className="text-xs space-y-3">
                   <div className="bg-green-50 p-2 rounded border border-green-100">
                     <span className="font-bold text-green-800 block mb-1">Avantages:</span>
                     <ul className="list-disc list-inside text-green-900 space-y-1">
                        {aiAnalysis.pros.map((p, i) => <li key={i}>{p}</li>)}
                     </ul>
                   </div>
                   <div className="bg-red-50 p-2 rounded border border-red-100">
                     <span className="font-bold text-red-800 block mb-1">Inconvénients:</span>
                     <ul className="list-disc list-inside text-red-900 space-y-1">
                        {aiAnalysis.cons.map((c, i) => <li key={i}>{c}</li>)}
                     </ul>
                   </div>
                   <div className="italic text-gray-600 border-l-2 border-indigo-300 pl-2 py-1">
                      "{aiAnalysis.verdict}"
                   </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-2 border-t text-[10px] text-center text-gray-400">
            Estimations non contractuelles à titre indicatif.
          </div>
        </div>
      )}
    </div>
  );
};
