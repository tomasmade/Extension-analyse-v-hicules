import { CarDetails } from '../types';

/**
 * Interface pour les stratégies de parsing
 */
interface ParserStrategy {
  canParse: (url: string) => boolean;
  parse: (document: Document) => CarDetails | null;
}

/**
 * STRATÉGIE 1: LE BON COIN (Simulation)
 * Le Bon Coin utilise souvent des balises de données structurées (JSON-LD)
 * dans le <head> pour le référencement Google. C'est le moyen le plus fiable de récupérer les infos.
 */
const LeBonCoinParser: ParserStrategy = {
  canParse: (url: string) => url.includes('leboncoin.fr'),
  parse: (document: Document): CarDetails | null => {
    try {
      // 1. Essayer de récupérer le JSON-LD (Script type application/ld+json)
      // Sur LBC, cela contient souvent les infos "Product" ou "Vehicle"
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      let carData: any = null;

      scripts.forEach(script => {
        try {
          const json = JSON.parse(script.textContent || '{}');
          // On cherche un objet qui ressemble à une annonce auto
          if (json['@type'] === 'Vehicle' || (json['@type'] === 'Product' && json.category === 'Auto')) {
            carData = json;
          }
        } catch (e) {
          // Ignorer les erreurs de parsing JSON
        }
      });

      // Si on trouve des données structurées, on les utilise (C'est le plus propre)
      if (carData) {
        return {
          make: carData.brand?.name || 'Inconnu',
          model: carData.model || 'Inconnu',
          year: parseInt(carData.productionDate) || new Date().getFullYear(),
          price: parseFloat(carData.offers?.price) || 0,
          fuel: carData.fuelType || 'Inconnu', // Souvent normalisé en anglais ex: "Diesel"
          mileage: parseInt(carData.mileageFromOdometer) || 0,
          title: carData.name || document.title,
          imageUrl: carData.image?.[0] || undefined
        };
      }

      // 2. FALLBACK: Si pas de JSON, on scrappe le DOM "à la main" (Plus fragile)
      // Note: Les classes CSS de LBC changent souvent (ex: _2gTTZ).
      // Il vaut mieux viser des attributs "data-test-id" si disponibles.
      const title = document.querySelector('h1')?.innerText || '';
      
      // Extraction regex basique pour l'exemple
      const priceText = document.querySelector('[data-test-id="price"]')?.textContent; // Exemple fictif d'attribut
      const price = priceText ? parseInt(priceText.replace(/\D/g, '')) : 0;

      // Parsing du titre simpliste pour l'exemple
      const makeRegex = /(Renault|Peugeot|Citroen|Volkswagen|Audi|BMW|Mercedes)/i;
      const makeMatch = title.match(makeRegex);

      if (makeMatch) {
         return {
            make: makeMatch[0],
            model: 'Modèle détecté via Titre',
            year: 2021, // Simulé
            price: price || 15000,
            fuel: 'Diesel', // Simulé
            mileage: 100000, // Simulé
            title: title
         };
      }
      
      return null;

    } catch (error) {
      console.error("Erreur parsing LBC", error);
      return null;
    }
  }
};

/**
 * STRATÉGIE 2: GENERIC / MOCK SITE
 * Pour notre site de démo
 */
const GenericParser: ParserStrategy = {
  canParse: () => true, // Fallback par défaut
  parse: (document: Document): CarDetails | null => {
    const titleElement = document.querySelector('h1');
    const title = titleElement ? titleElement.innerText : '';

    // Détection très basique
    const makeRegex = /(Peugeot|Renault|BMW|Audi|Tesla|Volkswagen)/i;
    const yearRegex = /(20\d{2})/;
    
    const makeMatch = title.match(makeRegex);
    const yearMatch = title.match(yearRegex);

    if (!makeMatch) return null;

    // Simulation de récupération du prix depuis le DOM
    // Dans le mock React, ces données sont passées via props, mais ici on simule l'extraction
    return {
      make: makeMatch[0],
      model: 'Unknown',
      year: yearMatch ? parseInt(yearMatch[0]) : 2020,
      price: 0,
      fuel: 'Unknown',
      mileage: 0,
      title: title
    };
  }
};

/**
 * ROUTEUR PRINCIPAL
 * Choisi la bonne stratégie en fonction de l'URL
 */
export const extractCarDetailsFromDOM = (document: Document, url: string = window.location.href): CarDetails | null => {
  const strategies = [LeBonCoinParser, GenericParser];

  for (const strategy of strategies) {
    if (strategy.canParse(url)) {
      console.log(`Utilisation du parseur: ${strategy === LeBonCoinParser ? 'LeBonCoin' : 'Générique'}`);
      return strategy.parse(document);
    }
  }
  
  return null;
};