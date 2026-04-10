import React from 'react';
import { Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { SectionTitle } from './SectionTitle';

// D&D 5e modifier calculation
const getModifier = (score) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

export function AttributesSection({ formData, errors, onChange }) {
  const attributes = [
    ['strength', 'Fuerza (FUE)'],
    ['dexterity', 'Destreza (DES)'],
    ['constitution', 'Constitución (CON)'],
    ['intelligence', 'Inteligencia (INT)'],
    ['wisdom', 'Sabiduría (SAB)'],
    ['charisma', 'Carisma (CAR)'],
  ];

  return (
    <div>
      <SectionTitle icon={Shield}>Atributos</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {attributes.map(([key, lbl]) => (
          <div
            key={key}
            className="bg-gray-950 p-3 sm:p-4 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition-all hover:border-purple-500/30"
          >
            <div className="flex justify-between items-center w-full px-1 gap-1">
              <Label
                htmlFor={key}
                className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black truncate"
              >
                {lbl}
              </Label>
              <span className="text-purple-400 font-bold text-xs">
                {getModifier(formData[key])}
              </span>
            </div>
            <Input
              type="number"
              id={key}
              name={key}
              value={formData[key]}
              onChange={onChange}
              min={1}
              max={30}
              className={cn(
                'bg-secondary/20 border-border text-center text-2xl font-bold w-full h-12',
                errors[key] && 'border-destructive/50',
              )}
            />
            {errors[key] && (
              <p className="text-[9px] text-red-400 font-bold text-center">
                {errors[key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
