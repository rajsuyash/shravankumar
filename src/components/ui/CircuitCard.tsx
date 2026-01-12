import React from 'react';
import { Circuit } from '../../types/database';
import { Icon } from './Icon';

interface CircuitCardProps {
  circuit: Circuit;
  onDetailsClick?: () => void;
}

export const CircuitCard: React.FC<CircuitCardProps> = ({ circuit, onDetailsClick }) => {
  const difficultyBadges: Record<string, { icon: string; label: string }> = {
    'Challenging': { icon: 'altitude', label: 'High Altitude' },
    'Easy': { icon: 'accessible', label: 'Wheelchair Friendly' },
    'Moderate': { icon: 'water_drop', label: 'Coastal Route' },
  };

  const badge = difficultyBadges[circuit.difficulty_level] || difficultyBadges['Easy'];

  return (
    <div className="scroll-card flex flex-col bg-white rounded-lg overflow-hidden border border-[#e7dfda] relative group">
      {/* Scroll Accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary z-10"></div>

      {/* Image */}
      <div className="h-56 overflow-hidden relative">
        {circuit.featured_image_url ? (
          <div
            className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${circuit.featured_image_url}')` }}
          ></div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Icon name="temple_hindu" className="text-6xl text-primary opacity-30" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#181410] flex items-center gap-1">
          <Icon name={badge.icon} className="text-sm text-primary" />
          {badge.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#181410]">{circuit.name}</h3>
          <Icon name="favorite" className="text-gray-400" />
        </div>

        <p className="text-sm text-[#8d715e] mb-4 flex items-center gap-2">
          <Icon name="schedule" className="text-sm" />
          {circuit.duration_days} Days
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>{circuit.starts_from_city}</span>
        </p>

        {/* Included Services */}
        <div className="space-y-2 mb-6">
          {circuit.included_services.slice(0, 2).map((service, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-[#5a4e46]">
              <Icon name="check_circle" className="text-green-600 text-[18px]" />
              <span>{service}</span>
            </div>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="mt-auto pt-4 border-t border-[#f5f2f0] flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-lg font-bold text-primary">₹{circuit.base_price.toLocaleString()}</p>
          </div>
          <button
            onClick={onDetailsClick}
            className="px-4 py-2 rounded-lg bg-[#f8f7f5] text-[#181410] font-medium text-sm hover:bg-[#eceae5] transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
