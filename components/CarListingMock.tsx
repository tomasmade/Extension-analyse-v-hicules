import React from 'react';
import { CarDetails } from '../types';
import { LucideMapPin, LucideCalendar, LucideGauge, LucideFuel } from 'lucide-react';

interface CarListingMockProps {
  car: CarDetails;
}

export const CarListingMock: React.FC<CarListingMockProps> = ({ car }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative h-64 md:h-96 w-full bg-gray-200">
        <img 
          src={car.imageUrl} 
          alt={car.title} 
          className="w-full h-full object-cover"
        />
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
          <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
          <p>
            Vends magnifique {car.make} {car.model} en parfait état. Entretien à jour, carnet disponible.
            Véhicule non fumeur, dort au garage. Contrôle technique OK moins de 6 mois.
            Aucun frais à prévoir.
          </p>
          <p className="mt-2">
            Options: GPS, Climatisation automatique, Radars de recul, Bluetooth, Jantes alliage...
          </p>
        </div>

        <div className="mt-8 flex gap-4">
           <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all">
             Contacter le vendeur
           </button>
           <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-bold transition-all">
             Faire une offre
           </button>
        </div>
      </div>
    </div>
  );
};