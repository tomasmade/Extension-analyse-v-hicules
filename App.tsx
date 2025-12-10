import React, { useState, useEffect } from 'react';
import { CarListingMock } from './components/CarListingMock';
import { ExtensionWidget } from './components/ExtensionWidget';
import { CarDetails } from './types';
import { extractCarDetailsFromDOM } from './services/domParser';
import { Info } from 'lucide-react';

// Mock Data simulant une annonce Leboncoin
const LBC_MOCK_DATA = {
  make: 'Renault',
  model: 'Clio',
  year: 2019,
  price: 12500,
  fuel: 'Diesel',
  mileage: 85000,
  imageUrl: 'https://picsum.photos/id/234/800/600',
  title: 'Renault Clio 5 - 1.5 Blue dCi 85ch - Très bon état'
};

const App: React.FC = () => {
  const [detectedCar, setDetectedCar] = useState<CarDetails | null>(null);

  // Simulation du Content Script spécifiquement pour LeBonCoin
  useEffect(() => {
    setDetectedCar(null);
    // URL fictive pour déclencher le parser LBC
    const simulatedUrl = 'https://www.leboncoin.fr/voitures/123456.htm';
    
    // Simulation JSON-LD pour LBC (Technique utilisée par le vrai site)
    const scriptId = 'fake-lbc-json-ld';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@type": "Vehicle",
      "brand": { "name": LBC_MOCK_DATA.make },
      "model": LBC_MOCK_DATA.model,
      "productionDate": LBC_MOCK_DATA.year.toString(),
      "fuelType": LBC_MOCK_DATA.fuel,
      "mileageFromOdometer": LBC_MOCK_DATA.mileage,
      "offers": { "price": LBC_MOCK_DATA.price },
      "name": LBC_MOCK_DATA.title,
      "image": [LBC_MOCK_DATA.imageUrl]
    });
    document.body.appendChild(script);

    // On simule un léger délai comme dans la réalité (le temps que le script s'injecte)
    setTimeout(() => {
      const car = extractCarDetailsFromDOM(document, simulatedUrl);
      setDetectedCar(car);
    }, 200);

  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      
      {/* Header LeBonCoin simulé */}
      <header className="bg-white text-black border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-2">
              <span className="font-bold text-3xl tracking-tighter text-[#ec5a13]">leboncoin</span>
          </div>
          <button className="bg-[#ec5a13] text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-[#d64a0b] transition-colors">
            Déposer une annonce
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-8 relative max-w-7xl">
        
        {/* Banner Info Dev */}
        <div className="mb-6 flex items-center gap-3 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 max-w-6xl mx-auto text-sm">
           <Info size={18} className="flex-shrink-0 text-blue-600" />
           <p>
             <strong>Mode Simulation :</strong> Cette page reproduit la structure technique de LeBonCoin. 
             L'encart "Assistant Budget Auto" ci-dessous est injecté dynamiquement comme le ferait l'extension réelle.
           </p>
        </div>

        {/* RENDU PRINCIPAL */}
        <CarListingMock 
          car={LBC_MOCK_DATA as CarDetails} 
          isLbcMode={true}
          extensionComponent={
            detectedCar && (
              <ExtensionWidget 
                car={detectedCar} 
                mode="inline" 
              />
            )
          }
        />

      </main>
    </div>
  );
};

export default App;