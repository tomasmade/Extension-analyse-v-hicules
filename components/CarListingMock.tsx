import React from 'react';
import { CarDetails } from '../types';
import { LucideMapPin, LucideCalendar, LucideGauge, LucideFuel, LucideHeart, LucideShare2 } from 'lucide-react';

interface CarListingMockProps {
  car: CarDetails;
  isLbcMode?: boolean;
  extensionComponent?: React.ReactNode; // Permet d'injecter l'extension directement dans le layout
}

export const CarListingMock: React.FC<CarListingMockProps> = ({ car, isLbcMode = false, extensionComponent }) => {
  
  // DESIGN LEBONCOIN (Structure 2 colonnes)
  if (isLbcMode) {
    return (
      <div className="max-w-6xl mx-auto font-sans text-gray-800">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* COLONNE GAUCHE (Photos + Description) */}
          <div className="w-full lg:w-2/3 space-y-4">
            {/* Photo principale simulée */}
            <div className="bg-gray-200 rounded-lg overflow-hidden relative aspect-[4/3]">
              <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                 <button className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-700"><LucideShare2 size={20}/></button>
                 <button className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-700"><LucideHeart size={20}/></button>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                1/15
              </div>
            </div>

            {/* Titre (Mobile/Tablet view mostly, but kept here for mock simplicity) */}
            <h1 className="text-2xl font-bold text-gray-900 mt-4">{car.title}</h1>
            <div className="text-xl font-bold text-gray-900 mb-6">{car.price.toLocaleString()} €</div>

            {/* Critères */}
            <div className="border-t border-gray-200 py-6">
               <h2 className="text-lg font-bold mb-4">Critères</h2>
               <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-gray-500">Année-modèle</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kilométrage</p>
                    <p className="font-semibold">{car.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Carburant</p>
                    <p className="font-semibold">{car.fuel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Boîte de vitesse</p>
                    <p className="font-semibold">Manuelle</p>
                  </div>
               </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 py-6">
              <h2 className="text-lg font-bold mb-4">Description</h2>
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                Bonjour, je vends ma {car.make} {car.model} en excellent état.
                
                Entretiens à jour, factures à l'appui.
                Contrôle technique vierge datant de moins de 6 mois.
                
                Options:
                - Climatisation
                - Régulateur de vitesse
                - Bluetooth
                
                Véhicule visible sur rendez-vous. Pas d'échange.
              </p>
            </div>
            
             <div className="border-t border-gray-200 py-6 flex justify-end text-gray-400 text-xs">
                <span>Ref. annonce: 123456789</span>
             </div>
          </div>

          {/* COLONNE DROITE (Sidebar: Prix, Profil, ET NOTRE EXTENSION) */}
          <div className="w-full lg:w-1/3 space-y-4">
            
            {/* Bloc Vendeur LBC style */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    V
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Vendeur Particulier</div>
                    <div className="text-xs text-gray-500">2 annonces</div>
                  </div>
               </div>
               <button className="w-full bg-[#ec5a13] hover:bg-[#d84d0b] text-white font-bold py-3 rounded-lg transition-colors">
                 Acheter
               </button>
               <button className="w-full bg-[#ffe9de] hover:bg-[#ffdecf] text-[#ec5a13] font-bold py-3 rounded-lg transition-colors">
                 Envoyer un message
               </button>
            </div>

            {/* C'est ICI que l'extension s'injecte naturellement pour l'UX "Inline" */}
            {extensionComponent && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {extensionComponent}
              </div>
            )}

            {/* Bloc Localisation */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-900 mb-2">Localisation</h3>
               <div className="flex items-center gap-2 text-gray-700">
                 <LucideMapPin size={18} />
                 <span>Paris (75001)</span>
               </div>
               <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                 [Carte Simulée]
               </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // DESIGN GÉNÉRIQUE (Legacy demo)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative h-64 md:h-96 w-full bg-gray-200">
        <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover"/>
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
          {car.imageCount || 12} photos
        </div>
      </div>
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{car.title}</h1>
          <div className="text-3xl font-bold text-blue-600 mt-2 md:mt-0">
            {car.price.toLocaleString()} €
          </div>
        </div>
        {/* ... Reste du design générique identique ... */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <LucideCalendar size={16} /> Année
            </div>
            <span className="font-semibold">{car.year}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <LucideGauge size={16} /> Kilométrage
            </div>
            <span className="font-semibold">{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <LucideFuel size={16} /> Énergie
            </div>
            <span className="font-semibold">{car.fuel}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <LucideMapPin size={16} /> Lieu
            </div>
            <span className="font-semibold">Paris (75)</span>
          </div>
        </div>
        <div className="prose max-w-none text-gray-600">
           <p>Description générique...</p>
        </div>
      </div>
    </div>
  );
};