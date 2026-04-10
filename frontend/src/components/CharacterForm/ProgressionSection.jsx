import React from 'react';
import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionTitle } from './SectionTitle';
import { NIVELES } from './CharacterForm.constants';

export function ProgressionSection({
  formData,
  errors,
  onChange,
  onUpdateField,
}) {
  return (
    <div>
      <SectionTitle icon={Sparkles}>Progresión</SectionTitle>
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-gray-500 uppercase font-black">
            Nivel Actual
          </Label>
          <Select
            value={String(formData.level)}
            onValueChange={(val) => onUpdateField('level', val)}
          >
            <SelectTrigger className="w-full bg-gray-950 border-gray-800">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
              {NIVELES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Nivel {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="experience"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            Experiencia (XP)
          </Label>
          <Input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={onChange}
            className={`bg-gray-950 border-gray-800 focus:border-purple-500/50 ${errors.experience ? 'border-red-500' : ''}`}
          />
          {errors.experience && (
            <p className="text-[10px] text-red-400 font-bold">
              {errors.experience}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
