import { GoogleGenAI, Type } from "@google/genai";
import { CarDetails, AIAnalysisResponse } from "../types";
import { checkDailyLimit, incrementDailyUsage } from "./usageTracker";

declare const process: any;

// La clé API est injectée par Vite lors du build depuis le fichier .env
// TypeScript peut se plaindre que process.env n'existe pas, mais Vite le gère.
const API_KEY = process.env.API_KEY;

export const analyzeCarWithGemini = async (car: CarDetails): Promise<AIAnalysisResponse> => {
  if (!API_KEY) {
    throw new Error("Clé API non configurée. Veuillez ajouter API_KEY dans votre fichier .env");
  }

  // 1. Vérification du quota quotidien
  const canUse = await checkDailyLimit();
  if (!canUse) {
    throw new Error("Limite quotidienne atteinte (10/10). Revenez demain !");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Tu es un expert automobile. Analyse cette annonce :
    Véhicule: ${car.make} ${car.model} ${car.title}
    Année: ${car.year}
    Kilométrage: ${car.mileage} km
    Prix: ${car.price} €
    Carburant: ${car.fuel}

    Réponds UNIQUEMENT avec un objet JSON suivant ce schéma précis.
    Sois réaliste et critique sur les coûts et la fiabilité.
    Pour 'dealQuality', compare le prix au marché actuel estimé.
    Pour 'topWarnings', liste les 3 problèmes majeurs imminents (ex: courroie à faire, FAP).
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      dealQuality: { type: Type.STRING, enum: ["good", "fair", "bad"] },
      dealSummary: { type: Type.STRING, description: "Phrase courte résumant le verdict prix (ex: 12% sous le marché)" },
      estimatedRealPrice: { type: Type.NUMBER, description: "Prix estimé juste pour ce modèle/km" },
      annualCosts: {
        type: Type.OBJECT,
        properties: {
          fuel: { type: Type.NUMBER },
          maintenance: { type: Type.NUMBER },
          insurance: { type: Type.NUMBER },
          total: { type: Type.NUMBER }
        },
        required: ["fuel", "maintenance", "insurance", "total"]
      },
      fuelConsumption: { type: Type.NUMBER, description: "Consommation estimée en L/100km ou kWh/100km" },
      fuelUnit: { type: Type.STRING, enum: ["L/100km", "kWh/100km"] },
      reliabilityScore: { type: Type.NUMBER, description: "Note sur 10" },
      topWarnings: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Liste des 3 points de vigilance principaux"
      },
      detailedAnalysis: {
        type: Type.OBJECT,
        properties: {
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          maintenanceAdvice: { type: Type.STRING },
          modelReliabilityDetails: { type: Type.STRING }
        }
      }
    },
    required: ["dealQuality", "dealSummary", "estimatedRealPrice", "annualCosts", "reliabilityScore", "topWarnings", "detailedAnalysis"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");

    // 2. Si l'appel a réussi, on décrémente le quota
    await incrementDailyUsage();

    return JSON.parse(text) as AIAnalysisResponse;

  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw error;
  }
};