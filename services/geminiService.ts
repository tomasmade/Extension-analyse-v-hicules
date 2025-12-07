import { CarDetails, AIAnalysis } from "../types";

// NOTE: L'intégration IA est désactivée pour cette version "MVP / Sans Coût".
// Nous avons retiré l'import de @google/genai pour que le build fonctionne sans installer la librairie.

export const analyzeCarWithGemini = async (_car: CarDetails): Promise<AIAnalysis> => {
  // Fonction bouchon (stub) pour satisfaire le compilateur TypeScript
  // si jamais cette fonction est importée ailleurs.
  return {
    pros: [],
    cons: [],
    verdict: "L'analyse IA est désactivée."
  };
};