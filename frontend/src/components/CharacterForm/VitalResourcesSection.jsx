import React from 'react';
import { Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SectionTitle } from './SectionTitle';

export function VitalResourcesSection({ formData, errors, onChange }) {
  return (
    <div>
      <SectionTitle icon={Zap}>Recursos Vitales</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="hp"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            HP Actual
          </Label>
          <Input
            type="number"
            id="hp"
            name="hp"
            value={formData.hp}
            onChange={onChange}
            className={`bg-gray-950 border-gray-800 text-red-400 font-bold ${errors.hp ? 'border-red-500' : ''}`}
          />
          {errors.hp && (
            <p className="text-[9px] text-red-400 font-bold">{errors.hp}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="max_hp"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            HP Máximo
          </Label>
          <Input
            type="number"
            id="max_hp"
            name="max_hp"
            value={formData.max_hp}
            onChange={onChange}
            className={`bg-gray-950 border-gray-800 font-bold ${errors.max_hp ? 'border-red-500' : ''}`}
          />
          {errors.max_hp && (
            <p className="text-[9px] text-red-400 font-bold">{errors.max_hp}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="energy"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            Energía
          </Label>
          <Input
            type="number"
            id="energy"
            name="energy"
            value={formData.energy}
            onChange={onChange}
            className={`bg-gray-950 border-gray-800 text-blue-400 font-bold ${errors.energy ? 'border-red-500' : ''}`}
          />
          {errors.energy && (
            <p className="text-[9px] text-red-400 font-bold">{errors.energy}</p>
          )}
        </div>
      </div>
    </div>
  );
}
