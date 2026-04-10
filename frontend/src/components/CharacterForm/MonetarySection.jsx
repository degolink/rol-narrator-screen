import React from 'react';
import { Zap } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { CoinUpdater } from '../CoinUpdater';

export function MonetarySection({ formData, onUpdateField, isEdit }) {
  if (!isEdit) return null;

  return (
    <div>
      <SectionTitle icon={Zap}>Inventario Monetario</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/40 p-3 rounded-lg border border-gray-800/50">
        <CoinUpdater
          type="platinum"
          label="Platino"
          amount={formData.platinum}
          onUpdate={(newValue) => onUpdateField('platinum', newValue)}
          colorClass="text-[#e5e4e2]"
        />
        <CoinUpdater
          type="gold"
          label="Oro"
          amount={formData.gold}
          onUpdate={(newValue) => onUpdateField('gold', newValue)}
          colorClass="text-[#ffd700]"
        />
        <CoinUpdater
          type="silver"
          label="Plata"
          amount={formData.silver}
          onUpdate={(newValue) => onUpdateField('silver', newValue)}
          colorClass="text-[#c0c0c0]"
        />
        <CoinUpdater
          type="copper"
          label="Cobre"
          amount={formData.copper}
          onUpdate={(newValue) => onUpdateField('copper', newValue)}
          colorClass="text-[#b87333]"
        />
      </div>
    </div>
  );
}
