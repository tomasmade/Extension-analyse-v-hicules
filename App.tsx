import React, { useState, useEffect } from 'react';
import { CarListingMock } from './components/CarListingMock';
import { ExtensionWidget } from './components/ExtensionWidget';
import { CarDetails } from './types';
import { extractCarDetailsFromDOM } from './services/domParser';
import { LucideCar, LucideInfo, LucideGlobe } from 'lucide-react';

// Mock Data pour le site générique
const GENERIC_CARS: CarDetails[] = [
  {
    id: '1',
    make: 'Peugeot',
    model: '208',
    year: 2020,
    price: 15900,
    fuel: 'Essence',
    mileage: 45000,
    imageUrl: 'https://picsum.photos/id/111/800/600',
    title: 'Peugeot 208 II 1.2 PureTech 100ch Allure',
  },
  {
    id: '2',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    price: 34900,
    fuel: 'Électrique',
    mileage: 25000,
    imageUrl: 'https://picsum.photos/id/133/800/600',
    title: 'Tesla Model 3 Standard Range Plus',
  }
];

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
  const [siteMode, setSiteMode] = useState<'generic' | 'leboncoin'>('generic');
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [detectedCar, setDetectedCar] = useState<CarDetails | null>(null);
  const [isExtensionVisible, setIsExtensionVisible] = useState(true);

  // Simulation du Content Script
  useEffect(() => {
    setDetectedCar(null);
    const simulatedUrl = siteMode === 'leboncoin' ? 'https://www.leboncoin.fr/voitures/123456.htm' : 'https://autolistings.com/ad/1';
    
    if (siteMode === 'leboncoin') {
      // Simulation JSON-LD pour LBC
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

      setTimeout(() => {
        const car = extractCarDetailsFromDOM(document, simulatedUrl);
        setDetectedCar(car);
      }, 100);

    } else {
      setDetectedCar(GENERIC_CARS[currentCarIndex]); 
    }

  }, [siteMode, currentCarIndex]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      
      {/* Barre DEV TOOLS */}
      <div className="bg-gray-800 text-gray-200 text-xs p-2 flex justify-center items-center gap-4 border-b border-gray-700 z-50">
        <span className="uppercase tracking-widest font-bold text-gray-500">Mode Développeur</span>
        <div className="flex items-center gap-2">
          <LucideGlobe size={14} />
          <span>Site simulé :</span>
          <select 
            value={siteMode} 
            onChange={(e) => setSiteMode(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-600 focus:outline-none"
          >
            <option value="generic">Site Générique (Demo)</option>
            <option value="leboncoin">LeBonCoin.fr (Intégration Native)</option>
          </select>
        </div>
      </div>

      {/* Header du "Faux Site" */}
      <header className={`${siteMode === 'leboncoin' ? 'bg-white text-black border-b border-gray-200' : 'bg-blue-900 text-white shadow-md'} p-4 sticky top-0 z-40 transition-colors duration-500`}>
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-2">
            {siteMode === 'leboncoin' ? (
              <span className="font-bold text-3xl tracking-tighter text-[#ec5a13]">leboncoin</span>
            ) : (
              <>
                <LucideCar className="w-6 h-6" />
                <h1 className="text-xl font-bold">AutoListings.com</h1>
              </>
            )}
          </div>
          {siteMode === 'leboncoin' && (
             <button className="bg-[#ec5a13] text-white px-4 py-1.5 rounded-lg font-bold text-sm">Déposer une annonce</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-8 relative max-w-7xl">
        
        {/* Navigation Demo pour site générique */}
        {siteMode === 'generic' && (
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
               <div className="flex items-center gap-2 text-gray-600">
                 <LucideInfo className="w-5 h-5 text-blue-500" />
                 <p className="text-sm">Changez de véhicule pour voir l'extension réagir.</p>
               </div>
               <div className="flex gap-2">
                  {GENERIC_CARS.map((car, idx) => (
                    <button
                      key={car.id}
                      onClick={() => setCurrentCarIndex(idx)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentCarIndex === idx 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {car.make} {car.model}
                    </button>
                  ))}
               </div>
            </div>
        )}

        {/* RENDU PRINCIPAL */}
        {siteMode === 'leboncoin' ? (
           // MODE LBC: On passe le widget comme composant enfant pour qu'il soit rendu DANS la grille
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
        ) : (
           // MODE GÉNÉRIQUE: Le widget est géré à l'extérieur (flottant)
           <CarListingMock car={GENERIC_CARS[currentCarIndex]} isLbcMode={false} />
        )}

        {/* Floating Widget (Uniquement pour le site générique maintenant) */}
        {siteMode === 'generic' && isExtensionVisible && detectedCar && (
          <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right duration-500">
             <ExtensionWidget 
                car={detectedCar} 
                mode="floating"
                onClose={() => setIsExtensionVisible(false)} 
             />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;