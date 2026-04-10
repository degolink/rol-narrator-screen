import React from 'react';
import { BookOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SectionTitle } from './SectionTitle';

export function NarrativeSection({ formData, onChange }) {
  return (
    <div>
      <SectionTitle icon={BookOpen}>Trasfondo</SectionTitle>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="background_story"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            Historia
          </Label>
          <Textarea
            id="background_story"
            name="background_story"
            value={formData.background_story}
            onChange={onChange}
            placeholder="Narra los orígenes de tu personaje..."
            className="bg-gray-950 border-gray-800 min-h-[100px] text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="motivations"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            Motivaciones y Objetivos
          </Label>
          <Textarea
            id="motivations"
            name="motivations"
            value={formData.motivations}
            onChange={onChange}
            placeholder="¿Qué impulsa a tu héroe a la aventura?"
            className="bg-gray-950 border-gray-800 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
