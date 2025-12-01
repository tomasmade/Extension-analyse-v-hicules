import { GoogleGenAI, Type } from "@google/genai";
import { CarDetails, AIAnalysis } from "../types";

// NOTE: In a real production app, you should proxy this request through a backend 
// to hide your API KEY. For this "Simulation/Dev" mode, we use it directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeCarWithGemini = async (car: CarDetails): Promise<AIAnalysis> => {
  if (!process.env.API_KEY) {
    return {
      pros: ["API Key missing"],
      cons: ["Cannot fetch real data"],
      verdict: "Please configure the API Key in the environment to use AI features."
    };
  }

  const prompt = `
    Analyze this car for a potential buyer: ${car.year} ${car.make} ${car.model} (${car.fuel}).
    Provide 3 specific pros, 3 specific cons regarding reliability and ownership costs, and a short verdict sentence.
    Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 advantages"
            },
            cons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 disadvantages"
            },
            verdict: {
              type: Type.STRING,
              description: "A short summary verdict"
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysis;
    }
    throw new Error("No data returned");

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      pros: ["Analysis failed"],
      cons: ["Please try again later"],
      verdict: "Could not retrieve AI analysis."
    };
  }
};