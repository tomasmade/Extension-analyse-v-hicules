import React, { useState, useEffect } from 'react';
import { CarDetails, CostEstimation, DealVerdict, AIAnalysisResponse } from '../types';
import { estimateCosts, calculateQuickVerdict } from '../services/carEstimationService';
import { analyzeCarWithGemini } from '../services/geminiService';
import { getRemainingUsage } from '../services/usageTracker';
import { Sparkles, X, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, ArrowRight, Wallet, Wrench, Fuel, ShieldCheck, Info, Loader2, Zap } from 'lucide-react';

interface ExtensionWidgetProps {
  car: CarDetails;
  onClose?: () => void;
  minimizedByDefault?: boolean;
  mode?: 'floating' | 'inline';
}

type ViewState = 'level1' | 'analyzing' | 'level2' | 'level3';

export const ExtensionWidget: React.FC<ExtensionWidgetProps> = ({ 
  car, 
  onClose, 
  mode = 'floating' 
}) => {
  // États de données
  const [localVerdict, setLocalVerdict] = useState<DealVerdict | null>(null);
  const [aiData, setAiData] = useState<AIAnalysisResponse | null>(null);
  const [localCosts, setLocalCosts] = useState<CostEstimation | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number>(10);
  
  // États de vue
  const [view, setView] = useState<ViewState>('level1');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialisation Niveau 1 (Local)
  useEffect(() => {
    setLocalVerdict(calculateQuickVerdict(car));
    setLocalCosts(estimateCosts(car));
    getRemainingUsage().then(setRemainingCredits);
  }, [car]);

  // Fonction pour déclencher l'analyse IA (Passage au Niveau 2/3)
  const handleAnalyzeClick = async () => {
    setView('analyzing');
    setErrorMsg(null);

    try {
      // Plus besoin de clé en paramètre, elle est intégrée
      const result = await analyzeCarWithGemini(car);
      setAiData(result);
      setView('level2'); // On arrive sur le résumé enrichi par l'IA
      
      // Mise à jour des crédits
      getRemainingUsage().then(setRemainingCredits);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur d'analyse.");
      setView('level1'); // Retour au niveau 1 avec message d'erreur
    }
  };

  if (!localVerdict || !localCosts) return null;

  const containerClasses = mode === 'floating' 
    ? `fixed z-50 transition-all duration-300 shadow-2xl rounded-xl border border-gray-100 overflow-hidden bg-white w-[380px] bottom-4 right-4 font-sans`
    : `w-full rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm mt-4 font-sans`;

  // --- ÉCRAN : ANALYSE EN COURS ---
  if (view === 'analyzing') {
    return (
      <div className={containerClasses}>
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
          <Loader2 className="animate-spin text-[#ec5a13]" size={40} />
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Analyse IA en cours...</h3>
            <p className="text-gray-500 text-sm mt-1">Comparaison des prix et vérification fiabilité</p>
          </div>
        </div>
      </div>
    );
  }

  // --- NIVEAU 1 : ESTIMATIONS LOCALES (Immédiat) ---
  if (view === 'level1') {
    // Calcul du total annuel estimé (local)
    const annualFuel = localCosts.fuel.monthlyCost * 12;
    const totalAnnual = annualFuel + localCosts.maintenanceYearly.average + localCosts.insuranceYearly.average;

    return (
      <div className={containerClasses}>
        {/* HEADER VERDICT */}
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${localVerdict.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 ')}`}>
               <Sparkles size={24} className={localVerdict.color.split(' ')[0]} />
             </div>
             <div>
               <div className={`font-bold text-xl ${localVerdict.color.split(' ')[0]}`}>
                 {localVerdict.label}
               </div>
               <div className="text-xs text-gray-500 flex items-center gap-1">
                 {localVerdict.priceGapPercent && localVerdict.priceGapPercent < 0 
                   ? `Prix ~${Math.abs(localVerdict.priceGapPercent)}% sous le marché`
                   : 'Estimation basée sur l\'algorithme local'
                 }
               </div>
             </div>
          </div>
          {/* Badge crédits */}
          <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">
             {remainingCredits}/10 analyses
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 p-3 text-sm text-red-700 border-b border-red-100 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-5 space-y-5">
           {/* GRILLE DES COÛTS (LOCAL) */}
           <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
             <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
               <Wallet size={18}/> Estimations
             </h4>
             
             {/* Bloc Carburant mis en avant */}
             <div className="bg-white p-3 rounded-lg border border-green-100 mb-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="bg-green-50 p-2 rounded-full text-green-600">
                      <Fuel size={20} />
                   </div>
                   <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Carburant</div>
                      <div className="font-bold text-lg text-gray-900 leading-none mt-0.5">
                        {localCosts.fuel.consumptionLiters} <span className="text-sm font-normal text-gray-600">{localCosts.fuel.unit}</span>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <div className="font-bold text-xl text-gray-900">{localCosts.fuel.monthlyCost}€</div>
                   <div className="text-xs text-gray-500">/mois</div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                   <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wrench size={12}/> Entretien</div>
                   <div>
                      <span className="font-bold text-lg text-gray-800">{localCosts.maintenanceYearly.average}€</span>
                      <span className="text-xs text-gray-500">/an</span>
                   </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                   <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Assurance</div>
                   <div>
                      <span className="font-bold text-lg text-gray-800">{localCosts.insuranceYearly.average}€</span>
                      <span className="text-xs text-gray-500">/an</span>
                   </div>
                </div>
             </div>
             
             <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <span>Budget total estimé</span>
                <span className="font-bold text-sm text-gray-700">~{Math.round(totalAnnual)}€ / an</span>
             </div>
           </div>

           {/* FIABILITÉ LOCALE */}
           <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Wrench size={16} /> Fiabilité modèle
              </span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-6 h-2 rounded-full ${
                      (localCosts.reliabilityScore / 2) >= i ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <span className="font-bold text-sm">{localCosts.reliabilityScore}/10</span>
              </div>
           </div>

           {/* CTA : ANALYSE IA */}
           <button 
              onClick={handleAnalyzeClick}
              disabled={remainingCredits <= 0}
              className={`w-full font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md ${
                remainingCredits > 0 
                  ? 'bg-[#ec5a13] text-white hover:bg-[#d64a0b]' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Zap size={18} />
              {remainingCredits > 0 ? "Lancer l'analyse IA complète" : "Limite quotidienne atteinte"}
            </button>
        </div>
      </div>
    );
  }

  // --- NIVEAU 2 : RÉSULTAT IA (Résumé enrichi) ---
  if (view === 'level2' && aiData) {
    return (
      <div className={containerClasses}>
        {/* HEADER */}
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                aiData.dealQuality === 'good' ? 'bg-green-100 text-green-800' : 
                aiData.dealQuality === 'bad' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {aiData.dealQuality === 'good' ? 'Bon Plan' : aiData.dealQuality === 'bad' ? 'Prix Élevé' : 'Offre Correcte'}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Sparkles size={10} /> Analyse IA</span>
            </div>
            <h3 className="font-bold text-gray-900 text-xl leading-tight">{aiData.dealSummary}</h3>
          </div>
          <button onClick={() => setView('level1')} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="p-5 space-y-5">
          {/* COÛTS ANNUELS IA */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
             <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles size={10}/> AJUSTÉ PAR IA
             </div>
             <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
               <Wallet size={18}/> Coûts Ajustés
             </h4>
             
             {/* CARBURANT IA */}
             <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                 <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full text-gray-700 shadow-sm border border-gray-100">
                       <Fuel size={20} />
                    </div>
                    <div>
                       <div className="text-xs text-gray-500">Conso. estimée</div>
                       <div className="font-bold text-lg text-gray-900">{aiData.fuelConsumption} {aiData.fuelUnit}</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="font-bold text-xl text-gray-900">~{Math.round(aiData.annualCosts.fuel / 12)}€</div>
                    <div className="text-xs text-gray-500">/mois</div>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-2 rounded border border-gray-100">
                   <div className="text-xs text-gray-500 mb-1">Entretien</div>
                   <div className="font-bold text-base">{aiData.annualCosts.maintenance}€<span className="text-xs font-normal text-gray-400">/an</span></div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-100">
                   <div className="text-xs text-gray-500 mb-1">Assurance</div>
                   <div className="font-bold text-base">{aiData.annualCosts.insurance}€<span className="text-xs font-normal text-gray-400">/an</span></div>
                </div>
             </div>
          </div>

          {/* TOP ALERTS */}
          <div>
            <h4 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500"/> Points de Vigilance
            </h4>
            <ul className="space-y-2">
              {aiData.topWarnings.map((warn, i) => (
                <li key={i} className="text-sm flex items-start gap-2 text-gray-700 bg-orange-50 p-3 rounded border border-orange-100">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="leading-snug">{warn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ACTIONS */}
          <div className="space-y-2 pt-2">
             <button 
               onClick={() => setView('level3')}
               className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors flex justify-center items-center gap-2"
             >
               <Info size={18} />
               Voir tous les détails
             </button>
             <div className="grid grid-cols-2 gap-2">
               <a href="https://histovec.interieur.gouv.fr/histovec/home" target="_blank" className="text-center py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                 📋 Histovec
               </a>
               <a href="https://rapex.ec.europa.eu/Security/rapex/rapid/" target="_blank" className="text-center py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                 🔔 Rappels
               </a>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- NIVEAU 3 : DÉTAILS COMPLETS (Reste identique) ---
  if (view === 'level3' && aiData) {
    return (
      <div className={containerClasses}>
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
          <button onClick={() => setView('level2')} className="text-gray-500 hover:text-gray-800">
            <ArrowRight className="rotate-180" size={24} />
          </button>
          <h3 className="font-bold text-gray-900 text-lg">Analyse Détaillée</h3>
        </div>

        <div className="p-5 space-y-6 max-h-[500px] overflow-y-auto">
          
          {/* PRIX */}
          <section>
            <h4 className="font-bold text-xl mb-2 flex items-center gap-2"><TrendingUp size={24} className="text-[#ec5a13]"/> Analyse Prix</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-base">
               <div className="flex justify-between mb-2">
                 <span className="text-gray-600">Prix demandé :</span>
                 <span className="font-bold">{car.price} €</span>
               </div>
               <div className="flex justify-between mb-2">
                 <span className="text-gray-600">Estimation juste :</span>
                 <span className="font-bold text-green-700">~{aiData.estimatedRealPrice} €</span>
               </div>
               <p className="mt-3 text-gray-700 italic border-t border-gray-200 pt-3 text-sm">"{aiData.dealSummary}"</p>
            </div>
          </section>

          {/* FIABILITÉ DÉTAILLÉE */}
          <section>
             <h4 className="font-bold text-xl mb-2 flex items-center gap-2"><Wrench size={24} className="text-[#ec5a13]"/> Fiabilité ({aiData.reliabilityScore}/10)</h4>
             <p className="text-base text-gray-700 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 leading-relaxed">
               {aiData.detailedAnalysis.modelReliabilityDetails}
             </p>
             
             <div className="grid grid-cols-1 gap-3">
               <div className="bg-green-50 p-3 rounded border border-green-100">
                 <h5 className="font-bold text-sm uppercase text-green-700 mb-2 flex items-center gap-1"><CheckCircle2 size={16}/> Points Forts</h5>
                 <ul className="text-sm space-y-1.5">
                   {aiData.detailedAnalysis.pros.map((p, i) => <li key={i} className="flex gap-2 text-gray-700">• {p}</li>)}
                 </ul>
               </div>
               <div className="bg-red-50 p-3 rounded border border-red-100">
                 <h5 className="font-bold text-sm uppercase text-red-700 mb-2 flex items-center gap-1"><AlertTriangle size={16}/> Points Faibles</h5>
                 <ul className="text-sm space-y-1.5">
                   {aiData.detailedAnalysis.cons.map((c, i) => <li key={i} className="flex gap-2 text-gray-700">• {c}</li>)}
                 </ul>
               </div>
             </div>
          </section>

          {/* CONSEIL ENTRETIEN */}
          <section>
             <h4 className="font-bold text-xl mb-2 flex items-center gap-2"><Fuel size={24} className="text-[#ec5a13]"/> Conseil Maintenance</h4>
             <p className="text-base text-gray-600 bg-yellow-50 p-4 rounded border border-yellow-100 leading-relaxed">
               {aiData.detailedAnalysis.maintenanceAdvice}
             </p>
          </section>

        </div>
      </div>
    );
  }

  return null;
};