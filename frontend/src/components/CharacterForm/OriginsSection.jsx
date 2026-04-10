import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLASES, RAZAS, ALINEAMIENTOS } from './CharacterForm.constants';

export function OriginsSection({ formData, errors, onUpdateField }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        <Label className="text-[10px] text-gray-500 uppercase font-black">
          Clase Principal {!formData.npc && '*'}
        </Label>
        <Select
          value={formData.char_class || ''}
          onValueChange={(val) => onUpdateField('char_class', val)}
        >
          <SelectTrigger
            className={`w-full bg-gray-950 border-gray-800 ${errors.char_class ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            {CLASES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.char_class && (
          <p className="text-[10px] text-red-400">{errors.char_class}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] text-gray-500 uppercase font-black">
          Clase Secundaria
        </Label>
        <Select
          value={formData.secondary_class || 'none'}
          onValueChange={(val) =>
            onUpdateField('secondary_class', val === 'none' ? '' : val)
          }
        >
          <SelectTrigger className="w-full bg-gray-950 border-gray-800">
            <SelectValue placeholder="Opcional" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            <SelectItem value="none">Ninguna</SelectItem>
            {CLASES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] text-gray-500 uppercase font-black">
          Raza {!formData.npc && '*'}
        </Label>
        <Select
          value={formData.race || ''}
          onValueChange={(val) => onUpdateField('race', val)}
        >
          <SelectTrigger
            className={`w-full bg-gray-950 border-gray-800 ${errors.race ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            {RAZAS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.race && (
          <p className="text-[10px] text-red-400">{errors.race}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] text-gray-500 uppercase font-black">
          Alineamiento Moral {!formData.npc && '*'}
        </Label>
        <Select
          value={formData.alignment || ''}
          onValueChange={(val) => onUpdateField('alignment', val)}
        >
          <SelectTrigger
            className={`w-full bg-gray-950 border-gray-800 ${errors.alignment ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            {ALINEAMIENTOS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.alignment && (
          <p className="text-[10px] text-red-400">{errors.alignment}</p>
        )}
      </div>
    </div>
  );
}
